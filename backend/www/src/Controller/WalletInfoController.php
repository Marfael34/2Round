<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class WalletInfoController extends AbstractController
{
    #[Route('/api/wallet/info', name: 'api_wallet_info', methods: ['GET'])]
    public function getWalletInfo(EntityManagerInterface $em, UserInterface $user): JsonResponse
    {
        $userEntity = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if (!$userEntity) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Pending funds
        $pendingFunds = 0;
        $orderItems = $em->getRepository(OrderItem::class)->findAll();
        foreach ($orderItems as $item) {
            $product = $item->getProducts();
            if ($product && $product->getSeller() === $userEntity) {
                $order = $item->getOrders();
                if ($order && in_array($order->getStatus(), ['paid', 'shipped', 'disputed'])) {
                    $pendingFunds += (float) $item->getPricePurchase();
                }
            }
        }

        // Transactions & Available funds
        $transactions = [];
        $wallet = $userEntity->getWallet();
        $availableFunds = $wallet ? (float) $wallet->getBalance() : 0;
        
        try {
            $txs = $em->getRepository(WalletTransaction::class)->findBy(['user' => $userEntity], ['createdAt' => 'DESC']);
            foreach ($txs as $tx) {
                $transactions[] = [
                    'id' => $tx->getId(),
                    'amount' => (float) $tx->getAmount(),
                    'type' => $tx->getType(),
                    'status' => $tx->getStatus(),
                    'reference' => $tx->getReference(),
                    'createdAt' => $tx->getCreatedAt()->format('c')
                ];
            }
        } catch (\Exception $e) {
            // Table doesn't exist yet
        }

        return $this->json([
            'available' => $availableFunds,
            'pending' => $pendingFunds,
            'transactions' => $transactions
        ]);
    }
}
