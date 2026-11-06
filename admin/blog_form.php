<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? BlogPost::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Post not found.');
}

$pageTitle = $existing ? 'Edit Post' : 'New Post';
$activePage = 'blog';

$errors = [];
$form = $existing ?: [
    'locale' => ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en',
    'slug' => '',
    'category' => '',
    'category_label' => '',
    'title' => '',
    'excerpt' => '',
    'author' => '',
    'image' => '',
    'body' => '',
    'quote' => '',
    'published_at' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    }

    $form = [
        'locale' => ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en',
        'slug' => trim($_POST['slug'] ?? ''),
        'category' => trim($_POST['category'] ?? ''),
        'category_label' => trim($_POST['category_label'] ?? ''),
        'title' => trim($_POST['title'] ?? ''),
        'excerpt' => trim($_POST['excerpt'] ?? ''),
        'author' => trim($_POST['author'] ?? ''),
        'image' => trim($_POST['existing_image'] ?? ''),
        'body' => trim($_POST['body'] ?? ''),
        'quote' => trim($_POST['quote'] ?? ''),
        'published_at' => trim($_POST['published_at'] ?? ''),
    ];

    if (!empty($_POST['remove_image'])) {
        $form['image'] = '';
    }

    try {
        $uploadedImage = save_uploaded_image($_FILES['image_upload'] ?? [], 'blog');
        if ($uploadedImage) {
            $form['image'] = $uploadedImage;
        }
    } catch (RuntimeException $e) {
        $errors[] = $e->getMessage();
    }

    if ($form['slug'] === '') {
        $form['slug'] = slugify($form['title']);
    } else {
        $form['slug'] = slugify($form['slug']);
    }

    if ($form['title'] === '') {
        $errors[] = 'Title is required.';
    }
    if ($form['category'] === '') {
        $errors[] = 'Category is required.';
    }
    if ($form['excerpt'] === '') {
        $errors[] = 'Excerpt is required.';
    }
    if (trim(strip_tags($form['body'])) === '') {
        $errors[] = 'Body is required.';
    }
    if ($form['slug'] === '') {
        $errors[] = 'Could not derive a slug — set a title or slug.';
    } elseif (BlogPost::slugExists($form['locale'], $form['slug'], $existing['id'] ?? null)) {
        $errors[] = "The slug \"{$form['slug']}\" is already used in this locale.";
    }

    if (!$errors) {
        if ($existing) {
            BlogPost::update($existing['id'], $form);
            flash_set('Post updated.');
        } else {
            BlogPost::create($form);
            flash_set('Post created.');
        }
        header('Location: blog.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

require __DIR__ . '/_partials/header.php';
?>
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="blog.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Blog posts are the articles and essays shown on the Blog page of the site.</p>

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
    <div class="hint">Which language version of the site this post appears on. English and Sinhala posts are completely separate — you'll need to create this post again under the other language if you want it there too.</div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">The headline of the post, shown at the top of the article and in the list of posts.</div>
  </div>

  <div class="field">
    <label for="slug">Web address (slug)</label>
    <input type="text" id="slug" name="slug" value="<?= h($form['slug']) ?>" placeholder="Leave blank to generate from title">
    <div class="hint">This becomes part of the post's web address. Just leave it blank — it will be created automatically from the title. Only change it if you specifically need a different URL.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="category">Category</label>
      <input type="text" id="category" name="category" value="<?= h($form['category']) ?>" placeholder="essay">
      <div class="hint">A short internal code for grouping posts, e.g. "essay". Use the same word consistently for posts that belong together — it's used to build the filter buttons on the blog page.</div>
    </div>
    <div class="field">
      <label for="category_label">Category label</label>
      <input type="text" id="category_label" name="category_label" value="<?= h($form['category_label']) ?>" placeholder="Essays">
      <div class="hint">The friendly version of the category shown to visitors, e.g. "Essays".</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="author">Author</label>
      <input type="text" id="author" name="author" value="<?= h($form['author']) ?>">
      <div class="hint">Who wrote this post. Shown under the title on the article page.</div>
    </div>
    <div class="field">
      <label for="published_at">Published date</label>
      <input type="date" id="published_at" name="published_at" value="<?= h($form['published_at']) ?>">
      <div class="hint">Optional. Controls where this post appears in the list (newest first). If left blank, it's placed after all dated posts.</div>
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
    <div class="hint">The photo shown at the top of the article and on the blog list card. Choose a file from your computer to upload it — JPG, PNG, WEBP or GIF. Leave blank to keep the current image, or tick "Remove" to delete it.</div>
  </div>

  <div class="field">
    <label for="excerpt">Excerpt (short summary)</label>
    <textarea id="excerpt" name="excerpt" style="min-height:4rem;"><?= h($form['excerpt']) ?></textarea>
    <div class="hint">A one or two sentence teaser shown on the blog list page under the title. Doesn't need to repeat the full article.</div>
  </div>

  <div class="field">
    <label for="body-editor">Body (the full article)</label>
    <div id="body-editor" style="background:#fff;"><?= $form['body'] ?></div>
    <textarea id="body" name="body" style="display:none;"><?= h($form['body']) ?></textarea>
    <div class="hint">This is the main article text. Use the toolbar above to add headings, <strong>bold</strong>/<em>italic</em> text, links, quotes, and bulleted or numbered lists — just like a word processor.</div>
  </div>

  <div class="field">
    <label for="quote">Pull quote (optional)</label>
    <textarea id="quote" name="quote" style="min-height:4rem;"><?= h($form['quote']) ?></textarea>
    <div class="hint">An optional short quote pulled from the article and displayed in large text at the end, for emphasis. Leave blank if you don't want one.</div>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="blog.php?locale=<?= h($form['locale']) ?>">Cancel</a>
  </div>
</form>

<script src="https://cdn.quilljs.com/1.3.7/quill.js"></script>
<script>
  var quill = new Quill('#body-editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    },
  });
  document.querySelector('form').addEventListener('submit', function () {
    document.getElementById('body').value = quill.root.innerHTML;
  });
</script>
<?php require __DIR__ . '/_partials/footer.php'; ?>
