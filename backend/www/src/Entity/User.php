<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ApiResource(
    normalizationContext: ['groups' => ['user:read'], 'enable_max_depth' => true],
    denormalizationContext: ['groups' => ['user:write']],
    operations: [
        new \ApiPlatform\Metadata\GetCollection(),
        new \ApiPlatform\Metadata\Post(),
        new \ApiPlatform\Metadata\Get(),
        new \ApiPlatform\Metadata\Patch(
            security: "is_granted('ROLE_ADMIN') or object == user",
            securityMessage: "Vous ne pouvez modifier que votre propre profil."
        ),
        new \ApiPlatform\Metadata\Delete(
            security: "is_granted('ROLE_ADMIN')"
        )
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['email' => 'exact'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'conversation:read', 'product:read', 'admin:read', 'sanction:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read', 'user:write', 'admin:write', 'admin:read', 'sanction:read'])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read', 'admin:write'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Groups(['user:write'])]
    private ?string $password = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?string $lastname = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?string $firstname = null;

    #[ORM\Column(length: 150)]
    #[Groups(['user:read', 'user:write', 'product:read', 'conversation:read', 'admin:write', 'admin:read', 'sanction:read'])]
    private ?string $pseudo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:write', 'product:read', 'conversation:read', 'admin:write'])]
    private ?string $avatar = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?\DateTime $birthday_at = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?string $weight = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?int $budget = null;

    #[ORM\Column]
    #[Groups(['user:read', 'user:write', 'admin:write', 'admin:read'])]
    private ?bool $isActive = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_account_id = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_customer_id = null;

    /**
     * @var Collection<int, Favorite>
     */
    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'users')]
    private Collection $favorites;

    /**
     * @var Collection<int, Invoice>
     */
    #[ORM\OneToMany(targetEntity: Invoice::class, mappedBy: 'users')]
    private Collection $invoices;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'users')]
    private Collection $messages;

    #[ORM\OneToOne(mappedBy: 'user', targetEntity: Wallet::class, cascade: ['persist', 'remove'])]
    private ?Wallet $wallet = null;

    /**
     * @var Collection<int, Conversation>
     */
    #[ORM\OneToMany(targetEntity: Conversation::class, mappedBy: 'buyer')]
    private Collection $conversations;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?Boxe $boxe = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?Level $level = null;

    /**
     * @var Collection<int, Evaluation>
     */
    #[ORM\OneToMany(targetEntity: Evaluation::class, mappedBy: 'receiver')]
    #[Groups(['user:read', 'product:read'])]
    #[MaxDepth(1)]
    private Collection $receivedEvaluations;

    /**
     * @var Collection<int, Evaluation>
     */
    #[ORM\OneToMany(targetEntity: Evaluation::class, mappedBy: 'sender')]
    #[MaxDepth(1)]
    private Collection $sentEvaluations;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?Gender $gender = null;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'sender')]
    private Collection $reports;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'reportedUser')]
    private Collection $reportsReceived;

    /**
     * @var Collection<int, Adress>
     */
    #[ORM\OneToMany(targetEntity: Adress::class, mappedBy: 'user')]
    private Collection $adresses;

    /**
     * @var Collection<int, Sanction>
     */
    #[ORM\OneToMany(targetEntity: Sanction::class, mappedBy: 'targetUser')]
    #[Groups(['admin:read', 'user:read'])]
    private Collection $sanctions;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'recipient', orphanRemoval: true)]
    private Collection $notifications;

    /**
     */

    #[ORM\Column]
    private ?bool $is_onboarding_completed = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read', 'user:write', 'admin:write'])]
    private ?int $size = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $refreshToken = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $refreshTokenExpiredAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['admin:read', 'admin:write', 'user:read'])]
    private ?\DateTimeInterface $bannedUntil = null;

    public function __construct()
    {
        $this->favorites = new ArrayCollection();
        $this->invoices = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->conversations = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->reportsReceived = new ArrayCollection();
        $this->adresses = new ArrayCollection();
        $this->receivedEvaluations = new ArrayCollection();
        $this->sentEvaluations = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->is_onboarding_completed = false;
        $this->isActive = true;
        $this->roles = ['ROLE_USER'];
        $this->sanctions = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    /**
     * @return Collection<int, Sanction>
     */
    public function getSanctions(): Collection
    {
        return $this->sanctions;
    }

    public function addSanction(Sanction $sanction): static
    {
        if (!$this->sanctions->contains($sanction)) {
            $this->sanctions->add($sanction);
            $sanction->setTargetUser($this);
        }

        return $this;
    }

    public function removeSanction(Sanction $sanction): static
    {
        if ($this->sanctions->removeElement($sanction)) {
            // set the owning side to null (unless already changed)
            if ($sanction->getTargetUser() === $this) {
                $sanction->setTargetUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setRecipient($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getRecipient() === $this) {
                $notification->setRecipient(null);
            }
        }

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    // __serialize supprimé car il altère le mot de passe lors de la sérialisation (CRC32C)
    // ce qui peut faire échouer l'authentification JWT "stateless".

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getBirthdayAt(): ?\DateTime
    {
        return $this->birthday_at;
    }

    #[Groups(['user:write', 'admin:write'])]
    public function setBirthdayAt(?\DateTimeInterface $birthday_at): static
    {
        $this->birthday_at = $birthday_at;

        return $this;
    }

    public function getWeight(): ?string
    {
        return $this->weight;
    }

    #[Groups(['user:write'])]
    public function setWeight(string $weight): static
    {
        $this->weight = $weight;

        return $this;
    }

    public function getBudget(): ?int
    {
        return $this->budget;
    }

    #[Groups(['admin:write'])]
    public function setBudget(?int $budget): static
    {
        $this->budget = $budget;

        return $this;
    }

    public function getIsActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getStripeAccountId(): ?string
    {
        return $this->stripe_account_id;
    }

    public function setStripeAccountId(?string $stripe_account_id): static
    {
        $this->stripe_account_id = $stripe_account_id;

        return $this;
    }

    public function getStripeCustomerId(): ?string
    {
        return $this->stripe_customer_id;
    }

    public function setStripeCustomerId(?string $stripe_customer_id): static
    {
        $this->stripe_customer_id = $stripe_customer_id;

        return $this;
    }

    /**
     * @return Collection<int, Favorite>
     */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(Favorite $favorite): static
    {
        if (!$this->favorites->contains($favorite)) {
            $this->favorites->add($favorite);
            $favorite->setUsers($this);
        }

        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite)) {
            // set the owning side to null (unless already changed)
            if ($favorite->getUsers() === $this) {
                $favorite->setUsers(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Invoice>
     */
    public function getInvoices(): Collection
    {
        return $this->invoices;
    }

    public function addInvoice(Invoice $invoice): static
    {
        if (!$this->invoices->contains($invoice)) {
            $this->invoices->add($invoice);
            $invoice->setUsers($this);
        }

        return $this;
    }

    public function removeInvoice(Invoice $invoice): static
    {
        if ($this->invoices->removeElement($invoice)) {
            // set the owning side to null (unless already changed)
            if ($invoice->getUsers() === $this) {
                $invoice->setUsers(null);
            }
        }

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
            $message->setUsers($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getUsers() === $this) {
                $message->setUsers(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getConversations(): Collection
    {
        return $this->conversations;
    }

    public function addConversation(Conversation $conversation): static
    {
        if (!$this->conversations->contains($conversation)) {
            $this->conversations->add($conversation);
            $conversation->setBuyerid($this);
        }

        return $this;
    }

    public function removeConversation(Conversation $conversation): static
    {
        if ($this->conversations->removeElement($conversation)) {
            // set the owning side to null (unless already changed)
            if ($conversation->getBuyerid() === $this) {
                $conversation->setBuyerid(null);
            }
        }

        return $this;
    }

    public function getBoxeId(): ?Boxe
    {
        return $this->boxe;
    }

    #[Groups(['user:write', 'admin:write'])]
    public function setBoxeId(?Boxe $boxe): static
    {
        $this->boxe = $boxe;

        return $this;
    }

    public function getLevelId(): ?Level
    {
        return $this->level;
    }

    #[Groups(['user:write', 'admin:write'])]
    public function setLevelId(?Level $level): static
    {
        $this->level = $level;

        return $this;
    }

    public function getGenderId(): ?Gender
    {
        return $this->gender;
    }

    #[Groups(['user:write', 'admin:write'])]
    public function setGenderId(?Gender $gender): static
    {
        $this->gender = $gender;

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
            $report->setSender($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getSender() === $this) {
                $report->setSender(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Report>
     */
    public function getReportsReceived(): Collection
    {
        return $this->reportsReceived;
    }

    public function addReportReceived(Report $report): static
    {
        if (!$this->reportsReceived->contains($report)) {
            $this->reportsReceived->add($report);
            $report->setReportedUser($this);
        }

        return $this;
    }

    public function removeReportReceived(Report $report): static
    {
        if ($this->reportsReceived->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getReportedUser() === $this) {
                $report->setReportedUser(null);
            }
        }

        return $this;
    }

    public function isOnboardingCompleted(): ?bool
    {
        return $this->is_onboarding_completed;
    }

    public function setIsOnboardingCompleted(bool $is_onboarding_completed): static
    {
        $this->is_onboarding_completed = $is_onboarding_completed;

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

    public function getSize(): ?int
    {
        return $this->size;
    }

    #[Groups(['user:write', 'admin:write'])]
    public function setSize(int $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function getRefreshToken(): ?string
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(?string $refreshToken): static
    {
        $this->refreshToken = $refreshToken;

        return $this;
    }

    public function getRefreshTokenExpiredAt(): ?\DateTimeInterface
    {
        return $this->refreshTokenExpiredAt;
    }

    public function setRefreshTokenExpiredAt(?\DateTimeInterface $refreshTokenExpiredAt): static
    {
        $this->refreshTokenExpiredAt = $refreshTokenExpiredAt;

        return $this;
    }

    public function getBannedUntil(): ?\DateTimeInterface
    {
        return $this->bannedUntil;
    }

    #[Groups(['admin:write'])]
    public function setBannedUntil(?\DateTimeInterface $bannedUntil): static
    {
        $this->bannedUntil = $bannedUntil;

        return $this;
    }

    /**
     * @return Collection<int, Adress>
     */
    public function getAdresses(): Collection
    {
        return $this->adresses;
    }

    public function addAdress(Adress $adress): static
    {
        if (!$this->adresses->contains($adress)) {
            $this->adresses->add($adress);
            $adress->setUser($this);
        }

        return $this;
    }

    public function removeAdress(Adress $adress): static
    {
        if ($this->adresses->removeElement($adress)) {
            // set the owning side to null (unless already changed)
            if ($adress->getUser() === $this) {
                $adress->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Evaluation>
     */
    public function getReceivedEvaluations(): Collection
    {
        return $this->receivedEvaluations;
    }

    public function addReceivedEvaluation(Evaluation $evaluation): static
    {
        if (!$this->receivedEvaluations->contains($evaluation)) {
            $this->receivedEvaluations->add($evaluation);
            $evaluation->setReceiver($this);
        }

        return $this;
    }

    public function removeReceivedEvaluation(Evaluation $evaluation): static
    {
        if ($this->receivedEvaluations->removeElement($evaluation)) {
            // set the owning side to null (unless already changed)
            if ($evaluation->getReceiver() === $this) {
                $evaluation->setReceiver(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Evaluation>
     */
    public function getSentEvaluations(): Collection
    {
        return $this->sentEvaluations;
    }

    public function addSentEvaluation(Evaluation $evaluation): static
    {
        if (!$this->sentEvaluations->contains($evaluation)) {
            $this->sentEvaluations->add($evaluation);
            $evaluation->setSender($this);
        }

        return $this;
    }

    public function removeSentEvaluation(Evaluation $evaluation): static
    {
        if ($this->sentEvaluations->removeElement($evaluation)) {
            // set the owning side to null (unless already changed)
            if ($evaluation->getSender() === $this) {
                $evaluation->setSender(null);
            }
        }

        return $this;
    }
    public function getWallet(): ?Wallet
    {
        return $this->wallet;
    }

    public function setWallet(?Wallet $wallet): static
    {
        // unset the owning side of the relation if necessary
        if ($wallet === null && $this->wallet !== null) {
            // we don't unset the user from the wallet if it's strictly typed
            // but we can set it to null if the Wallet's setUser accepts null. 
            // Wallet->setUser(User) is not nullable in our Wallet class, so we leave it.
        }

        // set the owning side of the relation if necessary
        if ($wallet !== null && $wallet->getUser() !== $this) {
            $wallet->setUser($this);
        }

        $this->wallet = $wallet;

        return $this;
    }

    /**
     */
}
