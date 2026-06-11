<?php
require_once __DIR__.'/vendor/autoload.php';

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

$kernel = new Kernel('dev', true);
$request = Request::create('/api/adresses', 'GET');
$response = $kernel->handle($request);
echo $response->getStatusCode() . "\n";
echo $response->getContent();
$kernel->terminate($request, $response);
