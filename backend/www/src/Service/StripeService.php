<?php

namespace App\Service;

use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\PaymentIntent;
use Stripe\Transfer;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class StripeService
{
    public function __construct(
        #[Autowire(env: 'STRIPE_SECRET_KEY')]
        private string $stripeSecretKey,
        
        #[Autowire(env: 'FRONTEND_URL')]
        private string $frontendUrl
    ) {
        // Initialisation globale du SDK avec la clé secrète
        Stripe::setApiKey($this->stripeSecretKey);
    }

    /**
     * 1. Onboarding Vendeur (US.V.1)
     * Crée un compte "Express" pour le vendeur sur Stripe.
     * Cette méthode doit être appelée quand le vendeur décide de configurer ses paiements.
     */
    public function createExpressAccount(string $email): Account
    {
        return Account::create([
            'type' => 'express',
            'email' => $email,
            'capabilities' => [
                'transfers' => ['requested' => true],
            ],
        ]);
    }

    /**
     * Génère le lien sécurisé Stripe pour que le vendeur remplisse ses infos (KYC, RIB).
     */
    public function createAccountLink(string $accountId): AccountLink
    {
        return AccountLink::create([
            'account' => $accountId,
            'refresh_url' => $this->frontendUrl . '/seller/onboarding/refresh',
            'return_url' => $this->frontendUrl . '/seller/onboarding/success',
            'type' => 'account_onboarding',
        ]);
    }

    /**
     * 2. Paiement Escrow (Séquestre)
     * Crée un PaymentIntent lors de la validation du panier.
     * L'argent arrive sur le compte de la plateforme et est "tagué" pour ce vendeur.
     * 
     * @param int $amount Montant total en centimes (ex: 100€ = 10000)
     * @param string $transferGroup ID unique (ex: l'ID du Pack ou de la Transaction)
     * @param string $sellerAccountId L'ID Stripe du compte Express du vendeur
     */
    public function createEscrowPaymentIntent(int $amount, string $currency, string $transferGroup, string $sellerAccountId): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount,
            'currency' => $currency,
            'transfer_group' => $transferGroup, // Lier le paiement au futur transfert
            'on_behalf_of' => $sellerAccountId, // Indique que c'est fait pour le compte du vendeur
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
    }

    /**
     * 3. Libération des fonds (Transferts)
     * Transfère l'argent du compte Plateforme vers le compte Express du vendeur.
     * Appelé uniquement si TransactionStatus passe à COMPLETED ou si forcé par l'admin.
     * 
     * @param int $amountToTransfer Montant déduit de ta commission plateforme
     */
    public function transferToSeller(int $amountToTransfer, string $currency, string $sellerAccountId, string $transferGroup): Transfer
    {
        return Transfer::create([
            'amount' => $amountToTransfer,
            'currency' => $currency,
            'destination' => $sellerAccountId,
            'transfer_group' => $transferGroup,
        ]);
    }

    /**
     * Crée un lien de connexion au tableau de bord Express (Dashboard).
     */
    public function createLoginLink(string $accountId)
    {
        return \Stripe\Account::createLoginLink($accountId);
    }
}
