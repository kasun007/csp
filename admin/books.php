<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Books';
$activePage = 'books';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$books = Book::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="books_form.php?locale=<?= h($locale) ?>">New book</a>
</div>
<p class="muted">Publications shown on the Our Publications page, where visitors order by WhatsApp.</p>

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
      <th>Author</th>
      <th>Price</th>
      <th>Slug</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$books): ?>
      <tr><td colspan="5" class="muted">No books yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($books as $book): ?>
      <tr>
        <td><?= h($book['title']) ?></td>
        <td><?= h($book['author']) ?></td>
        <td>Rs. <?= number_format((float) $book['price']) ?></td>
        <td><code><?= h($book['slug']) ?></code></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="books_form.php?id=<?= (int) $book['id'] ?>">Edit</a>
          <form method="post" action="books_delete.php" style="display:inline;" onsubmit="return confirm('Delete this book?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $book['id'] ?>">
            <input type="hidden" name="locale" value="<?= h($locale) ?>">
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php require __DIR__ . '/_partials/footer.php'; ?>
