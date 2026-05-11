<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OrderItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
#[ApiResource]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $pricePurchase = null;

    #[ORM\ManyToOne(inversedBy: 'orderItems')]
    private ?Order $orders = null;

    #[ORM\ManyToOne(inversedBy: 'orderItems')]
    private ?Product $products = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPricePurchase(): ?string
    {
        return $this->pricePurchase;
    }

    public function setPricePurchase(string $pricePurchase): static
    {
        $this->pricePurchase = $pricePurchase;

        return $this;
    }

    public function getOrders(): ?Order
    {
        return $this->orders;
    }

    public function setOrders(?Order $orders): static
    {
        $this->orders = $orders;

        return $this;
    }

    public function getProducts(): ?Product
    {
        return $this->products;
    }

    public function setProducts(?Product $products): static
    {
        $this->products = $products;

        return $this;
    }
}
