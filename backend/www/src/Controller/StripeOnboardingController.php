<?php

namespace App\Controller;

use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class StripeOnboardingController extends AbstractController
{
    #[Route('/api/seller/onboarding', name: 'api_seller_onboarding', methods: ['POST'])]
    public function onboard(StripeService $stripeService, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $userEntity = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        
        $sellerEmail = $userEntity->getEmail();
        $stripeAccountId = $userEntity->getStripeAccountId();

        try {
            // 2. Si le vendeur n'a pas encore de compte Stripe Express, on lui en crée un
            if (!$stripeAccountId) {
                $account = $stripeService->createExpressAccount($sellerEmail);
                $stripeAccountId = $account->id;

                $userEntity->setStripeAccountId($stripeAccountId);
                $em->flush();
            }

            // 3. Générer le lien d'onboarding (KYC)
            $accountLink = $stripeService->createAccountLink($stripeAccountId);

            // 4. Renvoyer l'URL au Frontend React pour qu'il redirige l'utilisateur
            return $this->json([
                'url' => $accountLink->url
            ]);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/api/seller/dashboard', name: 'api_seller_dashboard', methods: ['GET'])]
    public function dashboard(StripeService $stripeService, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $userEntity = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        $stripeAccountId = $userEntity->getStripeAccountId();

        if (!$stripeAccountId) {
            return $this->json(['error' => 'Aucun compte Stripe configuré'], 400);
        }

        try {
            $loginLink = $stripeService->createLoginLink($stripeAccountId);
            return $this->json([
                'url' => $loginLink->url
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }
}
