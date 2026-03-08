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

// Support Railway environment variables (uppercase with different names)
// Railway provides: MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD
// Also support: DB_HOST, DB_NAME, DB_USER, DB_PASS

$host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 
        $_ENV['MYSQLHOST'] ?? getenv('MYSQLHOST') ?? 
        'localhost';

$port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? 
         $_ENV['MYSQLPORT'] ?? getenv('MYSQLPORT') ?? 
         '3306';

$name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 
        $_ENV['MYSQLDATABASE'] ?? getenv('MYSQLDATABASE') ?? 
        'supplier_eval';

$user = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 
        $_ENV['MYSQLUSER'] ?? getenv('MYSQLUSER') ?? 
        'root';

$pass = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?? 
        $_ENV['MYSQLPASSWORD'] ?? getenv('MYSQLPASSWORD') ?? 
        '';

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
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

$pdo = $GLOBALS['pdo'];
