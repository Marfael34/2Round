<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Invoice;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class ProductBoostController extends AbstractController
{
    #[Route('/api/products/{id}/boost-success', name: 'api_products_boost_success', methods: ['POST'])]
    public function boostSuccess(Product $product, EntityManagerInterface $em, \App\Service\InvoiceService $invoiceService): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || $product->getSeller() !== $user) {
            return new JsonResponse(['error' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$product->isHighlighted()) {
            $product->setIsHighlighted(true);
            
            $invoice = new Invoice();
            $invoice->setNumber('FA-B-' . strtoupper(uniqid()));
            $invoice->setCreatedAt(new \DateTime());
            $invoice->setType('Boost Stripe');
            $invoice->setAmount('5.00');
            $invoice->setUsers($user);
            $invoice->setSnapshot([
                'product_title' => $product->getTitle(),
                'boost_price' => '5.00',
                'date' => (new \DateTime())->format('Y-m-d H:i:s')
            ]);
            $em->persist($invoice);
            
            $invoiceService->generateBoostInvoice($invoice, $product, $user);
            
            $em->flush();
        }

        return new JsonResponse(['message' => 'Produit boosté']);
    }
}
