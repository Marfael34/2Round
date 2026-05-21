<?php

namespace App\Controller;

use App\Entity\Favorite;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class ToggleFavoriteController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/api/products/{id}/favorite', name: 'api_products_favorite_toggle', methods: ['POST'])]
    public function __invoke(Product $product): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if favorite already exists
        $favoriteRepository = $this->entityManager->getRepository(Favorite::class);
        $existingFavorite = $favoriteRepository->findOneBy([
            'users' => $user,
            'products' => $product
        ]);

        if ($existingFavorite) {
            // Remove favorite
            $this->entityManager->remove($existingFavorite);
            $this->entityManager->flush();
            return new JsonResponse(['status' => 'removed', 'isFavorite' => false]);
        } else {
            // Add favorite
            $favorite = new Favorite();
            $favorite->setUsers($user);
            $favorite->setProducts($product);
            
            $this->entityManager->persist($favorite);
            $this->entityManager->flush();
            return new JsonResponse(['status' => 'added', 'isFavorite' => true]);
        }
    }
}
