<?php

namespace App\Controller;

use App\Entity\Conversation;
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

        $count = 0;
        foreach ($conversation->getMessages() as $message) {
            $msgUser = $message->getUsers();
            if (!$message->isRead() && $msgUser && $msgUser->getId() !== $user->getId()) {
                $message->setIsRead(true);
                $count++;
            }
        }

        if ($count > 0) {
            try {
                $em->flush();
            } catch (\Throwable $e) {
                @file_put_contents(__DIR__ . '/../../debug_read_error.txt', $e->getMessage() . "\n" . $e->getTraceAsString(), FILE_APPEND);
                return new JsonResponse(['message' => 'Erreur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        return new JsonResponse(['message' => "$count messages marqués comme lus"], Response::HTTP_OK);
    }
}
