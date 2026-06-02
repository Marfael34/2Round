<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\WalletTransaction;
use App\Service\MondialRelayService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class WalletCheckoutController extends AbstractController
{
    #[Route('/api/orders/wallet-checkout', name: 'api_wallet_checkout', methods: ['POST'])]
    public function handleWalletCheckout(
        Request $request,
        EntityManagerInterface $em,
        UserInterface $user,
        MondialRelayService $mondialRelayService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $conversationId = $data['conversationId'] ?? null;
        $amountCents = $data['amount'] ?? null; // in cents
        $relayId = $data['relayId'] ?? null;
        
        if (!$conversationId || !$amountCents) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }

        $userEntity = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if (!$userEntity) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Fetch wallet and check balance
        $wallet = $userEntity->getWallet();
        $balance = $wallet ? (float) $wallet->getBalance() : 0.0;
        $amountEuros = $amountCents / 100;

        if ($balance < $amountEuros) {
            return $this->json(['error' => 'Solde insuffisant dans votre portefeuille'], 400);
        }

        try {
            $conversation = $em->getRepository(Conversation::class)->find($conversationId);
            if (!$conversation) {
                return $this->json(['error' => 'Conversation introuvable'], 404);
            }

            $product = $conversation->getProductId();
            if (!$product) {
                return $this->json(['error' => 'Produit introuvable'], 404);
            }

            // Déduire le montant du portefeuille
            $wallet->setBalance((string) ($balance - $amountEuros));

            // Créer une transaction de paiement sortant
            $tx = new WalletTransaction();
            $tx->setUser($userEntity);
            $tx->setAmount((string) $amountEuros);
            $tx->setType('purchase');
            $tx->setStatus('completed');
            $tx->setReference('Achat Produit #' . $product->getId());
            $em->persist($tx);

            // Création systématique d'une nouvelle commande
            $order = new Order();
            $order->setNumber('CMD-' . strtoupper(substr(uniqid(), -6)));
            $order->setTotalprice((string)$amountEuros);
            $order->setCreatedAt(new \DateTime());
            // Calculate fees roughly based on amount
            $shippingFeesCents = 288;
            $protectionFeesCents = $amountCents - (int)round($product->getPrice() * 100) - $shippingFeesCents;
            $order->setServicesFees($protectionFeesCents > 0 ? $protectionFeesCents : 70);
            $order->setShippingFees($shippingFeesCents);
            $em->persist($order);

            $orderItem = new OrderItem();
            $orderItem->setOrders($order);
            $orderItem->setProducts($product);
            $orderItem->setPricePurchase((string)$product->getPrice());
            $order->addOrderItem($orderItem);
            $em->persist($orderItem);

            // Mettre à jour le statut
            if ($order->getStatus() !== 'paid') {
                $order->setStatus('paid');
                $product->setStatus('sold');

                // Générer le bon Mondial Relay
                $labelData = $mondialRelayService->generateShippingLabel($order, $userEntity);
                $order->setTrackingNumber($labelData['trackingNumber']);
                $order->setShippingLabelUrl($labelData['shipping_label_url']);
            }

            $em->flush();

            return $this->json([
                'status' => 'success',
                'reference' => $order->getNumber()
            ]);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
