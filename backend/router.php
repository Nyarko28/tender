<?php
/**
 * Router for PHP built-in server on Railway
 * Handles /api/* routing to .php files in /app/api/
 */

// Load CORS configuration first (handles all CORS headers)
require_once __DIR__ . '/config/cors.php';

// Set JSON content type for API responses
header('Content-Type: application/json');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Root path - return API status
if ($uri === '/' || $uri === '') {
    echo json_encode([
        'status' => 'online',
        'message' => 'Tender Management System API',
        'version' => '1.0.0',
        'timestamp' => date('c')
    ]);
    exit;
}

// API routing - map /api/tenders/public -> /app/api/tenders/public.php
if (strpos($uri, '/api/') === 0) {
    // Remove leading slash and get the path after /api/
    $apiPath = substr($uri, 5); // Remove '/api/' prefix
    
    // Base directory for API files
    $baseDir = __DIR__ . '/api/';
    
    // Try direct .php file first: /api/tenders/public -> /app/api/tenders/public.php
    $filePath = $baseDir . $apiPath . '.php';
    
    if (file_exists($filePath) && is_file($filePath)) {
        require $filePath;
        exit;
    }
    
    // Try index.php in directory: /api/tenders -> /app/api/tenders/index.php
    $indexPath = $baseDir . rtrim($apiPath, '/') . '/index.php';
    
    if (file_exists($indexPath) && is_file($indexPath)) {
        require $indexPath;
        exit;
    }
    
    // Handle nested paths like /api/contracts/documents/upload
    // Try: /app/api/contracts/documents/upload.php
    $nestedPath = $baseDir . $apiPath . '.php';
    if (file_exists($nestedPath) && is_file($nestedPath)) {
        require $nestedPath;
        exit;
    }
}

// 404 Not Found
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found'
]);
