<?php

namespace App\Serializer;

use ApiPlatform\State\SerializerContextBuilderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\User;

final class UserContextBuilder implements SerializerContextBuilderInterface
{
    private $decorated;
    private $security;

    public function __construct(SerializerContextBuilderInterface $decorated, Security $security)
    {
        $this->decorated = $decorated;
        $this->security = $security;
    }

    public function createFromRequest(Request $request, bool $normalization, ?array $extractedAttributes = null): array
    {
        $context = $this->decorated->createFromRequest($request, $normalization, $extractedAttributes);
        
        $resourceClass = $context['resource_class'] ?? null;

        if ($resourceClass === User::class && isset($context['groups']) && $this->security->isGranted('ROLE_ADMIN') && false === $normalization) {
            $context['groups'][] = 'admin:write';
        }

        return $context;
    }
}
