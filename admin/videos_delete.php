<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify($_POST['csrf_token'] ?? null)) {
    http_response_code(400);
    exit('Invalid request.');
}

$id = (int) ($_POST['id'] ?? 0);
$locale = ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en';

if ($id) {
    Video::delete($id);
    flash_set('Video deleted.');
}

header('Location: videos.php?locale=' . urlencode($locale));
exit;
