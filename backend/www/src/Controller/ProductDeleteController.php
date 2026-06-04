<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class ProductDeleteController extends AbstractController
{
    #[Route('/api/products-delete/{id}', name: 'api_products_delete', methods: ['DELETE'])]
    public function deleteProduct(int $id, EntityManagerInterface $em): Response
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $product = $em->getRepository(Product::class)->find($id);
        if (!$product) {
            return new JsonResponse(['message' => 'Produit introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Only the seller or an admin can delete the product
        if ($product->getSeller() !== $user && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['message' => 'Non autorisé à supprimer ce produit'], Response::HTTP_FORBIDDEN);
        }

        try {
            $product->setStatus('deleted_by_user');
            $em->flush();
            return new JsonResponse(['message' => 'Produit supprimé avec succès'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse([
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
