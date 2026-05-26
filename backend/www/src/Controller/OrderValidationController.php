<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\Conversation;
use App\Entity\Message;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class OrderValidationController extends AbstractController
{
    #[Route('/api/orders/validate-reception', name: 'api_validate_reception', methods: ['POST'])]
    public function validateReception(
        Request $request,
        EntityManagerInterface $em,
        StripeService $stripeService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $conversationId = $data['conversationId'] ?? null;

        if (!$orderId || !$conversationId) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        $order = $em->getRepository(Order::class)->find($orderId);
        $conversation = $em->getRepository(Conversation::class)->find($conversationId);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], 404);
        }
        if (!$conversation) {
            return $this->json(['error' => 'Conversation not found'], 404);
        }

        if ($order->getStatus() === 'completed') {
            return $this->json(['error' => 'Order already completed'], 400);
        }

        $order->setStatus('completed');

        // Récupérer le vendeur depuis le produit
        $product = $conversation->getProductId();
        $seller = $product ? $product->getSeller() : null;

        if ($seller) {
            $sellerAccountId = $seller->getStripeAccountId();
            
            // Transfert de l'argent vers le vendeur si compte Stripe configuré
            if ($sellerAccountId) {
                try {
                    $orderItems = $order->getOrderItems();
                    if (count($orderItems) > 0) {
                        $orderItem = $orderItems->first();
                        $pricePurchase = (float) $orderItem->getPricePurchase();
                        
                        // Ajouter au budget (portefeuille) du vendeur
                        $currentBudget = $seller->getBudget() ?? 0;
                        $seller->setBudget($currentBudget + $pricePurchase);

                        $amountToTransfer = (int) ($pricePurchase * 100);
                        
                        $stripeService->transferToSeller(
                            $amountToTransfer,
                            'eur',
                            $sellerAccountId,
                            'CONV_' . $conversation->getId()
                        );
                    }
                } catch (\Exception $e) {
                    // Log the error but continue to validate the order locally
                }
            } else {
                // Même s'il n'a pas de compte Stripe, on crédite son portefeuille virtuel
                $orderItems = $order->getOrderItems();
                if (count($orderItems) > 0) {
                    $orderItem = $orderItems->first();
                    $pricePurchase = (float) $orderItem->getPricePurchase();
                    $currentBudget = $seller->getBudget() ?? 0;
                    $seller->setBudget($currentBudget + $pricePurchase);
                }
            }

            // Message système
            $msg = new Message();
            $msg->setConversation($conversation);
            $msg->setUsers($seller);
            $msg->setContent("L'acheteur a bien reçu l'article. La transaction est finalisée et l'argent a été débloqué !");
            $msg->setIsRead(false);
            $msg->setCreatedAt(new \DateTime());
            $em->persist($msg);
        }

        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Reception validated']);
    }

    #[Route('/api/orders/validate-shipping', name: 'api_validate_shipping', methods: ['POST'])]
    public function validateShipping(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $conversationId = $data['conversationId'] ?? null;

        if (!$orderId || !$conversationId) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        $order = $em->getRepository(Order::class)->find($orderId);
        $conversation = $em->getRepository(Conversation::class)->find($conversationId);

        if (!$order || !$conversation) {
            return $this->json(['error' => 'Order or Conversation not found'], 404);
        }

        if ($order->getStatus() !== 'paid') {
            return $this->json(['error' => 'Order must be paid to be shipped'], 400);
        }

        $order->setStatus('shipped');

        // Message système
        $msg = new Message();
        $msg->setConversation($conversation);
        $msg->setUsers($conversation->getBuyer()); // ou système
        $msg->setContent("Le vendeur a déposé le colis au point relais. Il est en route !");
        $msg->setIsRead(false);
        $msg->setCreatedAt(new \DateTime());
        $em->persist($msg);

        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Shipping validated']);
    }

    #[Route('/api/orders/dispute', name: 'api_dispute_order', methods: ['POST'])]
    public function disputeOrder(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;
        $conversationId = $data['conversationId'] ?? null;

        if (!$orderId || !$conversationId) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        $order = $em->getRepository(Order::class)->find($orderId);
        $conversation = $em->getRepository(Conversation::class)->find($conversationId);

        if (!$order || !$conversation) {
            return $this->json(['error' => 'Order or Conversation not found'], 404);
        }

        if ($order->getStatus() === 'completed') {
            return $this->json(['error' => 'Cannot dispute a completed order'], 400);
        }

        $order->setStatus('disputed');

        // Message système
        $msg = new Message();
        $msg->setConversation($conversation);
        $msg->setUsers($conversation->getBuyer()); // ou système
        $msg->setContent("⚠️ L'acheteur a signalé un problème avec la commande. Les fonds sont gelés. Veuillez trouver une solution à l'amiable ici. Si nécessaire, contactez le support 2Round.");
        $msg->setIsRead(false);
        $msg->setCreatedAt(new \DateTime());
        $em->persist($msg);

        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Order disputed']);
    }

    #[Route('/api/orders/for-conversation/{id}', name: 'api_get_conversation_order', methods: ['GET'])]
    public function getOrderForConversation(
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
        $conversation = $em->getRepository(Conversation::class)->find($id);
        if (!$conversation) {
            return $this->json(['error' => 'Conversation not found'], 404);
        }

        $product = $conversation->getProductId();
        if (!$product) {
            return $this->json(null);
        }

        $orderItem = $em->getRepository(\App\Entity\OrderItem::class)->findOneBy(['products' => $product]);
        if (!$orderItem || !$orderItem->getOrders()) {
            return $this->json(null);
        }

        $order = $orderItem->getOrders();

        // Return relevant order details
        return $this->json([
            'id' => $order->getId(),
            'number' => $order->getNumber(),
            'status' => $order->getStatus(),
            'totalprice' => $order->getTotalprice(),
            'trackingNumber' => $order->getTrackingNumber(),
            'shippingLabelUrl' => $order->getShippingLabelUrl()
        ]);
    }
}
