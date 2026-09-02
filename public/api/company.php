<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

// Default company data matching branches.json
$defaultCompany = [
    "name" => "Savana Sushi",
    "logo" => "assets/imgs/logo.png",
    "favicon" => "assets/imgs/logo.png",
    "apps" => [
        "googlePlayStore" => "https://play.google.com/",
        "appleAppStore" => "https://apps.apple.com/"
    ],
    "socials" => [
        "facebook" => "https://www.facebook.com/savanasushi",
        "instagram" => "https://www.instagram.com/savana.sushi"
    ],
    "deliveryPartners" => [
        [
            "name" => "Uber Eats",
            "url" => "https://www.ubereats.com/store/savana-sushi-amadora/cwzXn1P5RNODeKdRpNeZig?diningMode=DELIVERY"
        ],
        [
            "name" => "Glovo",
            "url" => "https://glovoapp.com/pt/pt/lisboa/savana-sushi-amadora-lis/"
        ],
        [
            "name" => "Bolt Food",
            "url" => "https://food.bolt.eu/"
        ]
    ],
    "notice" => [
        "assets/imgs/Ads1.jpg",
        "assets/imgs/Ads2.png",
        "assets/imgs/Ads3.jpg"
    ]
];

if ($method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $defaultCompany
    ]);
} elseif ($method === 'POST' || $method === 'PUT') {
    $input = getJsonInput();
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Company information updated successfully (PoC Mode)',
        'data' => !empty($input) ? $input : $defaultCompany,
        'updatedAt' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
