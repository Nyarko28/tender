<?php
/**
 * One-time seeder to prefetch and cache tender images.
 *
 * Usage (local):
 *   php backend/scripts/seed_tender_images.php
 *
 * Usage (Railway):
 *   railway run php backend/scripts/seed_tender_images.php
 */

declare(strict_types=1);

$backendRoot = dirname(__DIR__);
require_once $backendRoot . '/api/bootstrap.php';
require_once $backendRoot . '/helpers/tender_image.php';

$pdo = $GLOBALS['pdo'] ?? null;
if (!($pdo instanceof PDO)) {
    fwrite(STDERR, "PDO not available\n");
    exit(1);
}

$stmt = $pdo->query("SELECT id, title, description FROM tenders ORDER BY id ASC");
$tenders = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

echo "Found " . count($tenders) . " tenders\n";

$ok = 0;
$fail = 0;

foreach ($tenders as $t) {
    $id = (int)($t['id'] ?? 0);
    $title = (string)($t['title'] ?? '');
    $desc = (string)($t['description'] ?? '');
    if ($id <= 0 || $title === '') continue;

    try {
        $img = fetchTenderImage($id, $title, $desc, '');
        $source = is_array($img) ? ($img['source'] ?? 'unknown') : 'unknown';
        echo "[OK] #{$id} {$source}\n";
        $ok++;
    } catch (Throwable $e) {
        echo "[FAIL] #{$id} " . $e->getMessage() . "\n";
        $fail++;
    }
}

echo "Done. OK={$ok} FAIL={$fail}\n";
exit($fail > 0 ? 2 : 0);

<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/tender_image.php';

$db = Database::getInstance();
$tenders = $db->query("SELECT t.id, t.title, t.description, tc.name as category FROM tenders t LEFT JOIN tender_categories tc ON t.category_id = tc.id ORDER BY t.id ASC");

echo "Seeding images for " . count($tenders) . " tenders...\n\n";

$success = 0;
$skipped = 0;

foreach ($tenders as $tender) {
    $cacheKey = 'tender_img_' . $tender['id'];
    $existing = getCachedImage($cacheKey);

    if ($existing) {
        echo "⏭  #{$tender['id']} already cached via {$existing['source']}\n";
        $skipped++;
        continue;
    }

    $image = fetchTenderImage(
        $tender['id'],
        $tender['title'],
        $tender['description'] ?? '',
        $tender['category'] ?? ''
    );

    echo "✓  #{$tender['id']} '{$tender['title']}'\n";
    echo "   → Source: {$image['source']} | Query: {$image['query']}\n\n";

    $success++;
    sleep(1); // respect rate limits
}

echo "\nDone! {$success} fetched, {$skipped} already cached.\n";
