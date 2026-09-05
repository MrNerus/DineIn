<?php
/**
 * Authentication and Session Management Helper
 */

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

function getBearerToken(): ?string {
    // 1. Check getallheaders() if available
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }

    $normalized = [];
    foreach ($headers as $key => $value) {
        $normalized[strtolower($key)] = $value;
    }

    // Check Authorization header
    $authHeader = $normalized['authorization'] 
        ?? $_SERVER['HTTP_AUTHORIZATION'] 
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
        ?? null;

    if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }

    // 2. Check X-Session-Token header (server-neutral)
    if (!empty($normalized['x-session-token'])) {
        return trim($normalized['x-session-token']);
    }
    if (!empty($_SERVER['HTTP_X_SESSION_TOKEN'])) {
        return trim($_SERVER['HTTP_X_SESSION_TOKEN']);
    }

    // 3. Check Cookies
    if (!empty($_COOKIE['session_token'])) {
        return trim($_COOKIE['session_token']);
    }
    if (!empty($_COOKIE[session_name()])) {
        return trim($_COOKIE[session_name()]);
    }

    // 4. Query parameter fallback
    if (!empty($_GET['token'])) {
        return trim($_GET['token']);
    }

    return null;
}

function validateSession(PDO $db): ?array {
    $token = getBearerToken();

    // Verify token in sessions table
    if (!empty($token)) {
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.name, u.role, s.token, s.expires_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = :token AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        ");
        $stmt->execute(['token' => $token]);
        $user = $stmt->fetch();
        if ($user) {
            if (session_status() === PHP_SESSION_NONE) {
                @session_start();
            }
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['token'] = $user['token'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            return $user;
        }
    }

    // Check active PHP session if token not in DB
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    if (!empty($_SESSION['user_id'])) {
        $stmt = $db->prepare("SELECT id, username, name, role FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => (int)$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if ($user) {
            return $user;
        }
    }

    return null;
}

function requireAuth(PDO $db): array {
    $user = validateSession($db);
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized: Valid session required. Please log in.'
        ]);
        exit();
    }
    return $user;
}

function createSession(PDO $db, int $userId): string {
    $token = 'sess-' . bin2hex(random_bytes(24));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

    $stmt = $db->prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (:token, :uid, :exp)");
    $stmt->execute([
        'token' => $token,
        'uid' => $userId,
        'exp' => $expiresAt
    ]);

    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    $_SESSION['user_id'] = $userId;
    $_SESSION['token'] = $token;

    // Set cookie if possible
    if (!headers_sent()) {
        @setcookie('session_token', $token, [
            'expires' => time() + 7 * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    return $token;
}

function destroySession(PDO $db, ?string $token = null): void {
    if ($token === null) {
        $token = getBearerToken();
    }

    if (!empty($token)) {
        $stmt = $db->prepare("DELETE FROM sessions WHERE token = :token");
        $stmt->execute(['token' => $token]);
    }

    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    $_SESSION = [];
    if (ini_get("session.use_cookies") && !headers_sent()) {
        $params = session_get_cookie_params();
        @setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
        @setcookie('session_token', '', time() - 3600, '/');
    }
    @session_destroy();
}

