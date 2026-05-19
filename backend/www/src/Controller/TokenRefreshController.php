<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class TokenRefreshController extends AbstractController
{
    #[Route('/api/token/refresh', name: 'api_token_refresh', methods: ['POST'])]
    public function refresh(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $refreshToken = $data['refresh_token'] ?? null;

        if (!$refreshToken) {
            return $this->json(['error' => 'Refresh token manquant'], 400);
        }

        // Trouver l'utilisateur possédant ce refresh token
        $user = $userRepository->findOneBy(['refreshToken' => $refreshToken]);

        if (!$user) {
            return $this->json(['error' => 'Refresh token invalide'], 401);
        }

        // Vérifier si le refresh token a expiré
        if ($user->getRefreshTokenExpiredAt() < new \DateTime()) {
            return $this->json(['error' => 'Refresh token expiré'], 401);
        }

        // Générer un nouveau JWT
        $jwtToken = $jwtManager->create($user);

        // Rotation du refresh token pour une sécurité maximale
        $newRefreshToken = bin2hex(random_bytes(32));
        $newExpiredAt = (new \DateTime())->modify('+30 days');

        $user->setRefreshToken($newRefreshToken);
        $user->setRefreshTokenExpiredAt($newExpiredAt);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'token' => $jwtToken,
            'refresh_token' => $newRefreshToken,
        ]);
    }
}
