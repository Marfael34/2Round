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
        // 1. Reçu détaillé pour l'acheteur (ce qu'il a payé : Objet + Frais de service)
        $buyerInvoice = new Invoice();
        $buyerInvoice->setNumber('RE-B-' . strtoupper(substr(uniqid(), -5))); // RE pour Receipt
        $buyerInvoice->setType('receipt_purchase');
        $buyerInvoice->setAmount($order->getTotalprice());
        $buyerInvoice->setUsers($buyer);
        $buyerInvoice->setOrders($order);
        $buyerInvoice->setCreatedAt(new \DateTime());
        $this->em->persist($buyerInvoice);

        // Récupérer le vendeur et le prix de l'objet
        $orderItem = $order->getOrderItems()->first();
        if ($orderItem && $orderItem->getProducts()) {
            $seller = $orderItem->getProducts()->getSeller();
            $itemPrice = $orderItem->getPricePurchase();
            $serviceFees = $order->getServicesFees();

            // 2. Facture de commission pour le vendeur (Frais de service plateforme)
            $sellerCommission = new Invoice();
            $sellerCommission->setNumber('FA-C-' . strtoupper(substr(uniqid(), -5))); // FA pour Facture
            $sellerCommission->setType('invoice_commission');
            $sellerCommission->setAmount((string)$serviceFees);
            $sellerCommission->setUsers($seller);
            $sellerCommission->setOrders($order);
            $sellerCommission->setCreatedAt(new \DateTime());
            $this->em->persist($sellerCommission);

            // 3. Bordereau de transfert de propriété pour le vendeur (Prix de l'objet)
            $sellerTransfer = new Invoice();
            $sellerTransfer->setNumber('RE-T-' . strtoupper(substr(uniqid(), -5))); // RE pour Reçu
            $sellerTransfer->setType('receipt_transfer');
            $sellerTransfer->setAmount((string)$itemPrice);
            $sellerTransfer->setUsers($seller);
            $sellerTransfer->setOrders($order);
            $sellerTransfer->setCreatedAt(new \DateTime());
            $this->em->persist($sellerTransfer);
        }
    }
}