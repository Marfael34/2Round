<?php

namespace App\EventSubscriber;

use App\Entity\Product;
use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;

#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: Product::class)]
class ProductModificationListener
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function preUpdate(Product $product, PreUpdateEventArgs $event): void
    {
        // On vérifie si le produit a un statut spécifique (ex: suspendu/bloqué) ou a été signalé.
        // Ici on se base sur le fait qu'il a des signalements ou qu'il n'est pas actif
        $isReported = !$product->getReports()->isEmpty();
        $isBlockedOrSuspended = $product->getStatus() !== 'active';

        if ($isReported || $isBlockedOrSuspended) {
            $changes = $event->getEntityChangeSet();
            
            // On ignore si seul le statut a changé (par exemple par un admin)
            // On veut notifier quand le vendeur modifie le produit
            unset($changes['status']);
            unset($changes['suspensionReason']);

            if (!empty($changes)) {
                $this->notifyAdmins($product, $changes);
            }
        }
    }

    private function notifyAdmins(Product $product, array $changes): void
    {
        // Récupération des administrateurs
        $userRepo = $this->em->getRepository(User::class);
        $admins = $userRepo->createQueryBuilder('u')
            ->where('u.roles LIKE :role')
            ->setParameter('role', '%"ROLE_ADMIN"%')
            ->getQuery()
            ->getResult();

        foreach ($admins as $admin) {
            $notification = new Notification();
            $notification->setUser($admin)
                         ->setType('product_modified_after_report')
                         ->setContent('Le vendeur a modifié le produit "'. $product->getTitle() .'".')
                         ->setRelatedId($product->getId())
                         ->setMetadata([
                             'product_id' => $product->getId(),
                             'changes' => array_keys($changes)
                         ]);
            $notification->setCreatedAtValue();
            $this->em->persist($notification);
        }
    }
}
