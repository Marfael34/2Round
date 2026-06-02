<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Entity\Conversation;
use App\Entity\Message;
use App\Service\InvoiceService;
use App\Service\MondialRelayService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PaymentSuccessController extends AbstractController
{
    #[Route('/api/orders/payment-success', name: 'api_payment_success', methods: ['POST'])]
    public function handlePaymentSuccess(
        Request $request,
        EntityManagerInterface $em,
        InvoiceService $invoiceService,
        MondialRelayService $mondialRelayService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $conversationId = $data['conversationId'] ?? null;
        $amount = $data['amount'] ?? null; // in cents
        
        if (!$conversationId || !$amount) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        try {
            $conversation = $em->getRepository(Conversation::class)->find($conversationId);
            if (!$conversation) {
                return $this->json(['error' => 'Conversation not found'], 404);
            }

            $product = $conversation->getProductId();
            if (!$product) {
                return $this->json(['error' => 'Product not found'], 404);
            }

            // Obtenir le prix de l'article (offre acceptée ou prix du produit)
            $offer = null;
            foreach ($conversation->getMessages() as $message) {
                if ($message->getOffer() && $message->getOffer()->getStatus() === 'accepted') {
                    $offer = $message->getOffer();
                    break;
                }
            }
            
            if (!$offer) {
                // If there's no offer on the conversation directly, we check messages just in case, but let's use product price
                $itemPriceEuros = (float)$product->getPrice();
            } else {
                $itemPriceEuros = (float)$offer->getAmount();
            }

            // Calculer les frais
            $shippingFeesCents = 288; // Frais de port constants 2.88€
            $protectionFeesCents = 70 + (int)round(($itemPriceEuros * 100) * 0.05); // 0.70€ + 5% du prix de l'article
            $totalAmountCents = (int)round($itemPriceEuros * 100) + $shippingFeesCents + $protectionFeesCents;

            // Création systématique d'une nouvelle commande
            $order = new Order();
            $order->setNumber('CMD-' . strtoupper(substr(uniqid(), -6)));
            $order->setTotalprice((string)($totalAmountCents / 100)); // En euros
            $order->setStatus('pending_payment');
            $order->setCreatedAt(new \DateTime());
            $order->setServicesFees($protectionFeesCents);
            $order->setShippingFees($shippingFeesCents);
            $em->persist($order);

            $orderItem = new OrderItem();
            $orderItem->setOrders($order);
            $orderItem->setProducts($product);
            $orderItem->setPricePurchase((string)$itemPriceEuros);
            $order->addOrderItem($orderItem);
            $em->persist($orderItem);

            // Mettre à jour le statut
            if ($order->getStatus() !== 'paid') {
                $order->setStatus('paid');
                $product->setStatus('sold');

                // Générer le bon Mondial Relay
                $labelData = $mondialRelayService->generateShippingLabel($order, $conversation->getBuyer());
                $order->setTrackingNumber($labelData['trackingNumber']);
                $order->setShippingLabelUrl($labelData['shipping_label_url']);

                // Générer les factures
                $buyer = $conversation->getBuyer();
                if ($buyer) {
                    $invoiceService->generateInvoices($order, $buyer);
                }

                // Message système avec le bon de livraison (pour le vendeur)
                $labelMessage = new Message();
                $labelMessage->setConversation($conversation);
                $labelMessage->setUsers($product->getSeller()); // Le vendeur envoie ce message "système"
                $labelMessage->setContent("[SHIPPING_LABEL] " . $labelData['shipping_label_url']);
                $labelMessage->setIsRead(false);
                $labelMessage->setCreatedAt(new \DateTime());
                $em->persist($labelMessage);

                // Message système pour confirmer l'achat global
                $buyMessage = new Message();
                $buyMessage->setConversation($conversation);
                $buyMessage->setUsers($buyer); // L'acheteur envoie ce message
                $buyMessage->setContent("L'article a été payé avec succès (" . ($amount / 100) . "€) ! La commande est en préparation.");
                $buyMessage->setIsRead(false);
                $buyMessage->setCreatedAt(new \DateTime());
                $em->persist($buyMessage);

                $em->flush();
            }

            return $this->json(['status' => 'success', 'orderNumber' => $order->getNumber()]);
        } catch (\Throwable $e) {
            file_put_contents(__DIR__ . '/../../payment_error.log', $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
