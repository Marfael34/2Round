<?php
$token = trim(shell_exec("php bin/console lexik:jwt:generate-token admin@admin.com | tail -n 1"));
$ch = curl_init("http://localhost/api/users");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", "Accept: application/ld+json"]);
$res = curl_exec($ch);
curl_close($ch);
echo "RESPONSE_LENGTH: " . strlen($res) . "\n";
$data = json_decode($res, true);
if (isset($data['hydra:member'])) {
  echo "COUNT: " . count($data['hydra:member']) . "\n";
} else {
  echo "NO HYDRA MEMBER\n";
  echo substr($res, 0, 300) . "\n";
}
