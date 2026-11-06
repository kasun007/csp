<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Videos';
$activePage = 'videos';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$videos = Video::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="videos_form.php?locale=<?= h($locale) ?>">New video</a>
</div>
<p class="muted">The videos listed on the Videos page, each linking out to YouTube.</p>

<?php if ($flash): ?>
  <div class="alert alert-<?= h($flash['type']) ?>"><?= h($flash['message']) ?></div>
<?php endif; ?>

<div class="locale-tabs">
  <a href="?locale=en" class="<?= $locale === 'en' ? 'active' : '' ?>">English</a>
  <a href="?locale=si" class="<?= $locale === 'si' ? 'active' : '' ?>">Sinhala</a>
</div>

<table class="list">
  <thead>
    <tr>
      <th>Title</th>
      <th>YouTube ID</th>
      <th>Slug</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$videos): ?>
      <tr><td colspan="4" class="muted">No videos yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($videos as $video): ?>
      <tr>
        <td><?= h($video['title']) ?></td>
        <td><code><?= h($video['youtube_id']) ?></code></td>
        <td><code><?= h($video['slug']) ?></code></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="videos_form.php?id=<?= (int) $video['id'] ?>">Edit</a>
          <form method="post" action="videos_delete.php" style="display:inline;" onsubmit="return confirm('Delete this video?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $video['id'] ?>">
            <input type="hidden" name="locale" value="<?= h($locale) ?>">
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php require __DIR__ . '/_partials/footer.php'; ?>
