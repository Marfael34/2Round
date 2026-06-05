<?php

namespace App\EventListener;

use App\Entity\Message;
use App\Entity\Offer;
use App\Entity\Order;
use App\Entity\Product;
use App\Entity\Report;
use App\Entity\Sanction;
use App\Entity\User;
use App\Entity\Notification;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\EntityManagerInterface;

#[AsDoctrineListener(event: Events::onFlush, priority: 500, connection: 'default')]
class NotificationDoctrineListener
{
    public function onFlush(OnFlushEventArgs $args): void
    {
        $em = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        $notificationsToCreate = [];

        // 1. Handle Insertions
        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof Message) {
                $conversation = $entity->getConversation();
                if ($conversation) {
                    $sender = $entity->getUsers();
                    $buyer = $conversation->getBuyerid();
                    $productOwner = $conversation->getProductId()->getSeller();

                    $receiver = ($sender === $buyer) ? $productOwner : $buyer;

                    if ($receiver) {
                        $notificationsToCreate[] = [
                            'user' => $receiver,
                            'type' => 'message',
                            'content' => 'Vous avez reçu un nouveau message pour le produit ' . $conversation->getProductId()->getTitle(),
                            'relatedId' => $entity->getId()
                        ];
                    }
                }
            }

            if ($entity instanceof Sanction) {
                $user = $entity->getTargetUser();
                if ($user) {
                    $typeLabel = $entity->getType() === 'WARNING' ? 'Avertissement' : ($entity->getType() === 'MUTE' ? 'Suspension temporaire' : 'Bannissement');
                    $notificationsToCreate[] = [
                        'user' => $user,
                        'type' => 'sanction',
                        'content' => 'Vous avez reçu une sanction (' . $typeLabel . ') : ' . $entity->getReason(),
                        'relatedId' => $entity->getId()
                    ];
                }
            }

            if ($entity instanceof Report) {
                $admins = $this->getAdmins($em);
                foreach ($admins as $admin) {
                    $notificationsToCreate[] = [
                        'user' => $admin,
                        'type' => 'report',
                        'content' => 'Un nouveau signalement a été créé.',
                        'relatedId' => $entity->getId()
                    ];
                }
            }
        }

        // 2. Handle Updates
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            $changeset = $uow->getEntityChangeSet($entity);

            if ($entity instanceof Offer && isset($changeset['status'])) {
                $newStatus = $changeset['status'][1];
                $message = $em->getRepository(Message::class)->findOneBy(['offer' => $entity]);
                if ($message) {
                    $buyer = $message->getConversation()->getBuyerid();
                    if ($buyer) {
                        if ($newStatus === 'accepted') {
                            $notificationsToCreate[] = [
                                'user' => $buyer,
                                'type' => 'offer',
                                'content' => 'Votre offre a été acceptée !',
                                'relatedId' => $entity->getId()
                            ];
                        } elseif ($newStatus === 'declined') {
                            $notificationsToCreate[] = [
                                'user' => $buyer,
                                'type' => 'offer',
                                'content' => 'Votre offre a été refusée.',
                                'relatedId' => $entity->getId()
                            ];
                        }
                    }
                }
            }

            if ($entity instanceof Order && isset($changeset['status'])) {
                $newStatus = $changeset['status'][1];
                if ($newStatus === 'paid') {
                    $orderItems = $entity->getOrderItems();
                    if (count($orderItems) > 0) {
                        $product = $orderItems[0]->getProducts();
                        $seller = $product->getSeller();
                        if ($seller) {
                            $notificationsToCreate[] = [
                                'user' => $seller,
                                'type' => 'purchase',
                                'content' => 'Votre produit ' . $product->getTitle() . ' a été vendu !',
                                'relatedId' => $entity->getId()
                            ];
                        }
                    }
                }
            }

            if ($entity instanceof Product) {
                if (isset($changeset['status']) && $changeset['status'][1] === 'suspended_by_admin') {
                    $seller = $entity->getSeller();
                    if ($seller) {
                        $reason = $entity->getSuspensionReason();
                        $notificationsToCreate[] = [
                            'user' => $seller,
                            'type' => 'sanction',
                            'content' => 'Votre produit "' . $entity->getTitle() . '" a été désactivé par l\'administration' . ($reason ? ' : ' . $reason : '.'),
                            'relatedId' => $entity->getId()
                        ];
                    }
                }

                if ($entity->getStatus() === 'blocked' || $entity->getStatus() === 'disabled') {
                    if (isset($changeset['name']) || isset($changeset['description']) || isset($changeset['price'])) {
                        $admins = $this->getAdmins($em);
                        foreach ($admins as $admin) {
                            $notificationsToCreate[] = [
                                'user' => $admin,
                                'type' => 'product_modified',
                                'content' => 'Le produit bloqué ' . $entity->getTitle() . ' a été modifié par son propriétaire.',
                                'relatedId' => $entity->getId()
                            ];
                        }
                    }
                }
            }
        }

        // 3. Persist Notifications
        if (!empty($notificationsToCreate)) {
            $classMetadata = $em->getClassMetadata(Notification::class);
            foreach ($notificationsToCreate as $data) {
                $notification = new Notification();
                $notification->setUser($data['user']);
                $notification->setType($data['type']);
                $notification->setContent($data['content']);
                $notification->setRelatedId($data['relatedId']);
                
                $notification->setCreatedAtValue();
                
                $em->persist($notification);
                $uow->computeChangeSet($classMetadata, $notification);
            }
        }
    }

    /**
     * @return User[]
     */
    private function getAdmins(EntityManagerInterface $em): array
    {
        $qb = $em->createQueryBuilder();
        $qb->select('u')
           ->from(User::class, 'u')
           ->where('u.roles LIKE :role')
           ->setParameter('role', '%"ROLE_ADMIN"%');

        return $qb->getQuery()->getResult();
    }
}

