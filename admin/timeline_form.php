<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? TimelineItem::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Timeline item not found.');
}

$pageTitle = $existing ? 'Edit Timeline Item' : 'New Timeline Item';
$activePage = 'timeline';

$locale = $existing['locale'] ?? (($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en');

$errors = [];
$form = $existing ?: [
    'locale' => $locale,
    'year' => '',
    'title' => '',
    'description' => '',
    'image' => '',
    'is_closing' => 0,
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    }

    $form = [
        'locale' => ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en',
        'year' => trim($_POST['year'] ?? ''),
        'title' => trim($_POST['title'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'image' => trim($_POST['existing_image'] ?? ''),
        'is_closing' => !empty($_POST['is_closing']),
        'position' => $existing['position'] ?? TimelineItem::nextPosition($_POST['locale'] ?? 'en'),
    ];

    if (!empty($_POST['remove_image'])) {
        $form['image'] = '';
    }

    try {
        $uploadedImage = save_uploaded_image($_FILES['image_upload'] ?? [], 'timeline');
        if ($uploadedImage) {
            $form['image'] = $uploadedImage;
        }
    } catch (RuntimeException $e) {
        $errors[] = $e->getMessage();
    }

    if ($form['title'] === '') {
        $errors[] = 'Title is required.';
    }
    if ($form['description'] === '') {
        $errors[] = 'Description is required.';
    }

    if (!$errors) {
        if ($existing) {
            TimelineItem::update($existing['id'], $form);
        } else {
            TimelineItem::create($form);
        }
        flash_set($existing ? 'Timeline item updated.' : 'Timeline item created.');
        header('Location: timeline.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="timeline.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Timeline items make up the "Our History" timeline shown on the About page, in the order you set on the Timeline list.</p>

<?php foreach ($errors as $error): ?>
  <div class="alert alert-error"><?= h($error) ?></div>
<?php endforeach; ?>

<form method="post" enctype="multipart/form-data" novalidate>
  <?= csrf_field() ?>
  <input type="hidden" name="existing_image" value="<?= h($form['image']) ?>">

  <div class="field">
    <label>Language</label>
    <select name="locale">
      <option value="en" <?= $form['locale'] === 'en' ? 'selected' : '' ?>>English</option>
      <option value="si" <?= $form['locale'] === 'si' ? 'selected' : '' ?>>Sinhala</option>
    </select>
    <div class="hint">Which language version of the About page this appears on.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="year">Year (optional)</label>
      <input type="text" id="year" name="year" value="<?= h($form['year']) ?>" placeholder="2026">
      <div class="hint">The year this happened. Leave blank only for the final "closing" entry.</div>
    </div>
    <div class="field checkbox-field" style="margin-top:1.6rem;">
      <input type="checkbox" id="is_closing" name="is_closing" value="1" <?= $form['is_closing'] ? 'checked' : '' ?>>
      <label for="is_closing" style="margin:0;">This is the closing item (shown last, no year)</label>
    </div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">A short heading for this moment in the timeline.</div>
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description" style="min-height:4rem;"><?= h($form['description']) ?></textarea>
    <div class="hint">A sentence or two describing what happened.</div>
  </div>

  <div class="field">
    <label>Image (optional)</label>
    <?php if ($form['image']): ?>
      <div class="image-preview">
        <img src="<?= h($form['image']) ?>" alt="">
        <label class="checkbox-field"><input type="checkbox" name="remove_image" value="1"> Remove this image</label>
      </div>
    <?php endif; ?>
    <input type="file" name="image_upload" accept="image/*">
    <div class="hint">A photo for this moment. Visitors can click it to view it larger. Choose a file from your computer to upload it — JPG, PNG, WEBP or GIF.</div>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="timeline.php?locale=<?= h($form['locale']) ?>">Cancel</a>
  </div>
</form>
<?php require __DIR__ . '/_partials/footer.php'; ?>
