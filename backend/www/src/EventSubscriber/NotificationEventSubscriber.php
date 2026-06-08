<?php

namespace App\EventSubscriber;

use App\Entity\Message;
use App\Entity\Offer;
use App\Entity\Product;
use App\Entity\Report;
use App\Entity\Sanction;
use App\Service\NotificationService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::postPersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
#[AsDoctrineListener(event: Events::postFlush)]
class NotificationEventSubscriber
{
    private NotificationService $notificationService;
    private array $pendingNotifications = [];

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function postPersist(PostPersistEventArgs $args): void
    {
        $entity = $args->getObject();

        if ($entity instanceof Message) {
            if (method_exists($entity, 'getConversation') && $entity->getConversation()) {
                $conversation = $entity->getConversation();
                $product = $conversation->getProductId();
                $productOwner = $product ? $product->getSeller() : null;
                $buyer = $conversation->getBuyerid();
                
                $recipient = ($entity->getUsers() === $buyer) ? $productOwner : $buyer;
                
                if ($recipient) {
                    $this->pendingNotifications[] = [
                        $recipient,
                        'Nouveau message reçu',
                        'Vous avez reçu un nouveau message de ' . $entity->getUsers()->getPseudo(),
                        '/conversation',
                        'NEW_MESSAGE'
                    ];
                }
            }
        }

        if ($entity instanceof Report) {
            $this->pendingNotifications[] = [
                null,
                'Nouveau signalement',
                'Un nouveau signalement a été soumis par ' . $entity->getSender()->getPseudo(),
                '/admin/dashboard',
                'NEW_REPORT'
            ];
        }

        if ($entity instanceof Sanction) {
            $this->pendingNotifications[] = [
                $entity->getTargetUser(),
                'Avertissement',
                'Vous avez reçu un avertissement de l\'administration.',
                '/my-locker',
                'WARNING'
            ];
        }
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if ($entity instanceof Product) {
            if ($args->hasChangedField('status') && $args->getNewValue('status') !== 'active') {
                $this->pendingNotifications[] = [
                    $entity->getSeller(),
                    'Produit désactivé',
                    'Votre produit "' . $entity->getTitle() . '" a été désactivé.',
                    '/product/' . $entity->getId(),
                    'PRODUCT_DEACTIVATED'
                ];
            }
        }
    }

    public function postFlush(): void
    {
        if (empty($this->pendingNotifications)) {
            return;
        }

        // On copie et on vide le tableau AVANT d'envoyer,
        // car sendNotification appelle flush() ce qui redéclenche postFlush !
        $notifications = $this->pendingNotifications;
        $this->pendingNotifications = [];

        foreach ($notifications as $n) {
            $this->notificationService->sendNotification($n[0], $n[1], $n[2], $n[3], $n[4]);
        }
    }
}
