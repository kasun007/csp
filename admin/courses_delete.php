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
    Course::delete($id);
    flash_set('Course deleted.');
}

header('Location: courses.php?locale=' . urlencode($locale));
exit;
