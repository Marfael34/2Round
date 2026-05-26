<?php

namespace App\Controller;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class StripeCheckoutController extends AbstractController
{
    public function __construct(
        #[Autowire(env: 'STRIPE_SECRET_KEY')]
        private string $stripeSecretKey,

        #[Autowire(env: 'FRONTEND_URL')]
        private string $frontendUrl
    ) {}

    #[Route('/api/stripe/create-checkout-session', name: 'api_stripe_checkout', methods: ['POST'])]
    public function createCheckoutSession(Request $request): JsonResponse
    {
        Stripe::setApiKey($this->stripeSecretKey);

        $data = json_decode($request->getContent(), true);

        $productName = $data['productName'] ?? 'Article 2Round';
        $amount = $data['amount'] ?? 0; // Montant total en centimes
        $conversationId = $data['conversationId'] ?? null;
        $productId = $data['productId'] ?? null;
        $buyerId = $data['buyerId'] ?? null;

        if ($amount <= 0) {
            return $this->json(['error' => 'Le montant doit être supérieur à 0.'], 400);
        }

        try {
            $origin = $request->headers->get('origin');
            if (!$origin) {
                $origin = $this->frontendUrl;
            }

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $productName,
                            'description' => 'Achat sécurisé via 2Round',
                        ],
                        'unit_amount' => (int) $amount, // en centimes
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $origin . '/conversation?paymentSuccess=true&conversationId=' . $conversationId . '&amount=' . $amount,
                'cancel_url' => $origin . '/conversation?paymentCancelled=true&conversationId=' . $conversationId,
                'metadata' => [
                    'conversationId' => $conversationId,
                    'productId' => $productId,
                    'buyerId' => $buyerId,
                ],
                'payment_intent_data' => [
                    'transfer_group' => 'CONV_' . $conversationId,
                ],
            ]);

            return $this->json([
                'url' => $session->url,
                'sessionId' => $session->id,
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
