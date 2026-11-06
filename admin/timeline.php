<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Timeline';
$activePage = 'timeline';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['move'])) {
    if (csrf_verify($_POST['csrf_token'] ?? null)) {
        $direction = $_POST['move'] === 'up' ? -1 : 1;
        TimelineItem::move((int) $_POST['id'], $locale, $direction);
    }
    header('Location: timeline.php?locale=' . urlencode($locale));
    exit;
}

$items = TimelineItem::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="timeline_form.php?locale=<?= h($locale) ?>">New timeline item</a>
</div>

<?php if ($flash): ?>
  <div class="alert alert-<?= h($flash['type']) ?>"><?= h($flash['message']) ?></div>
<?php endif; ?>

<div class="locale-tabs">
  <a href="?locale=en" class="<?= $locale === 'en' ? 'active' : '' ?>">English</a>
  <a href="?locale=si" class="<?= $locale === 'si' ? 'active' : '' ?>">Sinhala</a>
</div>
<p class="muted small">This feeds the About page timeline, in the order shown here. The closing item (no year) should stay last.</p>

<table class="list">
  <thead>
    <tr>
      <th></th>
      <th>Year</th>
      <th>Title</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$items): ?>
      <tr><td colspan="4" class="muted">No timeline items yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($items as $i => $item): ?>
      <tr>
        <td>
          <form method="post" style="display:inline;">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $item['id'] ?>">
            <button type="submit" name="move" value="up" class="btn btn-secondary btn-sm" <?= $i === 0 ? 'disabled' : '' ?>>&uarr;</button>
            <button type="submit" name="move" value="down" class="btn btn-secondary btn-sm" <?= $i === count($items) - 1 ? 'disabled' : '' ?>>&darr;</button>
          </form>
        </td>
        <td><?= h($item['year'] ?: '—') ?> <?= $item['is_closing'] ? '<span class="locale-pill">closing</span>' : '' ?></td>
        <td><?= h($item['title']) ?></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="timeline_form.php?id=<?= (int) $item['id'] ?>">Edit</a>
          <form method="post" action="timeline_delete.php" style="display:inline;" onsubmit="return confirm('Delete this timeline item?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $item['id'] ?>">
            <input type="hidden" name="locale" value="<?= h($locale) ?>">
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php require __DIR__ . '/_partials/footer.php'; ?>
