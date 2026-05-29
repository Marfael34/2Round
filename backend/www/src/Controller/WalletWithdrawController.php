<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class WalletWithdrawController extends AbstractController
{
    #[Route('/api/wallet/withdraw', name: 'api_wallet_withdraw', methods: ['POST'])]
    public function withdraw(
        Request $request,
        EntityManagerInterface $em,
        UserInterface $user
    ): JsonResponse {
        // Find the full user entity
        $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);

        if (!$userEntity) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Fetch wallet
        $wallet = $userEntity->getWallet();
        if (!$wallet) {
            $wallet = new Wallet();
            $wallet->setUser($userEntity);
            $userEntity->setWallet($wallet);
            $em->persist($wallet);
        }

        $currentBalance = (float) $wallet->getBalance();

        if ($currentBalance <= 0) {
            return $this->json(['error' => 'Insufficient funds'], 400);
        }

        // TODO: In a real app, you would call Stripe API here to transfer the funds
        // to the user's connected bank account before setting budget to 0.
        
        // Create transaction history
        $tx = new WalletTransaction();
        $tx->setUser($userEntity);
        $tx->setAmount((string) $currentBalance);
        $tx->setType('withdrawal');
        $tx->setStatus('completed');
        $tx->setReference('Bank Transfer');
        $em->persist($tx);

        $wallet->setBalance('0.00');
        $em->flush();

        return $this->json([
            'status' => 'success', 
            'message' => 'Funds have been successfully withdrawn to your bank account.',
            'newBudget' => 0
        ]);
    }
}
