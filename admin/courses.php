<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Courses';
$activePage = 'courses';

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$courses = Course::allByLocale($locale);
$flash = flash_get();

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn" href="courses_form.php?locale=<?= h($locale) ?>">New course</a>
</div>
<p class="muted">The courses listed on the Courses page, each with its own detail page.</p>

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
      <th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$courses): ?>
      <tr><td colspan="4" class="muted">No courses yet in this locale.</td></tr>
    <?php endif; ?>
    <?php foreach ($courses as $course): ?>
      <tr>
        <td><?= h($course['title']) ?></td>
        <td><?= h($course['category_label']) ?></td>
        <td><code><?= h($course['slug']) ?></code></td>
        <td>
          <a class="btn btn-secondary btn-sm" href="courses_form.php?id=<?= (int) $course['id'] ?>">Edit</a>
          <form method="post" action="courses_delete.php" style="display:inline;" onsubmit="return confirm('Delete this course?');">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int) $course['id'] ?>">
            <input type="hidden" name="locale" value="<?= h($locale) ?>">
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php require __DIR__ . '/_partials/footer.php'; ?>
