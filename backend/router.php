<?php
/**
 * Router for PHP built-in server
 * Handles /api/* routing to .php files
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Root path - return API status
if ($uri === '/' || $uri === '') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'online',
        'message' => 'Tender Management System API'
    ]);
    exit;
}

// API routing - map /api/auth/login -> /api/auth/login.php
if (strpos($uri, '/api/') === 0) {
    // Remove /api prefix for file lookup
    $filePath = __DIR__ . $uri . '.php';
    
    // Check if file exists
    if (file_exists($filePath)) {
        // Pass control to the PHP file
        require $filePath;
        exit;
    }
    
    // Check for directory index (e.g., /api/tenders/ -> /api/tenders/index.php)
    $dirPath = __DIR__ . $uri;
    if (is_dir($dirPath)) {
        $indexFile = rtrim($dirPath, '/') . '/index.php';
        if (file_exists($indexFile)) {
            require $indexFile;
            exit;
        }
    }
}

// 404 Not Found
http_response_code(404);
header('Content-Type: application/json');
echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found'
]);
