<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class MessageReadController extends AbstractController
{
    #[Route('/api/conversations/{id}/mark-read', name: 'api_conversation_mark_read', methods: ['POST'])]
    public function markAsRead(int $id, EntityManagerInterface $em): Response
    {
        $conversation = $em->getRepository(Conversation::class)->find($id);
        if (!$conversation) {
            return new JsonResponse(['message' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $messages = $conversation->getMessages();
        $count = 0;
        foreach ($messages as $message) {
            if (!$message->isRead() && $message->getUsers() && $message->getUsers()->getId() !== $user->getId()) {
                $message->setIsRead(true);
                $count++;
            }
        }

        try {
            if ($count > 0) {
                $em->flush();
            }
        } catch (\Throwable $e) {
            return new JsonResponse(['message' => 'Erreur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['message' => "$count messages marqués comme lus"], Response::HTTP_OK);
    }
}
