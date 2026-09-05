<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

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

try {
    $db = getDb();
    $stmt = $db->prepare("SELECT id, username, password, name, role FROM users WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    $isAuthenticated = false;
    error_log("User: " . json_encode($user) . "\n");
    if ($user) {
        if ($user['password'] === $password || (function_exists('password_verify') && @password_verify($password, $user['password']))) {
            $isAuthenticated = true;
        }
    }

    if ($isAuthenticated) {
        $token = createSession($db, (int)$user['id']);
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'email' => $user['username'] . '@savanasushi.pt',
                'role' => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid username or password. (Hint: demo is admin / admin1234)'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
