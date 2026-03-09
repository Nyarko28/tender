<?php
/**
 * GET /api/reports/summary.php — Admin dashboard summary data.
 * Shape matches AdminReports.tsx expectations:
 * { tenders: {...}, bids: {...}, suppliers: {...}, contracts: {...} }
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$user = requireAuth();
requireAdmin();

/** @var PDO $pdo */
$pdo = $GLOBALS['pdo'];

// Small helpers
$queryOne = function (string $sql, array $params = [] ) use ($pdo): array {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: [];
};

$queryAll = function (string $sql, array $params = [] ) use ($pdo): array {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
};

// ── Tender Stats ─────────────────────────────────────────────
$tendersTotal       = (int) ($queryOne("SELECT COUNT(*) AS c FROM tenders")['c'] ?? 0);
$tendersOpen        = (int) ($queryOne("SELECT COUNT(*) AS c FROM tenders WHERE status = 'published'")['c'] ?? 0);
$tendersClosed      = (int) ($queryOne("SELECT COUNT(*) AS c FROM tenders WHERE status = 'closed'")['c'] ?? 0);
$tendersAwarded     = (int) ($queryOne("SELECT COUNT(*) AS c FROM tenders WHERE status = 'awarded'")['c'] ?? 0);
$tendersDraft       = (int) ($queryOne("SELECT COUNT(*) AS c FROM tenders WHERE status = 'draft'")['c'] ?? 0);
$tendersTotalValue  = (float) ($queryOne("SELECT COALESCE(SUM(budget),0) AS s FROM tenders WHERE status != 'draft'")['s'] ?? 0);

$tendersByCategory = $queryAll("
    SELECT COALESCE(category, 'Uncategorised') AS name, COUNT(*) AS value
    FROM tenders
    GROUP BY category
    ORDER BY value DESC
    LIMIT 8
");
foreach ($tendersByCategory as &$row) {
    $row['value'] = (int) $row['value'];
}

$tendersByMonth = $queryAll("
    SELECT
        DATE_FORMAT(created_at, '%b %Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m')  AS sort_key,
        COUNT(*) AS count
    FROM tenders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month, sort_key
    ORDER BY sort_key ASC
");
foreach ($tendersByMonth as &$row) {
    $row['count'] = (int) $row['count'];
}

// ── Bid Stats ────────────────────────────────────────────────
$bidsTotal     = (int) ($queryOne("SELECT COUNT(*) AS c FROM bids")['c'] ?? 0);
$bidsSubmitted = (int) ($queryOne("SELECT COUNT(*) AS c FROM bids WHERE status = 'submitted'")['c'] ?? 0);
$bidsAccepted  = (int) ($queryOne("SELECT COUNT(*) AS c FROM bids WHERE status = 'accepted'")['c'] ?? 0);
$bidsRejected  = (int) ($queryOne("SELECT COUNT(*) AS c FROM bids WHERE status = 'rejected'")['c'] ?? 0);

$avgRow = $queryOne("
    SELECT ROUND(
        COUNT(*) / NULLIF((SELECT COUNT(*) FROM tenders WHERE status != 'draft'), 0),
        1
    ) AS avg_per_tender
    FROM bids
");
$bidsAvgPerTender = isset($avgRow['avg_per_tender']) ? (float) $avgRow['avg_per_tender'] : 0.0;

$bidsByMonth = $queryAll("
    SELECT
        DATE_FORMAT(created_at, '%b %Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m')  AS sort_key,
        COUNT(*) AS count
    FROM bids
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month, sort_key
    ORDER BY sort_key ASC
");
foreach ($bidsByMonth as &$row) {
    $row['count'] = (int) $row['count'];
}

// ── Supplier Stats ───────────────────────────────────────────
$suppliersTotal     = (int) ($queryOne("SELECT COUNT(*) AS c FROM users WHERE role = 'supplier'")['c'] ?? 0);
$suppliersActive    = (int) ($queryOne("SELECT COUNT(*) AS c FROM users WHERE role = 'supplier' AND status = 'active'")['c'] ?? 0);
$suppliersPending   = (int) ($queryOne("SELECT COUNT(*) AS c FROM users WHERE role = 'supplier' AND status = 'pending'")['c'] ?? 0);
$suppliersSuspended = (int) ($queryOne("SELECT COUNT(*) AS c FROM users WHERE role = 'supplier' AND status = 'suspended'")['c'] ?? 0);

$suppliersByMonth = $queryAll("
    SELECT
        DATE_FORMAT(created_at, '%b %Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m')  AS sort_key,
        COUNT(*) AS count
    FROM users
    WHERE role = 'supplier'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month, sort_key
    ORDER BY sort_key ASC
");
foreach ($suppliersByMonth as &$row) {
    $row['count'] = (int) $row['count'];
}

$topBidders = $queryAll("
    SELECT
        sp.company_name,
        COUNT(b.id) AS bid_count,
        SUM(CASE WHEN b.status = 'accepted' THEN 1 ELSE 0 END) AS wins
    FROM supplier_profiles sp
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN bids b ON b.supplier_id = u.id
    GROUP BY sp.user_id
    ORDER BY bid_count DESC
    LIMIT 5
");
foreach ($topBidders as &$row) {
    $row['bid_count'] = (int) $row['bid_count'];
    $row['wins']      = (int) $row['wins'];
}

// ── Contract Stats ───────────────────────────────────────────
$contractsTotal     = (int) ($queryOne("SELECT COUNT(*) AS c FROM contracts")['c'] ?? 0);
$contractsActive    = (int) ($queryOne("SELECT COUNT(*) AS c FROM contracts WHERE status = 'active'")['c'] ?? 0);
$contractsCompleted = (int) ($queryOne("SELECT COUNT(*) AS c FROM contracts WHERE status = 'completed'")['c'] ?? 0);
$contractsDraft     = (int) ($queryOne("SELECT COUNT(*) AS c FROM contracts WHERE status = 'draft'")['c'] ?? 0);
$contractsTotalValue = (float) ($queryOne("SELECT COALESCE(SUM(contract_value),0) AS s FROM contracts")['s'] ?? 0);

$data = [
    'tenders' => [
        'total'       => $tendersTotal,
        'open'        => $tendersOpen,
        'closed'      => $tendersClosed,
        'awarded'     => $tendersAwarded,
        'draft'       => $tendersDraft,
        'total_value' => $tendersTotalValue,
        'by_category' => $tendersByCategory,
        'by_month'    => $tendersByMonth,
    ],
    'bids' => [
        'total'          => $bidsTotal,
        'submitted'      => $bidsSubmitted,
        'accepted'       => $bidsAccepted,
        'rejected'       => $bidsRejected,
        'avg_per_tender' => $bidsAvgPerTender,
        'by_month'       => $bidsByMonth,
    ],
    'suppliers' => [
        'total'      => $suppliersTotal,
        'active'     => $suppliersActive,
        'pending'    => $suppliersPending,
        'suspended'  => $suppliersSuspended,
        'by_month'   => $suppliersByMonth,
        'top_bidders'=> $topBidders,
    ],
    'contracts' => [
        'total'       => $contractsTotal,
        'active'      => $contractsActive,
        'completed'   => $contractsCompleted,
        'draft'       => $contractsDraft,
        'total_value' => $contractsTotalValue,
    ],
];

jsonSuccess($data);
