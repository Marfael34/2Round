<?php

namespace App\EventListener;

use App\Entity\Product;
use App\Entity\Report;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PreUpdateEventArgs;

#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: Product::class)]
class ProductUpdateListener
{
    public function preUpdate(Product $product, PreUpdateEventArgs $event): void
    {
        // Only act if the product is currently suspended by admin
        if ($product->getStatus() !== 'suspended_by_admin') {
            return;
        }

        $changeSet = $event->getEntityChangeSet();
        
        // We do not want to trigger this if the admin is just changing the status or suspensionReason
        // If there are ONLY changes to 'status' or 'suspensionReason', we skip.
        // If there are other changes (title, description, price, etc), we create a report.
        $hasSignificantChanges = false;
        foreach ($changeSet as $field => $changes) {
            if (!in_array($field, ['status', 'suspensionReason'])) {
                $hasSignificantChanges = true;
                break;
            }
        }

        if ($hasSignificantChanges) {
            // Check if there's already a pending report for this specific product to avoid duplicates
            $entityManager = $event->getObjectManager();
            $existingReport = $entityManager->getRepository(Report::class)->findOneBy([
                'product' => $product,
                'status' => 'pending',
                'reason' => 'Produit modifié après suspension'
            ]);

            if (!$existingReport) {
                $report = new Report();
                $report->setReason('Produit modifié après suspension');
                $report->setDescription("Le vendeur a modifié les informations de ce produit (précédemment suspendu). Veuillez vérifier s'il est désormais conforme aux règles.");
                $report->setCreatedAt(new \DateTime());
                $report->setProduct($product);
                $report->setSender($product->getSeller()); // The seller is the one making the modification
                $report->setStatus('pending');

                $entityManager->persist($report);
                // We don't flush here because we are inside a preUpdate event.
                // The new entity will be flushed if we add it to the UoW scheduled insertions.
                
                $uow = $entityManager->getUnitOfWork();
                $classMetadata = $entityManager->getClassMetadata(Report::class);
                $uow->computeChangeSet($classMetadata, $report);
            }
        }
    }
}
