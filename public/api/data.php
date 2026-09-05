<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDb();
    $currentUser = requireAuth($db);

    if ($method === 'GET') {
        $companyInfo = fetchCompanyData($db);
        $branchInfo = fetchBranchesData($db);
        error_log("Fetched company info: " . json_encode($companyInfo));
        error_log("Fetched branch info: " . json_encode($branchInfo));

        http_response_code(200);
        echo json_encode([
            'companyInfo' => $companyInfo,
            'branchInfo' => $branchInfo
        ]);
    } elseif ($method === 'POST' || $method === 'PUT') {
        $input = getJsonInput();
        if (isset($input['companyInfo']) && is_array($input['companyInfo'])) {
            updateCompanyData($db, $input['companyInfo']);
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Complete data saved successfully',
            'savedAt' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
