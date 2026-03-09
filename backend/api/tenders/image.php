<?php
require_once __DIR__ . '/../bootstrap.php';
require_once dirname(__DIR__, 2) . '/helpers/tender_image.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$tenderId = (int)($_GET['id'] ?? 0);
if (!$tenderId) {
    jsonError('Tender ID required', 400);
}

// If meta=1, return JSON metadata (including credit/source).
// Otherwise, return the actual image bytes (or redirect to remote URL).
$meta = (int)($_GET['meta'] ?? 0) === 1;

try {
    $pdo = $GLOBALS['pdo'] ?? null;
    if (!($pdo instanceof PDO)) {
        jsonError('Database not available', 500);
    }

    $stmt = $pdo->prepare(
        "SELECT t.id, t.title, t.description, tc.name as category
         FROM tenders t
         LEFT JOIN tender_categories tc ON t.category_id = tc.id
         WHERE t.id = ?"
    );
    $stmt->execute([$tenderId]);
    $tender = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$tender) {
        jsonError('Tender not found', 404);
    }

    $image = fetchTenderImage(
        (int)$tender['id'],
        (string)$tender['title'],
        (string)($tender['description'] ?? ''),
        (string)($tender['category'] ?? '')
    );

    // Ensure the frontend can always load the image consistently via this endpoint.
    // Preserve the remote URL for the raw-image response path.
    if (!isset($image['remote_url']) && isset($image['url']) && is_string($image['url']) && preg_match('/^https?:\\/\\//i', $image['url'])) {
        $image['remote_url'] = $image['url'];
    }
    $image['url'] = "/api/tenders/image?id={$tenderId}";
    $image['thumb'] = "/api/tenders/image?id={$tenderId}";

    if ($meta) {
        jsonSuccess(['image' => $image]);
    }

    // Serve downloaded Pixabay images from disk when available.
    $localPath = $image['local_path'] ?? null;
    if (is_string($localPath) && $localPath !== '' && is_file($localPath)) {
        header('Content-Type: image/jpeg');
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($localPath);
        exit();
    }

    // Otherwise redirect to remote URL (Pexels/Pollinations/Placeholder)
    $remoteUrl = $image['remote_url'] ?? null;
    if (!is_string($remoteUrl) || $remoteUrl === '') {
        // Backward compatibility: older cache stored URL in `url`
        $remoteUrl = $image['url_original'] ?? null;
    }
    if (is_string($remoteUrl) && preg_match('/^https?:\\/\\//i', $remoteUrl)) {
        header('Location: ' . $remoteUrl, true, 302);
        exit();
    }

    // Fallback: return a tiny SVG placeholder
    header('Content-Type: image/svg+xml; charset=utf-8');
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#e2e8f0"/></svg>';
    exit();
} catch (Throwable $e) {
    error_log('Tender image API error: ' . $e->getMessage());
    if ($meta) {
        jsonError('Could not load image', 500);
    }
    header('Content-Type: image/svg+xml; charset=utf-8');
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#e2e8f0"/></svg>';
    exit();
}
