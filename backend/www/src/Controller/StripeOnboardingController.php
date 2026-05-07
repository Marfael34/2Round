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
        // 1. Récupérer l'utilisateur connecté
        // $user = $this->getUser();
        // if (!$user) {
        //     return $this->json(['error' => 'Non autorisé'], 401);
        // }

        /* --- MODE TEST / MOCK EN ATTENDANT L'ENTITÉ USER --- */
        // Pour l'instant, on simule un vendeur (à remplacer par ton vrai User)
        $sellerEmail = 'vendeur.test@2round.fr';
        $stripeAccountId = null; // Normalement : $user->getStripeAccountId();
        /* -------------------------------------------------- */

        try {
            // 2. Si le vendeur n'a pas encore de compte Stripe Express, on lui en crée un
            if (!$stripeAccountId) {
                $account = $stripeService->createExpressAccount($sellerEmail);
                $stripeAccountId = $account->id;

                // TODO : Sauvegarder l'ID dans la base de données
                // $user->setStripeAccountId($stripeAccountId);
                // $em->flush();
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
}
