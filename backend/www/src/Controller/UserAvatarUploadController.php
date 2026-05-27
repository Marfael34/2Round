<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class UserAvatarUploadController extends AbstractController
{
    #[Route('/api/users/avatar', name: 'api_user_avatar_upload', methods: ['POST'])]
    public function uploadAvatar(Request $request): Response
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
            }

            $file = $request->files->get('avatar');
            if (!$file) {
                return new JsonResponse(['message' => 'Aucun fichier fourni'], Response::HTTP_BAD_REQUEST);
            }

            $uploadDir = __DIR__ . '/../../public/uploads/avatars';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0777, true);
            }

            $originalName = $file->getClientOriginalName();
            $originalFilename = pathinfo($originalName, PATHINFO_FILENAME);
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            if (empty($extension)) {
                $extension = 'jpg';
            }
            
            $safeFilename = preg_replace('/[^A-Za-z0-9_]/', '', strtolower($originalFilename));
            if (empty($safeFilename)) {
                $safeFilename = 'avatar';
            }
            $newFilename = $safeFilename.'-'.uniqid().'.'.$extension;

            $file->move($uploadDir, $newFilename);

            return new JsonResponse([
                'path' => '/uploads/avatars/' . $newFilename,
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            return new JsonResponse([
                'message' => 'Erreur : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
