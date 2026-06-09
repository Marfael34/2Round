<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\SanctionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: SanctionRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['sanction:read']],
    denormalizationContext: ['groups' => ['sanction:write']],
    operations: [
        new \ApiPlatform\Metadata\GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new \ApiPlatform\Metadata\Post(security: "is_granted('ROLE_ADMIN')"),
        new \ApiPlatform\Metadata\Get(security: "is_granted('ROLE_ADMIN') or object.getTargetUser() == user"),
        new \ApiPlatform\Metadata\Delete(security: "is_granted('ROLE_ADMIN')")
    ]
)]
class Sanction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['sanction:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['sanction:read', 'sanction:write', 'user:read'])]
    private ?string $type = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['sanction:read', 'sanction:write', 'user:read'])]
    private ?string $reason = null;

    #[ORM\Column]
    #[Groups(['sanction:read', 'user:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'sanctions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['sanction:read', 'sanction:write'])]
    private ?User $targetUser = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(string $reason): static
    {
        $this->reason = $reason;

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

    public function getTargetUser(): ?User
    {
        return $this->targetUser;
    }

    public function setTargetUser(?User $targetUser): static
    {
        $this->targetUser = $targetUser;

        return $this;
    }
}
