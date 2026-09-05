<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $db = getDb();

    if ($method === 'GET') {
        $user = validateSession($db);
        $isPublicOnly = isset($_GET['public']) || ($user === null);

        if ($isPublicOnly) {
            $companyInfo = fetchCompanyData($db, true);
            $branchInfo = fetchBranchesData($db, null, true);
        } else {
            $companyInfo = fetchCompanyData($db, false);
            $branchInfo = fetchBranchesData($db, null, false);
        }

        http_response_code(200);
        echo json_encode([
            'companyInfo' => $companyInfo,
            'branchInfo' => $branchInfo
        ]);
    } elseif ($method === 'POST' || $method === 'PUT') {
        $currentUser = requireAuth($db);
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
