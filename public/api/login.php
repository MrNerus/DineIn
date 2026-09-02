<?php
require_once __DIR__ . '/cors.php';

// Hardcoded PoC credentials
$HARDCODED_USERS = [
    [
        'id' => 1,
        'username' => 'admin',
        'password' => 'admin123',
        'name' => 'Savana Administrator',
        'role' => 'admin',
        'email' => 'admin@savanasushi.pt'
    ]
];

$input = getJsonInput();
$username = isset($input['username']) ? trim($input['username']) : (isset($_POST['username']) ? trim($_POST['username']) : '');
$password = isset($input['password']) ? trim($input['password']) : (isset($_POST['password']) ? trim($_POST['password']) : '');

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Username and password are required.'
    ]);
    exit();
}

$authenticatedUser = null;
foreach ($HARDCODED_USERS as $user) {
    if ($user['username'] === $username && $user['password'] === $password) {
        $authenticatedUser = $user;
        break;
    }
}

if ($authenticatedUser) {
    // Return mock JWT token and user details
    $mockToken = 'poc-jwt-token-' . bin2hex(random_bytes(16));
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'token' => $mockToken,
        'user' => [
            'id' => $authenticatedUser['id'],
            'name' => $authenticatedUser['name'],
            'username' => $authenticatedUser['username'],
            'email' => $authenticatedUser['email'],
            'role' => $authenticatedUser['role']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid username or password. (Hint: demo is admin / admin123)'
    ]);
}
