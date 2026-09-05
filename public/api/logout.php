<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

try {
    $db = getDb();
    destroySession($db);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Logged out successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Logout error: ' . $e->getMessage()
    ]);
}

