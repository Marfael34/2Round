<?php
require __DIR__.'/vendor/autoload.php';
$kernel = new App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();
$query = $em->createQuery("SELECT u, a FROM App\Entity\User u LEFT JOIN u.adresses a");
echo $query->getSQL() . "\n";
$query->getResult();
