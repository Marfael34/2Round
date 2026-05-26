<?php

namespace App\Service;

use MondialRelay\Webservice;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Entity\Order;

class MondialRelayService
{
    private Webservice $client;

    public function __construct(
        #[Autowire('%env(MONDIAL_RELAY_SITE_ID)%')] string $siteId,
        #[Autowire('%env(MONDIAL_RELAY_SECRET_KEY)%')] string $secretKey
    ) {
        $this->client = new Webservice($siteId, $secretKey);
    }

    public function searchPointsRelais(string $zipCode, string $country = 'FR')
    {
        $params = [
            'Pays' => $country,
            'CP' => $zipCode,
            'NombreResultats' => '5',
        ];

        try {
            return $this->client->searchParcelshop($params)->getResults();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Méthode pour générer le bordereau d'envoi.
     */
    public function generateShippingLabel(Order $order): array
    {
        // LOGIQUE SIMULÉE : En production, vous passeriez le poids du produit, les adresses, etc.
        // à $this->client->createLabel(...)
        
        $trackingNumber = 'MR-' . rand(10000000, 99999999);
        $pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

        return [
            'trackingNumber' => $trackingNumber,
            'shipping_label_url' => $pdfUrl
        ];
    }
}