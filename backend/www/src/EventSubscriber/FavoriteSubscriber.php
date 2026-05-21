<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Favorite;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class FavoriteSubscriber implements EventSubscriberInterface
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['setUserForFavorite', EventPriorities::PRE_WRITE],
        ];
    }

    public function setUserForFavorite(ViewEvent $event): void
    {
        $favorite = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$favorite instanceof Favorite || Request::METHOD_POST !== $method) {
            return;
        }

        $user = $this->security->getUser();
        if ($user) {
            $favorite->setUsers($user);
        }
    }
}
