<?php
/**
 * Expects $pageTitle and $activePage to be set by the including script.
 * Requires Auth::requireLogin() to already have been called.
 */
$navItems = [
    'index' => 'Dashboard',
    'courses' => 'Courses',
    'books' => 'Books',
    'videos' => 'Videos',
    'highlights' => 'Features',
    'blog' => 'Blog',
    'timeline' => 'Timeline',
    'pages' => 'Site Pages',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title><?= h($pageTitle ?? 'Admin') ?> — CSP Admin</title>
<link rel="stylesheet" href="<?= isset($inSubpage) ? '../admin.css' : 'admin.css' ?>">
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <a class="brand" href="index.php">CSP Admin</a>
    <a class="view-site-btn" href="/en/index.html" target="_blank" rel="noopener noreferrer">View Website &#8599;</a>
    <nav>
      <?php foreach ($navItems as $key => $label): ?>
        <a href="<?= $key === 'index' ? 'index.php' : $key . '.php' ?>" class="<?= ($activePage ?? '') === $key ? 'active' : '' ?>"><?= h($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <a class="logout" href="logout.php">Sign out (<?= h(Auth::username()) ?>)</a>
  </aside>
  <main class="main">
