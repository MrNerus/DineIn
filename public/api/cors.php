<?php
// Set CORS headers to allow Angular frontend requests
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if (!headers_sent()) {
    if ($origin !== '*') {
        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token");
    header("Content-Type: application/json; charset=UTF-8");
}

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getJsonInput() {
    $rawInput = file_get_contents("php://input");
    if (empty($rawInput) && php_sapi_name() === 'cli' && defined('STDIN')) {
        $rawInput = file_get_contents("php://stdin");
    }
    return json_decode($rawInput, true) ?? [];
}
