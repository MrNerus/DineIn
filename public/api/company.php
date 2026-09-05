<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDb();
    $currentUser = requireAuth($db);

    if ($method === 'GET') {
        $companyData = fetchCompanyData($db);
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data' => $companyData
        ]);
    } elseif ($method === 'POST' || $method === 'PUT') {
        $input = getJsonInput();
        if (empty($input)) {
            $input = fetchCompanyData($db);
        } else {
            $input = updateCompanyData($db, $input);
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Company information updated successfully',
            'data' => $input,
            'updatedAt' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
