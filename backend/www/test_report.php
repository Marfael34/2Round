<?php
$ch = curl_init('http://localhost/api/login_check');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@admin.com', 'password' => 'admin']));
$result = curl_exec($ch);
$token = json_decode($result, true)['token'] ?? null;

if (!$token) {
    die("Login failed: $result");
}

$ch2 = curl_init('http://localhost/api/reports');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/ld+json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode([
    'reason' => 'fake',
    'description' => 'test',
    'createdAt' => '2026-06-05T13:43:00Z',
    'sender' => '/api/users/61',
    'product' => '/api/products/1'
]));
$response = curl_exec($ch2);
echo $response;
