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

        $qb = $em->createQueryBuilder();
        $q = $qb->update(Message::class, 'm')
            ->set('m.isRead', 'true')
            ->where('m.conversation = :convId')
            ->andWhere('m.isRead = false')
            ->andWhere('m.users != :userId')
            ->setParameter('convId', $id)
            ->setParameter('userId', $user->getId())
            ->getQuery();

        $count = 0;
        try {
            $count = $q->execute();
        } catch (\Throwable $e) {
            @file_put_contents(__DIR__ . '/../../debug_read_error.txt', $e->getMessage() . "\n" . $e->getTraceAsString(), FILE_APPEND);
            return new JsonResponse(['message' => 'Erreur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['message' => "$count messages marqués comme lus"], Response::HTTP_OK);
    }
}
