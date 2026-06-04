<?php

namespace App\EventListener;

use App\Entity\User;
use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PostUpdateEventArgs;

#[AsEntityListener(event: Events::postUpdate, method: 'postUpdate', entity: User::class)]
class UserBanListener
{
    public function postUpdate(User $user, PostUpdateEventArgs $event): void
    {
        $entityManager = $event->getObjectManager();
        $unitOfWork = $entityManager->getUnitOfWork();
        $changeSet = $unitOfWork->getEntityChangeSet($user);

        $isBanned = false;
        $isUnbanned = false;

        if (isset($changeSet['isActive'])) {
            $oldIsActive = $changeSet['isActive'][0];
            $newIsActive = $changeSet['isActive'][1];
            
            if ($oldIsActive === true && $newIsActive === false) {
                $isBanned = true;
            } elseif ($oldIsActive === false && $newIsActive === true) {
                $isUnbanned = true;
            }
        }

        if (isset($changeSet['bannedUntil'])) {
            $oldBannedUntil = $changeSet['bannedUntil'][0];
            $newBannedUntil = $changeSet['bannedUntil'][1];
            
            $now = new \DateTime();
            
            if ($newBannedUntil instanceof \DateTimeInterface && $newBannedUntil > $now) {
                $isBanned = true;
            } elseif ($oldBannedUntil instanceof \DateTimeInterface && $oldBannedUntil > $now && $newBannedUntil === null) {
                $isUnbanned = true;
            }
        }

        if ($isBanned) {
            $qb = $entityManager->createQueryBuilder();
            $q = $qb->update(Product::class, 'p')
                ->set('p.status', ':newStatus')
                ->where('p.seller = :seller')
                ->andWhere('p.status = :oldStatus')
                ->setParameter('newStatus', 'hidden_banned')
                ->setParameter('seller', $user)
                ->setParameter('oldStatus', 'active')
                ->getQuery();
            
            $q->execute();
        } elseif ($isUnbanned) {
            $qb = $entityManager->createQueryBuilder();
            $q = $qb->update(Product::class, 'p')
                ->set('p.status', ':newStatus')
                ->where('p.seller = :seller')
                ->andWhere('p.status = :oldStatus')
                ->setParameter('newStatus', 'active')
                ->setParameter('seller', $user)
                ->setParameter('oldStatus', 'hidden_banned')
                ->getQuery();
            
            $q->execute();
        }
    }
}
