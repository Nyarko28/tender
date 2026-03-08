<?php
/**
 * Database connection using PDO.
 * Supports Railway and local environment variables.
 */

declare(strict_types=1);

/**
 * Load .env file if present
 */
function loadEnv(string $path): void
{
    if (!is_readable($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}

// Try to load .env file from various locations
$envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
loadEnv($envPath);

// Helper function to get environment variable
function getEnvVar(string $name, string $default = ''): string
{
    // Check getenv() first (works for Railway)
    $value = getenv($name);
    if ($value !== false && $value !== '') {
        return $value;
    }
    
    // Check $_ENV
    if (isset($_ENV[$name]) && $_ENV[$name] !== '') {
        return $_ENV[$name];
    }
    
    return $default;
}

// Railway provides: MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD
// Also support: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

// Get host - prioritize Railway variables
$host = getEnvVar('MYSQLHOST') ?: getEnvVar('DB_HOST') ?: 'localhost';

// Get port
$port = getEnvVar('MYSQLPORT') ?: getEnvVar('DB_PORT') ?: '3306';

// Get database name
$name = getEnvVar('MYSQLDATABASE') ?: getEnvVar('DB_NAME') ?: 'railway';

// Get username
$user = getEnvVar('MYSQLUSER') ?: getEnvVar('DB_USER') ?: 'root';

// Get password
$pass = getEnvVar('MYSQLPASSWORD') ?: getEnvVar('DB_PASS') ?: '';

// Build DSN
$dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES    => false,
];

try {
    // Using $GLOBALS ensures PDO is accessible across all include scopes
    $GLOBALS['pdo'] = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Log error server-side but don't expose sensitive data
    error_log("Database connection failed: " . $e->getMessage());
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'debug' => [
            'host' => $host,
            'port' => $port,
            'database' => $name,
            'user' => $user
            // Note: password not included for security
        ]
    ]);
    exit;
}

$pdo = $GLOBALS['pdo'];
