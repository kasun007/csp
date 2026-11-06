<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Blog';
$activePage = 'blog';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$posts = BlogPost::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="blog_form.php?locale=<?= h($locale) ?>">New post</a>
</div>
<p class="muted">Articles and essays shown on the Blog page.</p>

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
      <th>Category</th>
      <th>Slug</th>
      <th>Published</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$posts): ?>
      <tr><td colspan="5" class="muted">No blog posts yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($posts as $post): ?>
      <tr>
        <td><?= h($post['title']) ?></td>
        <td><?= h($post['category_label'] ?: $post['category']) ?></td>
        <td><code><?= h($post['slug']) ?></code></td>
        <td><?= h($post['published_at'] ?: '—') ?></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="blog_form.php?id=<?= (int) $post['id'] ?>">Edit</a>
          <form method="post" action="blog_delete.php" style="display:inline;" onsubmit="return confirm('Delete this post?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $post['id'] ?>">
            <input type="hidden" name="locale" value="<?= h($locale) ?>">
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php require __DIR__ . '/_partials/footer.php'; ?>
