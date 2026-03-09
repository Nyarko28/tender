<?php

function buildSpecificSearchQuery($title, $description = '', $category = '') {
    // Step 1: Smart keyword extraction.
    // Strip common procurement lead-in phrases from the title, then choose 2–3 meaningful words.
    $titleText = strtolower((string)$title);
    $titleText = preg_replace('/\s+/', ' ', trim($titleText));

    $leadPhrases = [
        'supply of', 'provision of', 'procurement of', 'tender for', 'contract for', 'request for',
        'purchase of', 'delivery of', 'installation of', 'maintenance of', 'rehabilitation of',
        'construction of', 'consultancy for', 'services for', 'works for'
    ];
    foreach ($leadPhrases as $p) {
        $titleText = preg_replace('/^' . preg_quote($p, '/') . '\s+/i', '', $titleText);
    }

    $stopWords = [
        'for', 'the', 'and', 'of', 'in', 'a', 'an', 'to', 'on', 'by', 'with', 'from', 'into',
        'supply', 'provision', 'procurement', 'service', 'services', 'tender', 'request',
        'proposal', 'rfp', 'rfq', 'delivery', 'works', 'work', 'contract', 'project',
        'including', 'installation', 'maintain', 'maintenance', 'provide', 'provided'
    ];

    $text = $titleText . ' ' . strtolower(substr((string)($description ?? ''), 0, 200));
    $text = preg_replace('/[^a-z0-9 ]/', ' ', $text);
    $tokens = preg_split('/\s+/', trim($text)) ?: [];

    $freq = [];
    foreach ($tokens as $w) {
        if ($w === '' || strlen($w) < 3) continue;
        if (in_array($w, $stopWords, true)) continue;
        if (preg_match('/^\d+$/', $w)) continue; // skip pure numbers
        $freq[$w] = ($freq[$w] ?? 0) + 1;
    }

    if (empty($freq)) {
        return trim((string)$title) ?: 'tender';
    }

    // Sort by frequency desc, then word length desc.
    uksort($freq, function ($a, $b) use ($freq) {
        $fa = $freq[$a]; $fb = $freq[$b];
        if ($fa === $fb) return strlen($b) <=> strlen($a);
        return $fb <=> $fa;
    });

    $keywords = array_slice(array_keys($freq), 0, 3);
    return implode(' ', $keywords);
}

function generateSeed($tenderId, $title) {
    return abs(crc32($tenderId . strtolower($title)));
}

function fetchFromPexels($query, $seed) {
    $apiKey = $_ENV['PEXELS_API_KEY'] ?? getenv('PEXELS_API_KEY');
    if (!$apiKey) return null;

    $page = ($seed % 3) + 1;
    $url = "https://api.pexels.com/v1/search?" . http_build_query([
        'query' => $query,
        'per_page' => 15,
        'page' => $page,
        'orientation' => 'landscape'
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: " . $apiKey]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return null;

    $data = json_decode($response, true);
    $photos = $data['photos'] ?? [];
    if (empty($photos)) return null;

    $picked = $photos[$seed % count($photos)];
    $remoteUrl = $picked['src']['large'] ?? $picked['src']['medium'];
    return [
        'url' => $remoteUrl,
        'remote_url' => $remoteUrl,
        'thumb' => $picked['src']['medium'],
        'alt' => $picked['alt'] ?? $query,
        'credit' => $picked['photographer'] ?? 'Pexels',
        'credit_url' => $picked['photographer_url'] ?? 'https://www.pexels.com',
        'source' => 'Pexels',
        'source_url' => $picked['url'] ?? 'https://www.pexels.com',
        'query' => $query
    ];
}

function fetchFromPixabay($query, $seed) {
    $apiKey = $_ENV['PIXABAY_API_KEY'] ?? getenv('PIXABAY_API_KEY');
    if (!$apiKey) return null;

    $page = ($seed % 3) + 1;
    $url = "https://pixabay.com/api/?" . http_build_query([
        'key' => $apiKey,
        'q' => $query,
        'image_type' => 'photo',
        'orientation' => 'horizontal',
        'per_page' => 15,
        'page' => $page,
        'safesearch' => 'true',
        'order' => 'popular'
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return null;

    $data = json_decode($response, true);
    $hits = $data['hits'] ?? [];
    if (empty($hits)) return null;

    // Download image to server (Pixabay requires this for permanent use)
    $picked = $hits[$seed % count($hits)];
    $imageUrl = $picked['largeImageURL'] ?? $picked['webformatURL'];
    $savedPath = downloadAndSaveImage($imageUrl, 'pixabay_' . $picked['id']);

    return [
        // url will be served via /api/tenders/image?id=...; keep origin URL for audit/debug
        'url' => $imageUrl,
        'remote_url' => $imageUrl,
        'local_path' => $savedPath,
        'thumb' => $picked['previewURL'],
        'alt' => $query,
        'credit' => $picked['user'] ?? 'Pixabay',
        'credit_url' => 'https://pixabay.com/users/' . ($picked['user'] ?? ''),
        'source' => 'Pixabay',
        'source_url' => 'https://pixabay.com',
        'query' => $query
    ];
}

function downloadAndSaveImage($url, $filename) {
    // Save Pixabay images locally as required by their API terms
    $backendRoot = dirname(__DIR__);
    $uploadDir = $backendRoot . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'tender-images';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = 'jpg';
    $filePath = $uploadDir . DIRECTORY_SEPARATOR . $filename . '.' . $ext;

    // Return existing if already downloaded
    if (file_exists($filePath)) return $filePath;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $imageData) {
        file_put_contents($filePath, $imageData);
        return $filePath;
    }

    return null;
}

function fetchFromPollinations($title, $description, $seed) {
    $prompt = "Professional business photograph for procurement tender: "
            . $title . ". "
            . substr($description ?? '', 0, 100)
            . ". High quality, realistic, business context, no text, no logos, no people.";

    $encoded = urlencode($prompt);
    $url = "https://image.pollinations.ai/prompt/{$encoded}?width=800&height=400&seed={$seed}&nologo=true&model=flux";

    return [
        'url' => $url,
        'remote_url' => $url,
        'thumb' => $url,
        'alt' => $title,
        'credit' => 'Pollinations AI',
        'credit_url' => 'https://pollinations.ai',
        'source' => 'Pollinations',
        'source_url' => 'https://pollinations.ai',
        'query' => $title
    ];
}

function fetchTenderImage($tenderId, $title, $description = '', $category = '') {
    $cacheKey = 'tender_img_' . $tenderId;
    $cached = getCachedImage($cacheKey);
    if ($cached) return $cached;

    $query = buildSpecificSearchQuery($title, $description, $category);
    $seed = generateSeed($tenderId, $title);

    $image = null;

    // 1. Try Pexels
    $image = fetchFromPexels($query, $seed);
    error_log("Tender #{$tenderId} Pexels: " . ($image ? 'success' : 'failed') . " query: {$query}");

    // 2. Fallback to Pixabay
    if (!$image) {
        $image = fetchFromPixabay($query, $seed);
        error_log("Tender #{$tenderId} Pixabay: " . ($image ? 'success' : 'failed'));
    }

    // 3. Fallback to Pollinations AI
    if (!$image) {
        $image = fetchFromPollinations($title, $description, $seed);
        error_log("Tender #{$tenderId} Pollinations: used as fallback");
    }

    // 4. Last resort placeholder
    if (!$image) {
        $image = getPlaceholderImage($tenderId, $title);
    }

    cacheImage($cacheKey, $image);
    return $image;
}

function getCachedImage($key) {
    require_once __DIR__ . '/database.php';
    try {
        $db = Database::getInstance();
        $row = $db->queryOne(
            "SELECT cache_value FROM ai_cache WHERE cache_key = ?",
            [$key]
        );
        return $row ? json_decode($row['cache_value'], true) : null;
    } catch (Exception $e) {
        return null;
    }
}

function cacheImage($key, $data) {
    require_once __DIR__ . '/database.php';
    try {
        $db = Database::getInstance();
        $db->execute(
            "INSERT INTO ai_cache (cache_key, cache_value, created_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value)",
            [$key, json_encode($data)]
        );
    } catch (Exception $e) {
        error_log('Cache error: ' . $e->getMessage());
    }
}

function getPlaceholderImage($tenderId, $title) {
    $colors = ['1e40af', '7c3aed', '065f46', 'b45309', '991b1b', '0e7490'];
    $color = $colors[$tenderId % count($colors)];
    $encoded = urlencode(substr($title, 0, 30));
    $url = "https://placehold.co/800x400/{$color}/ffffff?text={$encoded}";
    return [
        'url' => $url,
        'remote_url' => $url,
        'thumb' => "https://placehold.co/400x200/{$color}/ffffff?text={$encoded}",
        'alt' => $title,
        'credit' => null,
        'credit_url' => null,
        'source' => 'Placeholder',
        'source_url' => null,
        'query' => $title
    ];
}
