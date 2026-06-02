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
    public function generateShippingLabel(Order $order, ?\App\Entity\User $buyer = null): array
    {
        $trackingNumber = 'MR-' . rand(10000000, 99999999);
        
        $orderItem = $order->getOrderItems()->first();
        $product = $orderItem ? $orderItem->getProducts() : null;
        $seller = $product ? $product->getSeller() : null;
        
        $sellerName = $seller ? $seller->getFirstname() . ' ' . $seller->getLastname() : 'Vendeur Inconnu';
        $sellerAddress = $seller && $seller->getAdresses()->first() ? $seller->getAdresses()->first()->getStreetName() . ', ' . $seller->getAdresses()->first()->getPostalCode() . ' ' . $seller->getAdresses()->first()->getCity() : 'Adresse du vendeur';
        
        $buyerName = $buyer ? $buyer->getFirstname() . ' ' . $buyer->getLastname() : 'Acheteur Inconnu';
        $buyerAddress = $buyer && $buyer->getAdresses()->first() ? $buyer->getAdresses()->first()->getStreetName() . ', ' . $buyer->getAdresses()->first()->getPostalCode() . ' ' . $buyer->getAdresses()->first()->getCity() : 'Point Relais Selectionné';
        
        $weight = $order->getWeightTotal() ?? '1.00';
        $date = date('d/m/Y');
        
        $pdfDir = __DIR__ . '/../../public/labels';
        if (!is_dir($pdfDir)) {
            mkdir($pdfDir, 0777, true);
        }
        
        $filename = 'label_' . $trackingNumber . '.pdf';
        $pdfPath = $pdfDir . '/' . $filename;
        
        $html = "
        <style>
            @page { margin: 0px; }
            body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .label-container { border: 2px solid #000; width: 100%; max-width: 800px; margin: 0 auto; padding: 0; box-sizing: border-box; }
            .header { background-color: #CC0033; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .content { padding: 20px; }
            .row { width: 100%; margin-bottom: 20px; }
            .col { width: 48%; display: inline-block; vertical-align: top; }
            .box { border: 1px solid #000; padding: 15px; min-height: 120px; }
            .box-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .barcode-section { text-align: center; margin: 30px 0; border: 1px dashed #000; padding: 20px; }
            .barcode { font-family: 'Courier New', Courier, monospace; font-size: 24px; letter-spacing: 2px; }
            .tracking { font-size: 18px; font-weight: bold; margin-top: 10px; }
            .footer { border-top: 2px solid #000; padding: 10px 20px; font-size: 12px; display: flex; justify-content: space-between; }
        </style>
        <body>
            <div class='label-container'>
                <div class='header'>
                    Mondial Relay - Point Relais
                </div>
                <div class='content'>
                    <div class='row'>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <tr>
                                <td style='width: 48%; vertical-align: top;'>
                                    <div class='box'>
                                        <div class='box-title'>EXPÉDITEUR</div>
                                        <strong>{$sellerName}</strong><br>
                                        {$sellerAddress}<br>
                                        FRANCE
                                    </div>
                                </td>
                                <td style='width: 4%;'></td>
                                <td style='width: 48%; vertical-align: top;'>
                                    <div class='box'>
                                        <div class='box-title'>DESTINATAIRE</div>
                                        <strong>{$buyerName}</strong><br>
                                        {$buyerAddress}<br>
                                        FRANCE
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class='barcode-section'>
                        <div style='font-size: 40px; font-weight: bold; margin-bottom: 10px;'>||| |||| || |||||| | |||||||</div>
                        <div class='tracking'>N° de Suivi : {$trackingNumber}</div>
                        <div style='margin-top: 10px;'>Poids : {$weight} kg</div>
                    </div>
                    
                    <table style='width: 100%; font-size: 12px; margin-top: 20px;'>
                        <tr>
                            <td><strong>Date :</strong> {$date}</td>
                            <td style='text-align: right;'><strong>Signature du Point Relais :</strong> _________________</td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
        ";
        
        if (class_exists('\Dompdf\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            file_put_contents($pdfPath, $dompdf->output());
        } else {
            file_put_contents($pdfPath, "Veuillez installer dompdf (composer require dompdf/dompdf)");
        }
        
        $pdfUrl = '/labels/' . $filename;

        return [
            'trackingNumber' => $trackingNumber,
            'shipping_label_url' => $pdfUrl
        ];
    }
}