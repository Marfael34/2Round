<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\Invoice;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class InvoiceService
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function generateInvoices(Order $order, User $buyer): void
    {
        $orderItem = $order->getOrderItems()->first();
        $seller = null;
        $product = null;
        $itemPrice = 0;
        
        if ($orderItem && $orderItem->getProducts()) {
            $product = $orderItem->getProducts();
            $seller = $product->getSeller();
            $itemPrice = $orderItem->getPricePurchase();
        }

        $serviceFees = $order->getServicesFees();
        $shippingFees = $order->getShippingFees();
        
        $snapshot = [
            'buyer' => [
                'firstname' => $buyer->getFirstname(),
                'lastname' => $buyer->getLastname(),
                'email' => $buyer->getEmail(),
                'address' => $buyer->getAdresses()->first() ? $buyer->getAdresses()->first()->getStreet() . ' ' . $buyer->getAdresses()->first()->getCity() . ' ' . $buyer->getAdresses()->first()->getZipCode() : null
            ],
            'seller' => $seller ? [
                'firstname' => $seller->getFirstname(),
                'lastname' => $seller->getLastname(),
                'email' => $seller->getEmail(),
                'address' => $seller->getAdresses()->first() ? $seller->getAdresses()->first()->getStreet() . ' ' . $seller->getAdresses()->first()->getCity() . ' ' . $seller->getAdresses()->first()->getZipCode() : null
            ] : null,
            'product' => $product ? [
                'name' => $product->getTitle(),
                'price' => $itemPrice
            ] : null,
            'order' => [
                'servicesFees' => $serviceFees,
                'shippingFees' => $shippingFees,
                'totalPrice' => $order->getTotalprice()
            ]
        ];

        // 1. Reçu détaillé pour l'acheteur (ce qu'il a payé : Objet + Frais de service)
        $buyerInvoice = new Invoice();
        $buyerInvoice->setNumber('RE-B-' . strtoupper(substr(uniqid(), -5))); // RE pour Receipt
        $buyerInvoice->setType('receipt_purchase');
        $buyerInvoice->setAmount($order->getTotalprice());
        $buyerInvoice->setUsers($buyer);
        $buyerInvoice->setOrders($order);
        $buyerInvoice->setCreatedAt(new \DateTime());
        $buyerInvoice->setSnapshot($snapshot);
        $this->em->persist($buyerInvoice);
        $this->generatePdfFile($buyerInvoice, $snapshot, $product, $itemPrice, $serviceFees, $shippingFees, $buyer);

        // Removed seller invoices generation as requested.
    }

    private function generatePdfFile(Invoice $invoice, array $snapshot, $product, float $itemPrice, int $serviceFees, int $shippingFees, User $userTarget): void
    {
        $pdfDir = __DIR__ . '/../../public/invoice';
        if (!is_dir($pdfDir)) {
            mkdir($pdfDir, 0777, true);
        }
        $pdfPath = $pdfDir . '/' . $invoice->getNumber() . '.pdf';

        $title = "Facture d'Achat";
        $productName = $snapshot['product']['name'] ?? 'Article';
        $dateFormatted = $invoice->getCreatedAt()->format('d/m/Y');
        $address = $snapshot['buyer']['address'] ?? 'Adresse enregistrée sur le profil';
        
        $sellerName = isset($snapshot['seller']['firstname']) ? $snapshot['seller']['firstname'] . ' ' . ($snapshot['seller']['lastname'] ?? '') : 'Vendeur';
        $sellerEmail = $snapshot['seller']['email'] ?? 'vendeur@2round.fr';
        
        // Load Logo as Base64 for DomPDF
        $logoPath = __DIR__ . '/../../public/images/Logo.png';
        $logoHtml = "<h1 class='logo'>2ROUND</h1>";
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
            $logoHtml = "<img src='{$logoBase64}' style='max-height: 40px;' alt='2ROUND Logo'>";
        }

        $html = "
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&display=swap');
            @page { margin: 0px; }
            html, body { background-color: #1A1A1A; height: 100%; }
            body { font-family: 'Inter', sans-serif; color: #FFFFFF; margin: 0; padding: 50px; }
            .container { padding: 0; }
            .header-table { width: 100%; border: none; margin-bottom: 40px; border-bottom: 1px solid #333; padding-bottom: 20px; }
            .header-table td { border: none; padding: 0; vertical-align: top; }
            h1.logo { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #DC2626; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
            .company-info { font-size: 11px; color: #888; margin-top: 4px; line-height: 1.4; }
            .invoice-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #E5E7EB; text-transform: uppercase; margin: 0; text-align: right; }
            .invoice-meta { font-size: 12px; color: #9CA3AF; margin-top: 8px; text-align: right; line-height: 1.6; }
            .meta-val { color: #FFF; font-weight: 600; }
            
            .billing-table { width: 100%; border: none; margin-bottom: 40px; }
            .billing-table td { border: none; padding: 0; vertical-align: top; }
            .section-title { font-size: 12px; font-weight: 700; color: #00D26A; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
            .client-info p { margin: 2px 0; font-size: 12px; color: #D1D5DB; }
            .client-name { font-weight: 700; color: #FFF; font-size: 14px !important; margin-bottom: 4px !important; }
            .client-address { font-style: italic; color: #9CA3AF !important; margin-top: 6px !important; }
            
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #374151; color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .items-table td { padding: 16px 8px; border-bottom: 1px solid #374151; font-size: 13px; color: #E5E7EB; vertical-align: top; }
            .items-table .amount { text-align: right; font-weight: 600; }
            .item-desc { font-size: 10px; color: #9CA3AF; margin-top: 4px; }
            
            .totals-container { width: 100%; margin-top: 20px; }
            .totals-table { width: 50%; float: right; border-collapse: collapse; }
            .totals-table td { padding: 8px; font-size: 12px; color: #9CA3AF; border: none; text-align: right; }
            .totals-table .total-val { color: #E5E7EB; width: 100px; }
            .totals-table .grand-total td { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #00D26A; padding-top: 15px; border-top: 2px solid #374151; letter-spacing: 1px; }
            
            .clear { clear: both; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #374151; text-align: center; font-size: 10px; color: #6B7280; line-height: 1.6; }
            .footer strong { color: #9CA3AF; }
        </style>
        <body>
            <div class='container'>
                <table class='header-table'>
                    <tr>
                        <td style='width: 50%;'>
                            {$logoHtml}
                            <div class='company-info'>
                                Plateforme d'équipements de boxe de seconde main<br>
                                123 Rue de la Boxe, 75000 Paris<br>
                                SIRET: 123 456 789 00012
                            </div>
                        </td>
                        <td style='width: 50%;'>
                            <h2 class='invoice-title'>{$title}</h2>
                            <div class='invoice-meta'>
                                N° <span class='meta-val'>{$invoice->getNumber()}</span><br>
                                Date : <span class='meta-val'>{$dateFormatted}</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <table class='billing-table'>
                    <tr>
                        <td style='width: 50%; padding-right: 20px;' class='client-info'>
                            <div class='section-title'>Vendeur :</div>
                            <p class='client-name'>{$sellerName}</p>
                            <p>{$sellerEmail}</p>
                            <p class='client-address'>Vendeur Particulier</p>
                        </td>
                        <td style='width: 50%;' class='client-info'>
                            <div class='section-title'>Acheteur :</div>
                            <p class='client-name'>{$userTarget->getFirstname()} {$userTarget->getLastname()}</p>
                            <p>{$userTarget->getEmail()}</p>
                            <p class='client-address'>{$address}</p>
                        </td>
                    </tr>
                </table>

                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style='text-align: right;'>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>{$productName}</strong>
                                <div class='item-desc'>Prix de l'article de boxe</div>
                            </td>
                            <td class='amount'>" . number_format($itemPrice, 2) . " €</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Frais de protection acheteur</strong>
                                <div class='item-desc'>Garantie 2Round et paiements sécurisés</div>
                            </td>
                            <td class='amount'>" . number_format($serviceFees / 100, 2) . " €</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Frais de livraison</strong>
                                <div class='item-desc'>Transport du colis</div>
                            </td>
                            <td class='amount'>" . number_format($shippingFees / 100, 2) . " €</td>
                        </tr>
                    </tbody>
                </table>

                <div class='totals-container'>
                    <table class='totals-table'>
                        <tr>
                            <td>Prix de l'Article</td>
                            <td class='total-val'>" . number_format($itemPrice, 2) . " €</td>
                        </tr>
                        <tr>
                            <td>Frais d'expédition et de service</td>
                            <td class='total-val'>" . number_format(($serviceFees + $shippingFees) / 100, 2) . " €</td>
                        </tr>
                        <tr class='grand-total'>
                            <td>TOTAL PAYÉ</td>
                            <td class='total-val'>" . number_format($invoice->getAmount(), 2) . " €</td>
                        </tr>
                    </table>
                    <div class='clear'></div>
                </div>

                <div class='footer'>
                    <strong>Vente entre particuliers - L'article n'est pas assujetti à la TVA (art. 293 B du CGI ou équivalent).</strong><br>
                    Merci pour votre confiance !<br>
                    Ce document est généré électroniquement et sert de preuve de transaction.
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
            file_put_contents($pdfPath, "PDF non généré. Veuillez exécuter 'composer require dompdf/dompdf' dans le conteneur backend pour activer la génération PDF.\n\nContenu HTML :\n" . strip_tags($html));
        }
    }
}