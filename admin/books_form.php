<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? Book::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Book not found.');
}

$pageTitle = $existing ? 'Edit Book' : 'New Book';
$activePage = 'books';

$errors = [];
$form = $existing ?: [
    'locale' => ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en',
    'slug' => '',
    'title' => '',
    'subtitle' => '',
    'author' => '',
    'price' => '',
    'image' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    }

    $form = [
        'locale' => ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en',
        'slug' => trim($_POST['slug'] ?? ''),
        'title' => trim($_POST['title'] ?? ''),
        'subtitle' => trim($_POST['subtitle'] ?? ''),
        'author' => trim($_POST['author'] ?? ''),
        'price' => trim($_POST['price'] ?? ''),
        'image' => trim($_POST['existing_image'] ?? ''),
    ];

    if (!empty($_POST['remove_image'])) {
        $form['image'] = '';
    }

    try {
        $uploadedImage = save_uploaded_image($_FILES['image_upload'] ?? [], 'books');
        if ($uploadedImage) {
            $form['image'] = $uploadedImage;
        }
    } catch (RuntimeException $e) {
        $errors[] = $e->getMessage();
    }

    $form['slug'] = slugify($form['slug'] !== '' ? $form['slug'] : $form['title']);

    if ($form['title'] === '') {
        $errors[] = 'Title is required.';
    }
    if ($form['author'] === '') {
        $errors[] = 'Author is required.';
    }
    if ($form['price'] === '' || !is_numeric($form['price']) || (float) $form['price'] < 0) {
        $errors[] = 'Price must be a non-negative number.';
    }
    if ($form['slug'] === '') {
        $errors[] = 'Could not derive a slug — set a title or slug.';
    } elseif (Book::slugExists($form['locale'], $form['slug'], $existing['id'] ?? null)) {
        $errors[] = "The slug \"{$form['slug']}\" is already used in this locale.";
    }

    if (!$errors) {
        if ($existing) {
            Book::update($existing['id'], $form);
        } else {
            Book::create($form);
        }
        flash_set($existing ? 'Book updated.' : 'Book created.');
        header('Location: books.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="books.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Books are the publications shown on the Our Publications page, where visitors can add them to a cart and order by WhatsApp.</p>

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
    <div class="hint">Which language version of the site this book appears on. English and Sinhala entries are entirely separate.</div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">The book's title, as it should appear to visitors.</div>
  </div>

  <div class="field">
    <label for="slug">Web address (slug)</label>
    <input type="text" id="slug" name="slug" value="<?= h($form['slug']) ?>" placeholder="Leave blank to generate from title">
    <div class="hint">An internal identifier for this book. Leave it blank — it's generated automatically from the title.</div>
  </div>

  <div class="field">
    <label for="subtitle">Subtitle (optional)</label>
    <input type="text" id="subtitle" name="subtitle" value="<?= h($form['subtitle']) ?>">
    <div class="hint">A secondary line shown under the title, if the book has one. Leave blank if not.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="author">Author</label>
      <input type="text" id="author" name="author" value="<?= h($form['author']) ?>">
      <div class="hint">Who wrote (or edited) the book. For multiple authors, separate names with a comma.</div>
    </div>
    <div class="field">
      <label for="price">Price (Rs.)</label>
      <input type="number" id="price" name="price" value="<?= h((string) $form['price']) ?>" min="0" step="1">
      <div class="hint">The price in Sri Lankan Rupees, numbers only (no "Rs." or commas).</div>
    </div>
  </div>

  <div class="field">
    <label>Cover image</label>
    <?php if ($form['image']): ?>
      <div class="image-preview">
        <img src="<?= h($form['image']) ?>" alt="">
        <label class="checkbox-field"><input type="checkbox" name="remove_image" value="1"> Remove this image</label>
      </div>
    <?php endif; ?>
    <input type="file" name="image_upload" accept="image/*">
    <div class="hint">A photo of the book cover. Choose a file from your computer to upload it — JPG, PNG, WEBP or GIF.</div>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="books.php?locale=<?= h($form['locale']) ?>">Cancel</a>
  </div>
</form>
<?php require __DIR__ . '/_partials/footer.php'; ?>
