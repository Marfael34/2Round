<?php
require __DIR__.'/vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;
(new Dotenv())->bootEnv(__DIR__.'/.env');

$kernel = new App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$userRepository = $container->get('doctrine')->getRepository(App\Entity\User::class);
$user = $userRepository->find(72);
$jwtManager = $container->get('lexik_jwt_authentication.jwt_manager');
$token = $jwtManager->create($user);

$ch = curl_init('http://localhost:80/api/notifications');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/ld+json'
]);
$result = curl_exec($ch);
echo "API RESPONSE:\n" . $result . "\n";
