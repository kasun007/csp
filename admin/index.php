<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Dashboard';
$activePage = 'index';

$counts = [];
$tables = [
    'courses' => 'courses',
    'books' => 'books',
    'videos' => 'videos',
    'highlights' => 'highlights',
    'blog' => 'blog_posts',
    'timeline' => 'timeline_items',
];
$db = Database::connection();
foreach ($tables as $key => $table) {
    $counts[$key] = (int) $db->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
}

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1>Dashboard</h1>
</div>
<p class="muted">Click any card below to manage that type of content. Counts are across both English and Sinhala.</p>
<div class="dashboard-grid">
  <a class="dashboard-card" href="courses.php">
    <div class="count"><?= $counts['courses'] ?></div>Courses
    <p class="dashboard-card__desc">Classes listed on the Courses page.</p>
  </a>
  <a class="dashboard-card" href="books.php">
    <div class="count"><?= $counts['books'] ?></div>Books
    <p class="dashboard-card__desc">Publications on the Our Publications page.</p>
  </a>
  <a class="dashboard-card" href="videos.php">
    <div class="count"><?= $counts['videos'] ?></div>Videos
    <p class="dashboard-card__desc">Clips on the Videos page.</p>
  </a>
  <a class="dashboard-card" href="highlights.php">
    <div class="count"><?= $counts['highlights'] ?></div>Features
    <p class="dashboard-card__desc">News and recaps on the Features page.</p>
  </a>
  <a class="dashboard-card" href="blog.php">
    <div class="count"><?= $counts['blog'] ?></div>Blog posts
    <p class="dashboard-card__desc">Articles and essays on the Blog page.</p>
  </a>
  <a class="dashboard-card" href="timeline.php">
    <div class="count"><?= $counts['timeline'] ?></div>Timeline items
    <p class="dashboard-card__desc">The "Our History" timeline on the About page.</p>
  </a>
  <a class="dashboard-card" href="pages.php">
    <div class="count">—</div>Site Pages
    <p class="dashboard-card__desc">Edit the text on the Home, About, Contact and Donate pages.</p>
  </a>
</div>
<?php require __DIR__ . '/_partials/footer.php'; ?>
