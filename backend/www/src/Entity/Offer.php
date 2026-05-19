<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OfferRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OfferRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['offer:read']],
    denormalizationContext: ['groups' => ['offer:write']],
)]
class Offer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['offer:read', 'message:read', 'conversation:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['offer:read', 'offer:write', 'message:read', 'conversation:read'])]
    private ?int $amount = null;

    #[ORM\Column(length: 25)]
    #[Groups(['offer:read', 'offer:write', 'message:read', 'conversation:read'])]
    private ?string $status = null;

    #[ORM\Column]
    #[Groups(['offer:read', 'offer:write', 'message:read', 'conversation:read'])]
    private ?\DateTime $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
