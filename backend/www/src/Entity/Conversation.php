<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ConversationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ConversationRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['conversation:read']],
    denormalizationContext: ['groups' => ['conversation:write']],
)]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read', 'admin:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['conversation:read', 'conversation:write'])]
    private bool $isActive = true;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'conversation')]
    #[Groups(['conversation:read'])]
    private Collection $messages;

    #[ORM\ManyToOne(inversedBy: 'conversations')]
    #[Groups(['conversation:read', 'conversation:write', 'admin:read'])]
    private ?User $buyer = null;

    #[ORM\ManyToOne]
    #[Groups(['conversation:read', 'conversation:write', 'admin:read'])]
    private ?User $seller = null;

    #[ORM\ManyToOne(inversedBy: 'conversations')]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?Product $product = null;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'conversation')]
    private Collection $reports;

    public function __construct()
    {
        $this->messages = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getIsActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setConversation($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getConversation() === $this) {
                $message->setConversation(null);
            }
        }

        return $this;
    }

    public function getBuyer(): ?User
    {
        return $this->buyer;
    }

    public function setBuyer(?User $buyer): static
    {
        $this->buyer = $buyer;
        return $this;
    }

    public function getBuyerid(): ?User
    {
        return $this->buyer;
    }

    public function setBuyerid(?User $buyer): static
    {
        $this->buyer = $buyer;

        return $this;
    }

    public function getSeller(): ?User
    {
        return $this->seller;
    }

    public function setSeller(?User $seller): static
    {
        $this->seller = $seller;
        return $this;
    }

    public function getSellerId(): ?User
    {
        return $this->seller;
    }

    public function setSellerId(?User $seller): static
    {
        $this->seller = $seller;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;
        return $this;
    }

    public function getProductId(): ?Product
    {
        return $this->product;
    }

    public function setProductId(?Product $product): static
    {
        $this->product = $product;

        return $this;
    }

    /**
     * @return Collection<int, Report>
     */
    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Report $report): static
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
            $report->setConversation($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getConversation() === $this) {
                $report->setConversation(null);
            }
        }

        return $this;
    }

    #[Groups(['conversation:read', 'admin:read'])]
    public function getIsReported(): bool
    {
        if (count($this->reports) > 0) {
            return true;
        }
        foreach ($this->messages as $message) {
            if (count($message->getReports()) > 0) {
                return true;
            }
        }
        return false;
    }
}
