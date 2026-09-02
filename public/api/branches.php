<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

// Default branch data matching branches.json
$defaultBranches = [
    [
        "id" => "branch_amadora",
        "identifier" => "Amadora",
        "name" => "Amadora",
        "address" => "1R. Dr. António José de Almeida 10A, 2700-269 Amadora",
        "phone" => "+351214952367",
        "lat" => 38.755245291772184,
        "long" => -9.220227233102092,
        "isActive" => true,
        "openingTime" => [
            [
                "dayPt" => "Segunda a domingo",
                "dayEn" => "Monday to Sunday",
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
        "id" => "branch_sintra",
        "identifier" => "Sintra",
        "name" => "Mem Martins - Sintra",
        "address" => "Estr. Algueirão 21, 2725-025 Algueirão-Mem Martins",
        "phone" => "+351210133261",
        "lat" => 38.79846169317772,
        "long" => -9.341457822088252,
        "isActive" => true,
        "openingTime" => [
            [
                "dayPt" => "Segunda a domingo",
                "dayEn" => "Monday to Sunday",
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
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    
    if ($identifier || $id) {
        $found = null;
        foreach ($defaultBranches as $branch) {
            if ($id && isset($branch['id']) && strtolower((string)$branch['id']) === strtolower((string)$id)) {
                $found = $branch;
                break;
            }
            if ($identifier && strtolower($branch['identifier']) === strtolower($identifier)) {
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
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';
    $input = getJsonInput();
    
    if ($action === 'create_default' || (isset($input['action']) && $input['action'] === 'create_default') || empty($input)) {
        $timestamp = time();
        $randomSuffix = substr(uniqid(), -4);
        $newBranch = [
            "id" => "branch_" . $timestamp . "_" . $randomSuffix,
            "identifier" => "loja-rascunho-" . $randomSuffix,
            "name" => "Nova Loja (Rascunho)",
            "address" => "Endereço da nova filial",
            "phone" => "+351000000000",
            "lat" => 38.7552,
            "long" => -9.2202,
            "isActive" => false,
            "openingTime" => [
                [
                    "dayPt" => "Segunda a domingo",
                    "dayEn" => "Monday to Sunday",
                    "timePt" => "das 11h às 15h30, das 18h às 23h",
                    "timeEn" => "11 AM to 3:30 PM, 6 PM to 11 PM"
                ]
            ],
            "redirects" => [
                "reservation" => "",
                "delivery" => "",
                "pickup" => "",
                "location" => "",
                "pdf" => [
                    "dinein1" => "assets/pdfs/Menu.pdf",
                    "dinein2" => ""
                ]
            ],
            "reviews" => []
        ];
        
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'Default placeholder branch created successfully',
            'data' => $newBranch,
            'createdAt' => date('Y-m-d H:i:s')
        ]);
    } else {
        // Fallback custom POST
        if (!isset($input['id'])) {
            $input['id'] = 'branch_' . time();
        }
        if (!isset($input['isActive'])) {
            $input['isActive'] = false;
        }
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'Branch created successfully (PoC Mode)',
            'data' => $input,
            'createdAt' => date('Y-m-d H:i:s')
        ]);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();
    $section = isset($_GET['section']) ? trim($_GET['section']) : 'all';
    $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : (isset($input['identifier']) ? $input['identifier'] : '');
    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($input['id']) ? $input['id'] : '');
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => $section !== 'all' ? "Section '{$section}' updated successfully" : 'Branch updated successfully (PoC Mode)',
        'section' => $section,
        'data' => $input,
        'updatedAt' => date('Y-m-d H:i:s')
    ]);
} elseif ($method === 'DELETE') {
    $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : '';
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    $target = $identifier ? $identifier : $id;
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => "Branch '{$target}' deleted successfully (PoC Mode)"
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
