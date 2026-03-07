cd backend

cat > config/database.php << 'EOF'
<?php
/**
 * Database connection using PDO.
 * Supports Railway environment variables and local .env files.
 */

declare(strict_types=1);

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

// Railway provides: MYSQLHOST, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD, MYSQLPORT
// Also check for alternative naming and local .env
$host = $_ENV['DB_HOST'] 
    ?? $_ENV['MYSQLHOST']      // Railway format (no underscore)
    ?? $_ENV['MYSQL_HOST']     // Alternative format
    ?? getenv('MYSQLHOST')     // Try getenv
    ?? getenv('MYSQL_HOST')
    ?? 'localhost';

$port = $_ENV['DB_PORT']
    ?? $_ENV['MYSQLPORT']      // Railway format
    ?? $_ENV['MYSQL_PORT']
    ?? getenv('MYSQLPORT')
    ?? getenv('MYSQL_PORT')
    ?? '3306';

$name = $_ENV['DB_NAME'] 
    ?? $_ENV['MYSQLDATABASE']  // Railway format
    ?? $_ENV['MYSQL_DATABASE']
    ?? getenv('MYSQLDATABASE')
    ?? getenv('MYSQL_DATABASE')
    ?? 'supplier_eval';

$user = $_ENV['DB_USER'] 
    ?? $_ENV['MYSQLUSER']      // Railway format
    ?? $_ENV['MYSQL_USER']
    ?? getenv('MYSQLUSER')
    ?? getenv('MYSQL_USER')
    ?? 'root';

$pass = $_ENV['DB_PASS'] 
    ?? $_ENV['MYSQLPASSWORD']  // Railway format
    ?? $_ENV['MYSQL_PASSWORD']
    ?? getenv('MYSQLPASSWORD')
    ?? getenv('MYSQL_PASSWORD')
    ?? '';

$dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Using $GLOBALS ensures PDO is accessible across all include scopes
    $GLOBALS['pdo'] = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Log the actual error for debugging
    error_log('Database connection failed: ' . $e->getMessage());
    error_log("DSN: mysql:host=$host;port=$port;dbname=$name");
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        // Uncomment for debugging (remove in production):
        // 'error' => $e->getMessage(),
        // 'host' => $host,
        // 'port' => $port,
        // 'database' => $name
    ]);
    exit;
}

$pdo = $GLOBALS['pdo'];
EOF