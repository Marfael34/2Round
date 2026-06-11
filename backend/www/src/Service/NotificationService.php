<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\SerializerInterface;
use Psr\Log\LoggerInterface;

class NotificationService
{
    private EntityManagerInterface $em;
    private HubInterface $hub;
    private SerializerInterface $serializer;
    private LoggerInterface $logger;

    public function __construct(EntityManagerInterface $em, HubInterface $hub, SerializerInterface $serializer, LoggerInterface $logger)
    {
        $this->em = $em;
        $this->hub = $hub;
        $this->serializer = $serializer;
        $this->logger = $logger;
    }

    /**
     * @param User|null $recipient Si null, notification globale (admin)
     */
    public function sendNotification(?User $recipient, string $title, string $message, ?string $link, string $type): void
    {
        $notification = new Notification();
        $notification->setRecipient($recipient);
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setLink($link);
        $notification->setType($type);
        
        $this->em->persist($notification);
        $this->em->flush();

        // Topic de la notification (ex: pour un utilisateur précis ou 'admin')
        $topic = $recipient ? sprintf('https://2round.com/users/%d/notifications', $recipient->getId()) : 'https://2round.com/admin/notifications';

        // Sérialisation pour l'envoi Mercure (même format que API Platform)
        $data = $this->serializer->serialize($notification, 'json', ['groups' => 'notification:read']);

        $update = new Update(
            $topic,
            $data,
            false // Rendu public pour éviter le 401 en frontend
        );

        try {
            $this->hub->publish($update);
        } catch (\Exception $e) {
            $this->logger->error("MERCURE PUBLISH ERROR: " . $e->getMessage());
        }
    }
}
