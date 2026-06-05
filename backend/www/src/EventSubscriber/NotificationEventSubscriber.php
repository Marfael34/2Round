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
class NotificationEventSubscriber
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function postPersist(PostPersistEventArgs $args): void
    {
        $entity = $args->getObject();

        // Nouveau Message
        if ($entity instanceof Message) {
            // Dans votre entité Message, assurez-vous d'avoir accès au destinataire
            // Si la conversation a un acheteur et que le message vient du vendeur, notifier l'acheteur.
            // Ici, par exemple, on suppose getConversation()
            if (method_exists($entity, 'getConversation') && $entity->getConversation()) {
                $conversation = $entity->getConversation();
                // Si l'expéditeur est l'acheteur, le destinataire est le vendeur (propriétaire du produit)
                $product = $conversation->getProductId();
                $productOwner = $product ? $product->getSeller() : null;
                $buyer = $conversation->getBuyerid();
                
                $recipient = ($entity->getUsers() === $buyer) ? $productOwner : $buyer;
                
                if ($recipient) {
                    $this->notificationService->sendNotification(
                        $recipient,
                        'Nouveau message reçu',
                        'Vous avez reçu un nouveau message de ' . $entity->getUsers()->getPseudo(),
                        '/conversation', // URL frontend corrigée
                        'NEW_MESSAGE'
                    );
                }
            }
        }

        // Nouvelle Offre
        // (Il faut lier l'Offer au Product ou Message correctement selon votre logique métier.
        // Si l'Offer n'a pas accès au Product, ce bloc est à adapter.)
        // if ($entity instanceof Offer) { ... }

        // Nouveau Signalement (Report)
        if ($entity instanceof Report) {
            // Notifier les administrateurs (recipient = null)
            $this->notificationService->sendNotification(
                null,
                'Nouveau signalement',
                'Un nouveau signalement a été soumis par ' . $entity->getSender()->getPseudo(),
                '/admin/dashboard', // URL frontend corrigée
                'NEW_REPORT'
            );
        }

        // Nouvelle Sanction (Avertissement)
        if ($entity instanceof Sanction) {
            $this->notificationService->sendNotification(
                $entity->getTargetUser(),
                'Avertissement',
                'Vous avez reçu un avertissement de l\'administration.',
                '/my-locker', // URL frontend corrigée
                'WARNING'
            );
        }
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        // Modification d'un produit (désactivation/blocage)
        if ($entity instanceof Product) {
            if ($args->hasChangedField('status') && $args->getNewValue('status') !== 'active') {
                $this->notificationService->sendNotification(
                    $entity->getSeller(),
                    'Produit désactivé',
                    'Votre produit "' . $entity->getTitle() . '" a été désactivé.',
                    '/product/' . $entity->getId(), // URL frontend corrigée
                    'PRODUCT_DEACTIVATED'
                );
            }
        }
    }
}
