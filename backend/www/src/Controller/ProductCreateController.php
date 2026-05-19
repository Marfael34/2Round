<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Image;
use App\Entity\Etat;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class ProductCreateController extends AbstractController
{
    #[Route('/api/products-create', name: 'api_products_create', methods: ['POST'])]
    public function createProduct(Request $request, EntityManagerInterface $em): Response
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        // Get POST parameters
        $title = $request->request->get('title');
        $brand = $request->request->get('brand');
        $description = $request->request->get('description');
        $price = $request->request->get('price');
        $weight = $request->request->get('weight');
        $etatIdOrIri = $request->request->get('etat');
        $type = $request->request->get('type');
        $size = $request->request->get('size');

        if (!$title || !$brand || !$description || !$price || !$weight || !$etatIdOrIri) {
            return new JsonResponse(['message' => 'Données manquantes'], Response::HTTP_BAD_REQUEST);
        }

        // Parse etat id
        $etatId = null;
        if (is_numeric($etatIdOrIri)) {
            $etatId = (int)$etatIdOrIri;
        } else {
            // It might be an IRI like /api/etats/1
            if (preg_match('/\/api\/etats\/(\d+)/', $etatIdOrIri, $matches)) {
                $etatId = (int)$matches[1];
            }
        }

        if (!$etatId) {
            return new JsonResponse(['message' => 'État invalide'], Response::HTTP_BAD_REQUEST);
        }

        $etat = $em->getRepository(Etat::class)->find($etatId);
        if (!$etat) {
            return new JsonResponse(['message' => 'État introuvable dans la base de données'], Response::HTTP_BAD_REQUEST);
        }

        // Create product
        $product = new Product();
        $product->setTitle($title);
        $product->setBrand($brand);
        $product->setDescription($description);
        $product->setPrice($price);
        $product->setWeight((int)$weight);
        $product->setEtat($etat);
        $product->setSeller($user);
        $product->setIsHighlighted(false);

        // Set type and size
        if (method_exists($product, 'setType')) {
            $product->setType($type);
        }
        if (method_exists($product, 'setSize')) {
            $product->setSize($size);
        }

        try {
            $em->persist($product);

            // Process files
            $uploadedFiles = $request->files->get('photos');
            if ($uploadedFiles) {
                // Normalize to array if single file uploaded
                if (!is_array($uploadedFiles)) {
                    $uploadedFiles = [$uploadedFiles];
                }

                $uploadDir = __DIR__ . '/../../public/uploads/profile';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                foreach ($uploadedFiles as $file) {
                    if ($file) {
                        $originalName = $file->getClientOriginalName();
                        $originalFilename = pathinfo($originalName, PATHINFO_FILENAME);
                        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
                        if (empty($extension)) {
                            $extension = 'jpg';
                        }
                        // Basic safe name sanitization
                        $safeFilename = preg_replace('/[^A-Za-z0-9_]/', '', strtolower($originalFilename));
                        if (empty($safeFilename)) {
                            $safeFilename = 'photo';
                        }
                        $newFilename = $safeFilename.'-'.uniqid().'.'.$extension;

                        $file->move($uploadDir, $newFilename);
                        
                        $image = new Image();
                        // Store relative URL for the frontend
                        $image->setPath('/uploads/profile/' . $newFilename);
                        $image->setProduct($product);
                        $em->persist($image);
                    }
                }
            }

            $em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'message' => 'Erreur de base de données ou d\'écriture : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse([
            'id' => $product->getId(),
            'title' => $product->getTitle(),
            'message' => 'Produit créé avec succès'
        ], Response::HTTP_CREATED);
    }
}
