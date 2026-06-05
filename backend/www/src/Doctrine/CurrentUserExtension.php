<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Notification;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

class CurrentUserExtension implements QueryCollectionExtensionInterface
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if (Notification::class !== $resourceClass) {
            return;
        }

        $user = $this->security->getUser();

        $rootAlias = $queryBuilder->getRootAliases()[0];

        if (null === $user) {
            // Utilisateur non connecté : aucune notification
            $queryBuilder->andWhere(sprintf('%s.recipient IS NULL', $rootAlias))
                         ->andWhere('1 = 0'); // Retourne vide
            return;
        }

        if ($this->security->isGranted('ROLE_ADMIN')) {
            // L'admin voit les siennes ET les notifications globales (recipient = null)
            $queryBuilder->andWhere(sprintf('%s.recipient = :current_user OR %s.recipient IS NULL', $rootAlias, $rootAlias))
                         ->setParameter('current_user', $user);
            return;
        }

        // Utilisateur normal : voit uniquement ses notifications
        $queryBuilder->andWhere(sprintf('%s.recipient = :current_user', $rootAlias))
                     ->setParameter('current_user', $user);
    }
}
