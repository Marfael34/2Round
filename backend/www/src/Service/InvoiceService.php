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
        // 1. Facture pour l'acheteur (ce qu'il a payé)
        $buyerInvoice = new Invoice();
        $buyerInvoice->setNumber('FA-B-' . strtoupper(substr(uniqid(), -5)));
        $buyerInvoice->setType('purchase');
        $buyerInvoice->setAmount($order->getTotalprice());
        $buyerInvoice->setUsers($buyer);
        $buyerInvoice->setOrders($order);
        $buyerInvoice->setCreatedAt(new \DateTime());
        $this->em->persist($buyerInvoice);

        // Récupérer le vendeur depuis le produit (OrderItem)
        $orderItem = $order->getOrderItems()->first();
        if ($orderItem && $orderItem->getProducts()) {
            $seller = $orderItem->getProducts()->getSeller();

            // 2. Facture pour le vendeur (ce qu'il va recevoir, moins les frais)
            $sellerInvoice = new Invoice();
            $sellerInvoice->setNumber('FA-S-' . strtoupper(substr(uniqid(), -5)));
            $sellerInvoice->setType('sale');
            // Calcul du net vendeur (Ex: Prix total - Frais de service plateforme)
            $netAmount = (int)$order->getTotalprice() - $order->getServicesFees();
            $sellerInvoice->setAmount((string)$netAmount);
            $sellerInvoice->setUsers($seller);
            $sellerInvoice->setOrders($order);
            $sellerInvoice->setCreatedAt(new \DateTime());
            $this->em->persist($sellerInvoice);
        }
    }
}