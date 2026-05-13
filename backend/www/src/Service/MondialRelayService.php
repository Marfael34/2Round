<?php

namespace App\Service;

use MondialRelay\Webservice;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class MondialRelayService
{
    private Webservice $client;

    public function __construct(
        #[Autowire('%env(MONDIAL_RELAY_SITE_ID)%')] string $siteId,
        #[Autowire('%env(MONDIAL_RELAY_SECRET_KEY)%')] string $secretKey
    ) {
        // Initialisation du client de la librairie avec les identifiants de test
        $this->client = new Webservice($siteId, $secretKey);
    }

    /**
     * Méthode de test : Recherche de points relais autour d'un code postal
     */
    public function searchPointsRelais(string $zipCode, string $country = 'FR')
    {
        $params = [
            'Pays' => $country,
            'CP' => $zipCode,
            'NombreResultats' => '5', // On limite à 5 résultats pour le test
        ];

        try {
            // searchParcelshop est la méthode simplifiée de la librairie
            return $this->client->searchParcelshop($params)->getResults();
        } catch (\Exception $e) {
            // En cas d'erreur (ex: pas de connexion)
            return [];
        }
    }
}
