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

        $conversation = $em->getRepository(Conversation::class)->find($conversationId);
        if (!$conversation) {
            return $this->json(['error' => 'Conversation not found'], 404);
        }

        $product = $conversation->getProductId();
        if (!$product) {
            return $this->json(['error' => 'Product not found'], 404);
        }

        // Chercher une commande existante (créée par OfferAcceptedSubscriber par ex.)
        // Ou en créer une nouvelle si achat direct
        $orderItem = $em->getRepository(OrderItem::class)->findOneBy(['products' => $product]);
        $order = $orderItem ? $orderItem->getOrders() : null;

        if (!$order) {
            // Achat direct sans offre préalable
            $order = new Order();
            $order->setNumber('CMD-' . strtoupper(substr(uniqid(), -6)));
            $order->setTotalprice((string)($amount / 100)); // En euros
            $order->setStatus('pending_payment');
            $order->setCreatedAt(new \DateTime());
            $order->setServicesFees(250);
            $order->setShippingFees(490);
            $em->persist($order);

            $orderItem = new OrderItem();
            $orderItem->setOrders($order);
            $orderItem->setProducts($product);
            $orderItem->setPricePurchase((string)($amount / 100));
            $em->persist($orderItem);
        }

        // Mettre à jour le statut
        if ($order->getStatus() !== 'paid') {
            $order->setStatus('paid');
            $product->setSold(true);

            // Générer le bon Mondial Relay
            $labelData = $mondialRelayService->generateShippingLabel($order);
            $order->setTrackingNumber($labelData['trackingNumber']);
            $order->setShippingLabelUrl($labelData['shipping_label_url']);

            // Générer les factures
            // Le buyer est l'acheteur de la conversation
            $buyer = $conversation->getBuyer();
            if ($buyer) {
                $invoiceService->generateInvoices($order, $buyer);
            }

            // Message système avec le bon de livraison (pour le vendeur)
            $labelMessage = new Message();
            $labelMessage->setConversation($conversation);
            $labelMessage->setUsers($product->getSeller()); // Le vendeur envoie ce message "système" à la conversation
            $labelMessage->setContent("[SHIPPING_LABEL] " . $labelData['shipping_label_url']);
            $labelMessage->setIsRead(false);
            $labelMessage->setCreatedAt(new \DateTime());
            $em->persist($labelMessage);

            // Message système pour confirmer l'achat global (pour les deux)
            $buyMessage = new Message();
            $buyMessage->setConversation($conversation);
            $buyMessage->setUsers($buyer); // L'acheteur envoie ce message de confirmation
            $buyMessage->setContent("L'article a été payé avec succès (" . ($amount / 100) . "€) ! La commande est en préparation.");
            $buyMessage->setIsRead(false);
            $buyMessage->setCreatedAt(new \DateTime());
            $em->persist($buyMessage);

            $em->flush();
        }

        return $this->json(['status' => 'success', 'orderNumber' => $order->getNumber()]);
    }
}
