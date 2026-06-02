<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use App\Entity\Report;
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
                        
                        $amountToTransfer = (int) ($pricePurchase * 100);
                        
                        // Ajouter au portefeuille (Wallet) du vendeur
                        $wallet = $seller->getWallet();
                        if (!$wallet) {
                            $wallet = new Wallet();
                            $wallet->setUser($seller);
                            $seller->setWallet($wallet);
                            $em->persist($wallet);
                        }
                        $currentBalance = (float) $wallet->getBalance();
                        $wallet->setBalance((string) ($currentBalance + $pricePurchase));

                        $stripeService->transferToSeller(
                            $amountToTransfer,
                            'eur',
                            $sellerAccountId,
                            'CONV_' . $conversation->getId()
                        );

                        // Enregistrer la transaction
                        $tx = new WalletTransaction();
                        $tx->setUser($seller);
                        $tx->setAmount((string) $pricePurchase);
                        $tx->setType('sale');
                        $tx->setStatus('completed');
                        $tx->setReference($order->getNumber() ?? 'CONV_' . $conversation->getId());
                        $em->persist($tx);
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

                    // Ajouter au portefeuille (Wallet) du vendeur
                    $wallet = $seller->getWallet();
                    if (!$wallet) {
                        $wallet = new Wallet();
                        $wallet->setUser($seller);
                        $seller->setWallet($wallet);
                        $em->persist($wallet);
                    }
                    $currentBalance = (float) $wallet->getBalance();
                    $wallet->setBalance((string) ($currentBalance + $pricePurchase));

                    // Enregistrer la transaction
                    $tx = new WalletTransaction();
                    $tx->setUser($seller);
                    $tx->setAmount((string) $pricePurchase);
                    $tx->setType('sale');
                    $tx->setStatus('completed');
                    $tx->setReference($order->getNumber() ?? 'CONV_' . $conversation->getId());
                    $em->persist($tx);
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
        $reason = $data['reason'] ?? 'Litige transaction';
        $description = $data['description'] ?? 'Aucune description fournie.';

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

        // Créer le signalement
        $report = new Report();
        $report->setReason(substr($reason, 0, 50));
        $report->setDescription($description);
        $report->setCreatedAt(new \DateTime());
        $report->setSender($conversation->getBuyer());
        $report->setOrderid($order);
        $report->setConversation($conversation);
        
        $product = $conversation->getProductId();
        if ($product) {
            $report->setProduct($product);
            $report->setReportedUser($product->getSeller());
        }

        $em->persist($report);

        // Message système
        $msg = new Message();
        $msg->setConversation($conversation);
        $msg->setUsers($conversation->getBuyer()); // ou système
        $msg->setContent("⚠️ L'acheteur a signalé un problème : \"$reason\". Les fonds sont gelés. L'administration a reçu le signalement. Veuillez trouver une solution à l'amiable ici.");
        $msg->setIsRead(false);
        $msg->setCreatedAt(new \DateTime());
        $em->persist($msg);

        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Order disputed and reported']);
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

        $orderItems = $em->getRepository(\App\Entity\OrderItem::class)->findBy(
            ['products' => $product],
            ['id' => 'DESC'],
            1
        );
        $orderItem = count($orderItems) > 0 ? $orderItems[0] : null;

        if (!$orderItem || !$orderItem->getOrders()) {
            return $this->json(null);
        }

        $order = $orderItem->getOrders();

        // Return relevant order details
        return $this->json([
            'id' => $order->getId(),
            'number' => $order->getNumber(),
            'status' => $order->getStatus(),
            'totalPrice' => $order->getTotalprice(),
            'trackingNumber' => $order->getTrackingNumber(),
            'shippingLabelUrl' => $order->getShippingLabelUrl(),
        ]);
    }

    #[Route('/api/admin/orders/force-payment', name: 'api_admin_force_payment', methods: ['POST'])]
    public function forcePayment(
        Request $request,
        EntityManagerInterface $em,
        StripeService $stripeService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;

        if (!$orderId) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        $order = $em->getRepository(Order::class)->find($orderId);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], 404);
        }

        if ($order->getStatus() === 'completed') {
            return $this->json(['error' => 'Order already completed'], 400);
        }

        $order->setStatus('completed');

        // Récupérer le vendeur depuis le premier item de la commande
        $orderItems = $order->getOrderItems();
        if (count($orderItems) === 0) {
            return $this->json(['error' => 'No items in order'], 400);
        }
        
        $orderItem = $orderItems->first();
        $product = $orderItem->getProducts();
        $seller = $product ? $product->getSeller() : null;

        // Trouver la conversation (via l'acheteur dans la facture)
        $conversation = null;
        if ($product) {
            $invoices = $order->getInvoices();
            if (count($invoices) > 0) {
                $buyer = $invoices->first()->getUsers();
                if ($buyer) {
                    $conversation = $em->getRepository(Conversation::class)->findOneBy([
                        'productId' => $product,
                        'buyer' => $buyer
                    ]);
                }
            }
        }

        if ($conversation) {
            $msg = new Message();
            $msg->setConversation($conversation);
            // $msg->setUsers(null) if system, or just the seller/buyer
            if ($seller) $msg->setUsers($seller);
            $msg->setContent("⚖️ L'administration de 2Round a statué sur le litige en faveur du VENDEUR. Les fonds ont été débloqués.");
            $msg->setIsRead(false);
            $msg->setCreatedAt(new \DateTime());
            $em->persist($msg);
        }

        if ($seller) {
            $sellerAccountId = $seller->getStripeAccountId();
            $pricePurchase = (float) $orderItem->getPricePurchase();
            $amountToTransfer = (int) ($pricePurchase * 100);
            
            // Ajouter au portefeuille (Wallet) du vendeur
            $wallet = $seller->getWallet();
            if (!$wallet) {
                $wallet = new Wallet();
                $wallet->setUser($seller);
                $seller->setWallet($wallet);
                $em->persist($wallet);
            }
            $currentBalance = (float) $wallet->getBalance();
            $wallet->setBalance((string) ($currentBalance + $pricePurchase));

            // Enregistrer la transaction Wallet
            $tx = new WalletTransaction();
            $tx->setUser($seller);
            $tx->setAmount((string) $pricePurchase);
            $tx->setType('sale');
            $tx->setStatus('completed');
            $tx->setReference($order->getNumber());
            $em->persist($tx);

            // Transfert Stripe si configuré
            if ($sellerAccountId) {
                try {
                    $stripeService->transferToSeller(
                        $amountToTransfer,
                        'eur',
                        $sellerAccountId,
                        $order->getNumber()
                    );
                } catch (\Exception $e) {
                    // Log the error but continue
                }
            }
        }

        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Payment forced successfully']);
    }

    #[Route('/api/admin/orders/refund', name: 'api_admin_refund', methods: ['POST'])]
    public function refundOrder(
        Request $request,
        EntityManagerInterface $em,
        StripeService $stripeService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $orderId = $data['orderId'] ?? null;

        if (!$orderId) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        $order = $em->getRepository(Order::class)->find($orderId);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], 404);
        }

        if ($order->getStatus() === 'cancelled') {
            return $this->json(['error' => 'Order already cancelled/refunded'], 400);
        }

        $order->setStatus('cancelled');

        // Note: Stripe refund is omitted here if we don't store stripe_payment_intent_id.
        // If the buyer paid via Wallet, we should refund their wallet.
        // For simplicity, we just mark it cancelled and the admin can manually manage the refund on Stripe.

        // Trouver la conversation et envoyer un message
        $orderItems = $order->getOrderItems();
        if (count($orderItems) > 0) {
            $product = $orderItems->first()->getProducts();
            if ($product) {
                $invoices = $order->getInvoices();
                if (count($invoices) > 0) {
                    $buyer = $invoices->first()->getUsers();
                    if ($buyer) {
                        $conversation = $em->getRepository(Conversation::class)->findOneBy([
                            'productId' => $product,
                            'buyer' => $buyer
                        ]);
                        if ($conversation) {
                            $msg = new Message();
                            $msg->setConversation($conversation);
                            $msg->setUsers($buyer);
                            $msg->setContent("⚖️ L'administration de 2Round a statué sur le litige en faveur de l'ACHETEUR. La commande est annulée et vous serez remboursé.");
                            $msg->setIsRead(false);
                            $msg->setCreatedAt(new \DateTime());
                            $em->persist($msg);
                        }
                    }
                }
            }
        }
        
        $em->flush();

        return $this->json(['status' => 'success', 'message' => 'Order refunded/cancelled']);
    }
}
