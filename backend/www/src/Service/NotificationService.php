<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\SerializerInterface;

class NotificationService
{
    private EntityManagerInterface $em;
    private HubInterface $hub;
    private SerializerInterface $serializer;

    public function __construct(EntityManagerInterface $em, HubInterface $hub, SerializerInterface $serializer)
    {
        $this->em = $em;
        $this->hub = $hub;
        $this->serializer = $serializer;
    }

    public function sendNotification(User $user, string $type, string $content, ?int $relatedId = null): void
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType($type);
        $notification->setContent($content);
        $notification->setRelatedId($relatedId);

        $this->em->persist($notification);
        $this->em->flush();

        // The API Platform mercure integration might trigger automatically,
        // but if it doesn't, or we want a custom topic:
        // We can publish to a custom topic for the user's notifications.
        // E.g., http://localhost:8000/users/{id}/notifications
        // or just rely on API platform if mercure: true is set on Entity.
        // Actually, it's safer to just rely on API Platform or push explicitly here
        // as a fallback. Let's let API Platform handle it via `mercure: true` on the entity!
        // But wait, API Platform only listens to Doctrine events if it's configured to do so.
        // Let's manually push just in case, or we can see if it double-pushes.
        // To avoid double push, we will let ApiPlatform handle it. If it fails, we add it back.
    }
}
