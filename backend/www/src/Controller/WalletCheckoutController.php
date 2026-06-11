<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
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
        MondialRelayService $mondialRelayService,
        \App\Service\InvoiceService $invoiceService
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

            // Verrou pessimiste pour éviter les race conditions
            $em->getConnection()->beginTransaction();

            // Recharge le produit avec un verrou d'écriture
            $product = $em->getRepository(Product::class)->find($conversation->getProductId()->getId(), \Doctrine\DBAL\LockMode::PESSIMISTIC_WRITE);
                
                if (!$product) {
                    $em->getConnection()->rollBack();
                    return $this->json(['error' => 'Produit introuvable'], 404);
                }

                if ($product->getStatus() === 'sold') {
                    $em->getConnection()->rollBack();
                    return $this->json(['error' => 'Produit déjà vendu'], 400);
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
            
            $addressId = null;
            if (isset($data['shippingAddress'])) {
                $shippingAddress = $data['shippingAddress'];
                if (isset($shippingAddress['addressId']) && $shippingAddress['addressId']) {
                    $addressId = $shippingAddress['addressId'];
                } else {
                    $newAddress = new \App\Entity\Adress();
                    $newAddress->setLabel($shippingAddress['name'] ?? 'Mon adresse');
                    $street = $shippingAddress['street'] ?? '';
                    preg_match('/^(\d+[a-zA-Z]*)\s+(.*)$/', $street, $matches);
                    $streetNumber = !empty($matches) ? substr($matches[1], 0, 10) : '-';
                    $streetName = !empty($matches) ? $matches[2] : $street;

                    $newAddress->setStreetNumber($streetNumber);
                    $newAddress->setStreetName($streetName);
                    $newAddress->setCity($shippingAddress['city'] ?? '');
                    $newAddress->setPostalCode($shippingAddress['zip'] ?? '');
                    $newAddress->setCountry($shippingAddress['country'] ?? 'France');
                    $newAddress->setLatitude($shippingAddress['latitude'] ?? '0.00000000');
                    $newAddress->setLongitude($shippingAddress['longitude'] ?? '0.00000000');
                    $newAddress->setUser($userEntity);
                    $newAddress->setIsActive(true);
                    $em->persist($newAddress);
                    $em->flush();
                    $addressId = $newAddress->getId();
                }
            }

            if ($addressId) {
                $address = $em->getRepository(\App\Entity\Adress::class)->find($addressId);
                if ($address) {
                    $order->setAddress($address);
                }
            }

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

                // Annuler les offres obsolètes
                foreach ($product->getConversations() as $otherConv) {
                    foreach ($otherConv->getMessages() as $msg) {
                        if ($msg->getOffer()) {
                            $status = $msg->getOffer()->getStatus();
                            $isOtherConv = $otherConv->getId() !== $conversation->getId();

                            if ($status === 'pending' || ($status === 'accepted' && $isOtherConv)) {
                                $msg->getOffer()->setStatus('cancelled');
                                
                                if ($isOtherConv) {
                                    // Notifier que l'offre est annulée car l'article a été vendu
                                    $cancelMsg = new Message();
                                    $cancelMsg->setConversation($otherConv);
                                    $cancelMsg->setUsers($product->getSeller()); // Vendeur système
                                    $cancelMsg->setContent("Désolé, l'article a été vendu à un autre acheteur via le porte-monnaie. Votre offre a été automatiquement annulée.");
                                    $cancelMsg->setIsRead(false);
                                    $cancelMsg->setCreatedAt(new \DateTime());
                                    $em->persist($cancelMsg);
                                }
                            }
                        }
                    }
                }

                // Générer le bon Mondial Relay
                $labelData = $mondialRelayService->generateShippingLabel($order, $userEntity);
                $order->setTrackingNumber($labelData['trackingNumber']);
                $order->setShippingLabelUrl($labelData['shipping_label_url']);

                // Générer la facture unique de l'acheteur
                $invoiceService->generateInvoices($order, $userEntity);

                // Message système avec le bon de livraison (pour le vendeur)
                $labelMessage = new Message();
                $labelMessage->setConversation($conversation);
                $labelMessage->setUsers($product->getSeller());
                $labelMessage->setContent("[SHIPPING_LABEL] " . $labelData['shipping_label_url']);
                $labelMessage->setIsRead(false);
                $labelMessage->setCreatedAt(new \DateTime());
                $em->persist($labelMessage);

                // Message système pour confirmer l'achat global
                $buyMessage = new Message();
                $buyMessage->setConversation($conversation);
                $buyMessage->setUsers($userEntity);
                $buyMessage->setContent("L'article a été payé avec succès (" . $amountEuros . "€) via Porte-monnaie ! La commande est en préparation.");
                $buyMessage->setIsRead(false);
                $buyMessage->setCreatedAt(new \DateTime());
                $em->persist($buyMessage);
            }

            $em->flush();
            $em->getConnection()->commit();

            return $this->json([
                'status' => 'success',
                'reference' => $order->getNumber()
            ]);

        } catch (\Exception $e) {
            if ($em->getConnection()->isTransactionActive()) {
                $em->getConnection()->rollBack();
            }
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
