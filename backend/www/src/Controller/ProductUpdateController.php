<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Image;
use App\Entity\Dictionary;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class ProductUpdateController extends AbstractController
{
    #[Route('/api/products-update/{id}', name: 'api_products_update', methods: ['POST'])]
    public function updateProduct(int $id, Request $request, EntityManagerInterface $em): Response
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

        if ($product->getSeller() !== $user) {
            return new JsonResponse(['message' => 'Non autorisé à modifier ce produit'], Response::HTTP_FORBIDDEN);
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

        if ($title) $product->setTitle($title);
        if ($brand) $product->setBrand($brand);
        if ($description) $product->setDescription($description);
        if ($price !== null) $product->setPrice($price);
        if ($weight !== null) $product->setWeight((int)$weight);

        if ($etatIdOrIri) {
            $etatId = null;
            if (is_numeric($etatIdOrIri)) {
                $etatId = (int)$etatIdOrIri;
            } elseif (preg_match('/\/api\/(etats|dictionaries)\/(\d+)/', $etatIdOrIri, $matches)) {
                $etatId = (int)$matches[2];
            }
            if ($etatId) {
                $etat = $em->getRepository(Dictionary::class)->find($etatId);
                if ($etat) {
                    $product->setEtat($etat);
                }
            }
        }

        if ($type !== null && method_exists($product, 'setType')) {
            $product->setType($type);
        }
        if ($size !== null && method_exists($product, 'setSize')) {
            $product->setSize($size);
        }

        // Manage colors
        $colorIdsOrIris = $request->request->all('colors');
        if ($colorIdsOrIris !== null) { // if colors sent (even empty array), we replace
            foreach ($product->getColors() as $c) {
                $product->removeColor($c);
            }
            foreach ($colorIdsOrIris as $colorIdOrIri) {
                $colorId = null;
                if (is_numeric($colorIdOrIri)) {
                    $colorId = (int)$colorIdOrIri;
                } elseif (preg_match('/\/api\/(colors|dictionaries)\/(\d+)/', $colorIdOrIri, $matches)) {
                    $colorId = (int)$matches[2];
                }
                if ($colorId) {
                    $color = $em->getRepository(Dictionary::class)->find($colorId);
                    if ($color) {
                        $product->addColor($color);
                    }
                }
            }
        }

        // Handle deleted images
        $deletedImagesIds = $request->request->all('deletedImages');
        if (!empty($deletedImagesIds)) {
            foreach ($deletedImagesIds as $imgId) {
                $img = $em->getRepository(Image::class)->find($imgId);
                if ($img && $img->getProduct() === $product) {
                    // Remove file from disk
                    $filePath = __DIR__ . '/../../public' . $img->getPath();
                    if (file_exists($filePath)) {
                        @unlink($filePath);
                    }
                    $em->remove($img);
                }
            }
        }

        try {
            // Process new files
            $uploadedFiles = $request->files->get('photos');
            if ($uploadedFiles) {
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
                        $safeFilename = preg_replace('/[^A-Za-z0-9_]/', '', strtolower($originalFilename));
                        if (empty($safeFilename)) {
                            $safeFilename = 'photo';
                        }
                        $newFilename = $safeFilename.'-'.uniqid().'.'.$extension;

                        $file->move($uploadDir, $newFilename);
                        
                        $image = new Image();
                        $image->setPath('/uploads/profile/' . $newFilename);
                        $image->setProduct($product);
                        $em->persist($image);
                    }
                }
            }

            $em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse([
            'id' => $product->getId(),
            'message' => 'Produit mis à jour avec succès'
        ], Response::HTTP_OK);
    }
}
