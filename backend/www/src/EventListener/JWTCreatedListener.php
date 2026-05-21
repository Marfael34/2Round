<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'lexik_jwt_authentication.on_jwt_created', method: 'onJWTCreated')]
class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();

        // Récupérer le payload existant
        $payload = $event->getData();

        // Ajouter l'ID de l'utilisateur
        if (method_exists($user, 'getId')) {
            $payload['id'] = $user->getId();
        }

        // Mettre à jour le payload
        $event->setData($payload);
    }
}
