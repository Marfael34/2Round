<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\AdressRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: AdressRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['adress:read']],
    denormalizationContext: ['groups' => ['adress:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact'])]
class Adress
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'adress:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $label = null;

    #[ORM\Column(length: 10)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $street_number = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $street_name = null;

    #[ORM\Column(length: 5)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $postal_code = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $city = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $country = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 8)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 11, scale: 8)]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?string $longitude = null;

    #[ORM\ManyToOne(inversedBy: 'adresses')]
    #[Groups(['adress:read', 'adress:write'])]
    private ?User $user = null;

    #[ORM\Column(options: ['default' => true])]
    #[Groups(['user:read', 'adress:read', 'adress:write'])]
    private ?bool $isActive = true;

    /**
     * @var Collection<int, Order>
     */
    #[ORM\OneToMany(targetEntity: Order::class, mappedBy: 'address')]
    private Collection $orders;

    public function __construct()
    {
        $this->orders = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getStreetNumber(): ?string
    {
        return $this->street_number;
    }

    public function setStreetNumber(string $street_number): static
    {
        $this->street_number = $street_number;

        return $this;
    }

    public function getStreetName(): ?string
    {
        return $this->street_name;
    }

    public function setStreetName(string $street_name): static
    {
        $this->street_name = $street_name;

        return $this;
    }

    public function getPostalCode(): ?string
    {
        return $this->postal_code;
    }

    public function setPostalCode(string $postal_code): static
    {
        $this->postal_code = $postal_code;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country): static
    {
        $this->country = $country;

        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function isIsActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection
    {
        return $this->orders;
    }

    public function addOrder(Order $order): static
    {
        if (!$this->orders->contains($order)) {
            $this->orders->add($order);
            $order->setAddress($this);
        }

        return $this;
    }

    public function removeOrder(Order $order): static
    {
        if ($this->orders->removeElement($order)) {
            // set the owning side to null (unless already changed)
            if ($order->getAddress() === $this) {
                $order->setAddress(null);
            }
        }

        return $this;
    }
}
