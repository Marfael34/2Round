<?php
require __DIR__.'/vendor/autoload.php';
$kernel = new App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();
$notifications = $em->getRepository(\App\Entity\Notification::class)->findAll();
echo "Total notifications: " . count($notifications) . "\n";
foreach($notifications as $n) {
    echo $n->getId() . " | " . $n->getType() . " | " . $n->getContent() . " | User ID: " . $n->getUser()->getId() . "\n";
}
