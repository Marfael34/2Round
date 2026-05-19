<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: User::class)]
#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: User::class)]
class UserPasswordHasherListener
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function prePersist(User $user, LifecycleEventArgs $event): void
    {
        $this->hashPassword($user);
    }

    public function preUpdate(User $user, LifecycleEventArgs $event): void
    {
        $this->hashPassword($user);
    }

    private function hashPassword(User $user): void
    {
        $password = $user->getPassword();
        if ($password && !str_starts_with($password, '$')) {
            $user->setPassword(
                $this->passwordHasher->hashPassword($user, $password)
            );
        }
    }
}
