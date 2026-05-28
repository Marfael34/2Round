<?php
$logPath = __DIR__ . '/../payment_error.log';
if (file_exists($logPath)) {
    echo file_get_contents($logPath);
} else {
    echo "No log file found.";
}
