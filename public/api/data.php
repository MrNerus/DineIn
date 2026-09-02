<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

// Load full branches.json as reference if available
$jsonFilePath = __DIR__ . '/../src/assets/data/branches.json';
$fullData = null;

if (file_exists($jsonFilePath)) {
    $content = file_get_contents($jsonFilePath);
    $fullData = json_decode($content, true);
}

if ($method === 'GET') {
    http_response_code(200);
    echo json_encode($fullData ?? [
        'companyInfo' => [
            'name' => 'Savana Sushi',
            'logo' => 'assets/imgs/logo.png',
            'favicon' => 'assets/imgs/logo.png',
            'apps' => ['googlePlayStore' => '', 'appleAppStore' => ''],
            'socials' => ['facebook' => '', 'instagram' => ''],
            'deliveryPartners' => [],
            'notice' => []
        ],
        'branchInfo' => []
    ]);
} elseif ($method === 'POST' || $method === 'PUT') {
    $input = getJsonInput();
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Complete data saved successfully (PoC Mode)',
        'data' => $input,
        'savedAt' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
