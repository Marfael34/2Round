<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        $reason = 'Aucun motif précisé.';
        $sanctions = $user->getSanctions();
        if (count($sanctions) > 0) {
            $sanctionsArray = $sanctions->toArray();
            usort($sanctionsArray, function($a, $b) {
                return $b->getCreatedAt() <=> $a->getCreatedAt();
            });
            $reason = $sanctionsArray[0]->getReason() ?: 'Aucun motif précisé.';
        }

        if (!$user->getIsActive()) {
            throw new CustomUserMessageAccountStatusException("BAN_DEFINITIF|||$reason");
        }

        if ($user->getBannedUntil() !== null && $user->getBannedUntil() > new \DateTime()) {
            $formattedDate = $user->getBannedUntil()->format('d/m/Y à H:i');
            throw new CustomUserMessageAccountStatusException("BAN_TEMPORAIRE|||$formattedDate|||$reason");
        }
    }

    public function checkPostAuth(UserInterface $user, ?\Symfony\Component\Security\Core\Authentication\Token\TokenInterface $token = null): void
    {
    }
}
