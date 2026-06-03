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

            $type = $data['type'] ?? 'order';
            $transferGroup = $conversationId ? 'CONV_' . $conversationId : 'PROD_' . $productId . '_USER_' . $buyerId;
            
            if ($type === 'boost') {
                $successUrl = $origin . '/my-locker?boostSuccess=true&productId=' . ($productId ?? '');
                $cancelUrl = $origin . '/my-locker';
            } else {
                $successUrl = $origin . '/conversation?paymentSuccess=true&conversationId=' . ($conversationId ?? '') . '&productId=' . ($productId ?? '') . '&amount=' . $amount;
                $cancelUrl = $conversationId 
                    ? $origin . '/conversation?paymentCancelled=true&conversationId=' . $conversationId 
                    : $origin . '/product/' . $productId;
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
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'conversationId' => $conversationId,
                    'productId' => $productId,
                    'buyerId' => $buyerId,
                ],
                'payment_intent_data' => [
                    'transfer_group' => $transferGroup,
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
