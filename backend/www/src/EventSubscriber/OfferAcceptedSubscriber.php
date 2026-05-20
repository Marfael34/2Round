<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Offer;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class OfferAcceptedSubscriber implements EventSubscriberInterface
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['createOrderOnAccept', EventPriorities::POST_WRITE],
        ];
    }

    public function createOrderOnAccept(ViewEvent $event): void
    {
        $offer = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        // On écoute uniquement les modifications (PUT/PATCH) de l'entité Offer
        if (!$offer instanceof Offer || !in_array($method, [Request::METHOD_PUT, Request::METHOD_PATCH])) {
            return;
        }

        if ($offer->getStatus() === 'accepted') {
            // Retrouver le message qui contient cette offre pour accéder au produit
            $message = $this->em->getRepository(Message::class)->findOneBy(['offer' => $offer]);
            if (!$message) return;

            $conversation = $message->getConversation();
            $product = $conversation->getProductId();

            // Création de la commande
            $order = new Order();
            $order->setNumber('CMD-' . strtoupper(substr(uniqid(), -6)));
            $order->setTotalprice((string)$offer->getAmount());
            $order->setStatus('pending_payment');
            $order->setCreatedAt(new \DateTime());
            $order->setServicesFees(250); // Frais de la plateforme (en centimes)
            $order->setShippingFees(490); // Frais de livraison estimés (en centimes)
            
            $this->em->persist($order);

            // Lier le produit à la commande via OrderItem
            $orderItem = new OrderItem();
            $orderItem->setOrders($order);
            $orderItem->setProducts($product);
            $orderItem->setPricePurchase((string)$offer->getAmount());
            
            $this->em->persist($orderItem);
            $this->em->flush();
        }
    }
}