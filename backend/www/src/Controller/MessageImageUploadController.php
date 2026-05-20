<?php

namespace App\Controller;

use App\Entity\Image;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class MessageImageUploadController extends AbstractController
{
    #[Route('/api/message-images', name: 'api_message_images_upload', methods: ['POST'])]
    public function uploadImage(Request $request, EntityManagerInterface $em): Response
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
            }

            $file = $request->files->get('photo');
            if (!$file) {
                return new JsonResponse(['message' => 'Aucun fichier fourni'], Response::HTTP_BAD_REQUEST);
            }

            $uploadDir = __DIR__ . '/../../public/uploads/messages';
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
                $safeFilename = 'msg_photo';
            }
            $newFilename = $safeFilename.'-'.uniqid().'.'.$extension;

            $file->move($uploadDir, $newFilename);
            
            $image = new Image();
            $image->setPath('/uploads/messages/' . $newFilename);
            $em->persist($image);
            $em->flush();

            return new JsonResponse([
                '@id' => '/api/images/' . $image->getId(),
                'id' => $image->getId(),
                'path' => $image->getPath(),
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            @file_put_contents('/tmp/debug_upload_error.txt', $e->getMessage() . "\n" . $e->getTraceAsString());
            return new JsonResponse([
                'message' => 'Erreur : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
