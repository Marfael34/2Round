<?php
require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

(new Dotenv())->bootEnv(__DIR__.'/.env');

$kernel = new App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();

// Find the last notification
$notifications = $em->getRepository(\App\Entity\Notification::class)->findBy([], ['id' => 'DESC'], 1);
if (empty($notifications)) {
    die("No notifications in DB at all.\n");
}
$targetUser = $notifications[0]->getUser();
echo "Found notification for user: " . $targetUser->getEmail() . "\n";

$tokenManager = $container->get('lexik_jwt_authentication.jwt_manager');
$token = $tokenManager->create($targetUser);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:80/api/notifications?order[createdAt]=desc");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/ld+json"
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Code: $httpcode\n";
echo "Response: $response\n";
