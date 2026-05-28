<?php
require __DIR__.'/../vendor/autoload.php';

// Load environment variables
use Symfony\Component\Dotenv\Dotenv;
(new Dotenv())->bootEnv(__DIR__.'/../.env');

// Boot the kernel
use App\Kernel;
$kernel = new Kernel('dev', true);
$kernel->boot();

$container = $kernel->getContainer();
$em = $container->get('doctrine.orm.entity_manager');

// Find a valid conversation
$conv = $em->getConnection()->fetchAssociative("SELECT id FROM conversation LIMIT 1");
if (!$conv) {
    echo "No conversation found\n";
    exit;
}

$convId = $conv['id'];

// Mock the request
$client = new \GuzzleHttp\Client();
try {
    $response = $client->post('http://localhost/api/orders/payment-success', [
        'json' => [
            'conversationId' => clone $convId, // or integer
            'amount' => 2000
        ]
    ]);
    echo $response->getBody();
} catch (\Exception $e) {
    echo $e->getMessage();
}
