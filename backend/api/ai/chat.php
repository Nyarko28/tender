<?php
/**
 * POST /api/ai/chat — AI chat endpoint
 */

require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$user = requireAuth();

// Fix: use user_id not id
$userId = (int)($user['user_id'] ?? $user['id'] ?? 0);
$userRole = $user['role'] ?? 'user';
$userName = $user['name'] ?? $user['username'] ?? 'there';

$input = json_decode(file_get_contents('php://input'), true);
$message = trim(htmlspecialchars(strip_tags($input['message'] ?? ''), ENT_QUOTES, 'UTF-8'));
$history = $input['history'] ?? [];
$tenderId = (int)($input['tender_id'] ?? 0);

if (empty($message)) {
    jsonError('Message is required', 400);
}

$pdo = $GLOBALS['pdo'];

checkAIRateLimit($userId, $pdo);

$userContext = [
    'id'        => $userId,
    'role'      => $userRole,
    'name'      => $userName,
    'tender_id' => $tenderId ?: null
];

try {
    $reply = callAI($message, $history, $userContext, $pdo);
    logAIChat($userId, $message, $reply, $pdo);

    $actionData = null;
    preg_match('/\{[^{}]*"action"[^{}]*\}/s', $reply, $matches);
    if (!empty($matches[0])) {
        $decoded = json_decode($matches[0], true);
        if (json_last_error() === JSON_ERROR_NONE && isset($decoded['action'], $decoded['data'])) {
            $actionData = $decoded;
        }
    }

    jsonSuccess([
        'reply'   => $reply,
        'action'  => $actionData
    ]);

} catch (Exception $e) {
    error_log('ProcureAI error: ' . $e->getMessage());
    jsonError('ProcureAI is temporarily unavailable. Please try again in a moment.', 500);
}
