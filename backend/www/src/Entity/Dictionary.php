<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\DictionaryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;

#[ORM\Entity(repositoryClass: DictionaryRepository::class)]
#[ApiResource]
#[ApiFilter(SearchFilter::class, properties: ['type' => 'exact'])]
class Dictionary
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'product:read', 'product:write', 'user:write', 'admin:write'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'product:read', 'product:write', 'user:write', 'admin:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'product:read', 'product:write', 'user:write', 'admin:write'])]
    private ?string $label = null;

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

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
