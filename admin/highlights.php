<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Features';
$activePage = 'highlights';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$items = Highlight::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="highlights_form.php?locale=<?= h($locale) ?>">New feature</a>
</div>
<p class="muted">News, event recaps, videos, and press mentions shown on the Features page.</p>

<?php if ($flash): ?>
  <div class="alert alert-<?= h($flash['type']) ?>"><?= h($flash['message']) ?></div>
<?php endif; ?>

<div class="locale-tabs">
  <a href="?locale=en" class="<?= $locale === 'en' ? 'active' : '' ?>">English</a>
  <a href="?locale=si" class="<?= $locale === 'si' ? 'active' : '' ?>">Sinhala</a>
</div>
<p class="muted small">Sinhala and English features don't have to pair up one-to-one — a locale can have a feature the other doesn't.</p>

<table class="list">
  <thead>
    <tr>
      <th>Title</th>
      <th>Date</th>
      <th>Slug</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$items): ?>
      <tr><td colspan="4" class="muted">No features yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($items as $item): ?>
      <tr>
        <td><?= h($item['title']) ?></td>
        <td><?= h($item['date_label'] ?: $item['date'] ?: '—') ?></td>
        <td><code><?= h($item['slug']) ?></code></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="highlights_form.php?id=<?= (int) $item['id'] ?>">Edit</a>
          <form method="post" action="highlights_delete.php" style="display:inline;" onsubmit="return confirm('Delete this feature?');">
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
