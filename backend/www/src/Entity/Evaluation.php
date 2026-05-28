<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\EvaluationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: EvaluationRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['evaluation:read']],
    denormalizationContext: ['groups' => ['evaluation:write']],
)]
class Evaluation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['evaluation:read', 'user:read', 'product:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['evaluation:read', 'evaluation:write', 'user:read', 'product:read'])]
    private ?int $rating = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['evaluation:read', 'evaluation:write', 'user:read', 'product:read'])]
    private ?string $comment = null;

    #[ORM\Column]
    #[Groups(['evaluation:read', 'user:read', 'product:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'sentEvaluations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['evaluation:read', 'evaluation:write', 'user:read', 'product:read'])]
    private ?User $sender = null;

    #[ORM\ManyToOne(inversedBy: 'receivedEvaluations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['evaluation:read', 'evaluation:write'])]
    private ?User $receiver = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

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

    public function getSender(): ?User
    {
        return $this->sender;
    }

    public function setSender(?User $sender): static
    {
        $this->sender = $sender;

        return $this;
    }

    public function getReceiver(): ?User
    {
        return $this->receiver;
    }

    public function setReceiver(?User $receiver): static
    {
        $this->receiver = $receiver;

        return $this;
    }
}
