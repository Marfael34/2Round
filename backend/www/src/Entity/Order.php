<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
#[ApiResource]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $number = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $totalprice = null;

    #[ORM\Column]
    private ?int $shipping_fees = null;

    #[ORM\Column]
    private ?int $services_fees = null;

    #[ORM\Column(length: 25)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_payment_intent_id = null;

    #[ORM\Column(length:255, nullable: true)]
    private ?string $stripe_tansfer_id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    private ?string $weight_total = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $shipping_label_url = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $trackingNumber = null;

    /**
     * @var Collection<int, Invoice>
     */
    #[ORM\OneToMany(targetEntity: Invoice::class, mappedBy: 'orders')]
    private Collection $invoices;

    /**
     * @var Collection<int, OrderItem>
     */
    #[ORM\OneToMany(targetEntity: OrderItem::class, mappedBy: 'orders')]
    private Collection $orderItems;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'order')]
    private Collection $reports;

    #[ORM\ManyToOne(inversedBy: 'ordersAsBuyer')]
    private ?User $buyer = null;

    #[ORM\ManyToOne(inversedBy: 'orders')]
    private ?Adress $address = null;


    public function __construct()
    {
        $this->invoices = new ArrayCollection();
        $this->orderItems = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumber(): ?string
    {
        return $this->number;
    }

    public function setNumber(string $number): static
    {
        $this->number = $number;

        return $this;
    }

    public function getTotalprice(): ?string
    {
        return $this->totalprice;
    }

    public function setTotalprice(string $totalprice): static
    {
        $this->totalprice = $totalprice;

        return $this;
    }

    public function getShippingFees(): ?int
    {
        return $this->shipping_fees;
    }

    public function setShippingFees(int $shipping_fees): static
    {
        $this->shipping_fees = $shipping_fees;

        return $this;
    }

    public function getServicesFees(): ?int
    {
        return $this->services_fees;
    }

    public function setServicesFees(int $services_fees): static
    {
        $this->services_fees = $services_fees;

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

    public function getStripePaymentIntentId(): ?int
    {
        return $this->stripe_payment_intent_id;
    }

    public function setStripePaymentIntentId(?int $stripe_payment_intent_id): static
    {
        $this->stripe_payment_intent_id = $stripe_payment_intent_id;

        return $this;
    }

    public function getStripeTansferId(): ?int
    {
        return $this->stripe_tansfer_id;
    }

    public function setStripeTansferId(?int $stripe_tansfer_id): static
    {
        $this->stripe_tansfer_id = $stripe_tansfer_id;

        return $this;
    }

    public function getWeightTotal(): ?string
    {
        return $this->weight_total;
    }

    public function setWeightTotal(string $weight_total): static
    {
        $this->weight_total = $weight_total;

        return $this;
    }

    public function getShippingLabelUrl(): ?string
    {
        return $this->shipping_label_url;
    }

    public function setShippingLabelUrl(string $shipping_label_url): static
    {
        $this->shipping_label_url = $shipping_label_url;

        return $this;
    }

    public function getTrackingNumber(): ?string
    {
        return $this->trackingNumber;
    }

    public function setTrackingNumber(string $trackingNumber): static
    {
        $this->trackingNumber = $trackingNumber;

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
            $invoice->setOrders($this);
        }

        return $this;
    }

    public function removeInvoice(Invoice $invoice): static
    {
        if ($this->invoices->removeElement($invoice)) {
            // set the owning side to null (unless already changed)
            if ($invoice->getOrders() === $this) {
                $invoice->setOrders(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function getOrderItems(): Collection
    {
        return $this->orderItems;
    }

    public function addOrderItem(OrderItem $orderItem): static
    {
        if (!$this->orderItems->contains($orderItem)) {
            $this->orderItems->add($orderItem);
            $orderItem->setOrders($this);
        }

        return $this;
    }

    public function removeOrderItem(OrderItem $orderItem): static
    {
        if ($this->orderItems->removeElement($orderItem)) {
            // set the owning side to null (unless already changed)
            if ($orderItem->getOrders() === $this) {
                $orderItem->setOrders(null);
            }
        }

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
            $report->setOrder($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getOrder() === $this) {
                $report->setOrder(null);
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

    public function getAddress(): ?Adress
    {
        return $this->address;
    }

    public function setAddress(?Adress $address): static
    {
        $this->address = $address;

        return $this;
    }
}

