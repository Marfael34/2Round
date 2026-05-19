<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'lexik_jwt_authentication.on_authentication_success', method: 'onAuthenticationSuccess')]
class AuthenticationSuccessListener
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Générer un refresh token unique et sécurisé
        $refreshToken = bin2hex(random_bytes(32));
        $expiredAt = (new \DateTime())->modify('+30 days');

        $user->setRefreshToken($refreshToken);
        $user->setRefreshTokenExpiredAt($expiredAt);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Ajouter le refresh token à la réponse JSON de login
        $data = $event->getData();
        $data['refresh_token'] = $refreshToken;
        $event->setData($data);
    }
}
