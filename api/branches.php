<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

// Default branch data matching branches.json
$defaultBranches = [
    [
        "identifier" => "Amadora",
        "name" => "Amadora",
        "address" => "1R. Dr. António José de Almeida 10A, 2700-269 Amadora",
        "phone" => "+351214952367",
        "lat" => 38.755245291772184,
        "long" => -9.220227233102092,
        "openingTime" => [
            [
                "day" => "Segunda a domingo (Monday to Sunday)",
                "timePt" => "das 11h às 15h30, das 18h às 23h",
                "timeEn" => "11 AM to 3:30 PM, 6 PM to 11 PM"
            ]
        ],
        "redirects" => [
            "reservation" => "https://reservation.umai.io/en/widget/savana-sushi-amadora",
            "delivery" => "https://reservation.umai.io/en/widget/savana-sushi-amadora?party_size=2",
            "pickup" => "https://reservation.umai.io/en/widget/savana-sushi-amadora?party_size=2",
            "location" => "https://maps.app.goo.gl/XmMZ91ucpEXyWpZg9?g_st=ipc",
            "pdf" => [
                "dinein1" => "assets/pdfs/Menu.pdf",
                "dinein2" => "assets/pdfs/SavanaSushi_Amadora_Rodizio.pdf"
            ]
        ],
        "reviews" => [
            [
                "name" => "Google",
                "url" => "https://www.google.com/search?q=savana+sushi+amadora"
            ],
            [
                "name" => "Tripadvisor",
                "url" => "https://www.tripadvisor.com/Restaurant_Review-g189158-d25118790-Reviews-Savana_Sushi-Lisbon_Lisbon_District_Central_Portugal.html"
            ],
            [
                "name" => "The Fork",
                "url" => "https://www.zomato.com/pt/lisboa/savana-sushi-alvalade"
            ]
        ]
    ],
    [
        "identifier" => "Sintra",
        "name" => "Mem Martins - Sintra",
        "address" => "Estr. Algueirão 21, 2725-025 Algueirão-Mem Martins",
        "phone" => "+351210133261",
        "lat" => 38.79846169317772,
        "long" => -9.341457822088252,
        "openingTime" => [
            [
                "day" => "Segunda a domingo (Monday to Sunday)",
                "timePt" => "das 11h às 15h30, das 18h às 23h",
                "timeEn" => "11 AM to 3:30 PM, 6 PM to 11 PM"
            ]
        ],
        "redirects" => [
            "reservation" => "https://reservation.umai.io/en/widget/savana-sushi-mem-martins",
            "delivery" => "https://reservation.umai.io/en/widget/savana-sushi-mem-martins?party_size=2",
            "pickup" => "https://reservation.umai.io/en/widget/savana-sushi-mem-martins?party_size=2",
            "location" => "https://maps.app.goo.gl/gRD6ZAo21mNFAn3N6?g_st=iwb",
            "pdf" => [
                "dinein1" => "assets/pdfs/Menu.pdf",
                "dinein2" => "assets/pdfs/SavanaSushi_MemMartins_Rodizio.pdf"
            ]
        ],
        "reviews" => [
            [
                "name" => "Google",
                "url" => "https://www.google.com/search?q=savana+sushi+mem+martins"
            ],
            [
                "name" => "Tripadvisor",
                "url" => "https://www.tripadvisor.com/Restaurant_Review-g189158-d25118790-Reviews-Savana_Sushi-Lisbon_Lisbon_District_Central_Portugal.html"
            ],
            [
                "name" => "The Fork",
                "url" => "https://www.zomato.com/pt/lisboa/savana-sushi-alvalade"
            ]
        ]
    ]
];

if ($method === 'GET') {
    $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : null;
    if ($identifier) {
        $found = null;
        foreach ($defaultBranches as $branch) {
            if (strtolower($branch['identifier']) === strtolower($identifier)) {
                $found = $branch;
                break;
            }
        }
        if ($found) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $found]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Branch not found']);
        }
    } else {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $defaultBranches]);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Branch created successfully (PoC Mode)',
        'data' => $input,
        'createdAt' => date('Y-m-d H:i:s')
    ]);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Branch updated successfully (PoC Mode)',
        'data' => $input,
        'updatedAt' => date('Y-m-d H:i:s')
    ]);
} elseif ($method === 'DELETE') {
    $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : '';
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => "Branch '{$identifier}' deleted successfully (PoC Mode)"
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}

