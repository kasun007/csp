<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? Highlight::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Feature not found.');
}

$pageTitle = $existing ? 'Edit Feature' : 'New Feature';
$activePage = 'highlights';

$errors = [];
$form = $existing ?: [
    'locale' => ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en',
    'slug' => '',
    'title' => '',
    'description' => '',
    'date' => '',
    'date_label' => '',
    'youtube_id' => '',
    'start_seconds' => '',
    'image' => '',
    'external_url' => '',
    'body' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    }

    $form = [
        'locale' => ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en',
        'slug' => trim($_POST['slug'] ?? ''),
        'title' => trim($_POST['title'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'date' => trim($_POST['date'] ?? ''),
        'date_label' => trim($_POST['date_label'] ?? ''),
        'youtube_id' => trim($_POST['youtube_id'] ?? ''),
        'start_seconds' => trim($_POST['start_seconds'] ?? ''),
        'image' => trim($_POST['existing_image'] ?? ''),
        'external_url' => trim($_POST['external_url'] ?? ''),
        'body' => trim($_POST['body'] ?? ''),
    ];

    if (!empty($_POST['remove_image'])) {
        $form['image'] = '';
    }

    try {
        $uploadedImage = save_uploaded_image($_FILES['image_upload'] ?? [], 'highlights');
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
    if ($form['description'] === '') {
        $errors[] = 'Description is required.';
    }
    if (trim(strip_tags($form['body'])) === '') {
        $errors[] = 'Body is required.';
    }
    if ($form['slug'] === '') {
        $errors[] = 'Could not derive a slug — set a title or slug.';
    } elseif (Highlight::slugExists($form['locale'], $form['slug'], $existing['id'] ?? null)) {
        $errors[] = "The slug \"{$form['slug']}\" is already used in this locale.";
    }

    if (!$errors) {
        if ($existing) {
            Highlight::update($existing['id'], $form);
            $highlightId = $existing['id'];
        } else {
            $highlightId = Highlight::create($form);
        }

        foreach (($_POST['delete_gallery'] ?? []) as $imageId) {
            Highlight::deleteGalleryImage((int) $imageId);
        }

        $existingGalleryCount = count(Highlight::galleryImages($highlightId));
        $newGalleryFiles = $_FILES['gallery_upload'] ?? null;
        if ($newGalleryFiles && is_array($newGalleryFiles['tmp_name'] ?? null)) {
            $position = $existingGalleryCount;
            foreach ($newGalleryFiles['tmp_name'] as $i => $tmpName) {
                if ($newGalleryFiles['error'][$i] === UPLOAD_ERR_NO_FILE) {
                    continue;
                }
                $singleFile = [
                    'tmp_name' => $tmpName,
                    'name' => $newGalleryFiles['name'][$i],
                    'error' => $newGalleryFiles['error'][$i],
                ];
                try {
                    $path = save_uploaded_image($singleFile, 'highlights/' . $form['slug']);
                    if ($path) {
                        Highlight::addGalleryImage($highlightId, $path, $position++);
                    }
                } catch (RuntimeException $e) {
                    $errors[] = $e->getMessage();
                }
            }
        }

        flash_set($existing ? 'Feature updated.' : 'Feature created.');
        header('Location: highlights.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

$gallery = $existing ? Highlight::galleryImages($existing['id']) : [];

require __DIR__ . '/_partials/header.php';
?>
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="highlights.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Features are news items, event recaps, videos, and press mentions shown on the Features page.</p>

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
    <div class="hint">Which language version of the site this appears on. A feature only needs to exist in one language if you don't have a translation for it — English and Sinhala are completely independent.</div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">The headline shown on the card and at the top of the full page.</div>
  </div>

  <div class="field">
    <label for="slug">Web address (slug)</label>
    <input type="text" id="slug" name="slug" value="<?= h($form['slug']) ?>" placeholder="Leave blank to generate from title">
    <div class="hint">This becomes part of the web address for this item. Leave it blank and it will be created automatically from the title.</div>
  </div>

  <div class="field">
    <label for="description">Short description</label>
    <textarea id="description" name="description" style="min-height:4rem;"><?= h($form['description']) ?></textarea>
    <div class="hint">A one or two sentence summary shown on the card in the Features list. Keep it brief — the full story goes in the Body field below.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="date">Date</label>
      <input type="date" id="date" name="date" value="<?= h($form['date']) ?>">
      <div class="hint">Used to sort items — newest first. Pick the actual date this happened.</div>
    </div>
    <div class="field">
      <label for="date_label">Date label</label>
      <input type="text" id="date_label" name="date_label" value="<?= h($form['date_label']) ?>" placeholder="e.g. 25 August 2026">
      <div class="hint">How the date is actually displayed to visitors. Can be a full date, or just a year, e.g. "2024".</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="youtube_id">YouTube video ID (optional)</label>
      <input type="text" id="youtube_id" name="youtube_id" value="<?= h($form['youtube_id']) ?>">
      <div class="hint">If this feature is about a video, paste just the video's ID here (the part after "v=" in the YouTube URL), not the full link. If set, this is shown instead of the cover image.</div>
    </div>
    <div class="field">
      <label for="start_seconds">Start at (seconds, optional)</label>
      <input type="number" id="start_seconds" name="start_seconds" value="<?= h($form['start_seconds']) ?>" min="0">
      <div class="hint">Only used with the YouTube video above — makes the video start partway in rather than from the beginning. Leave blank to start from 0:00.</div>
    </div>
  </div>

  <div class="field">
    <label for="external_url">External article link (optional)</label>
    <input type="text" id="external_url" name="external_url" value="<?= h($form['external_url']) ?>">
    <div class="hint">If this feature is about press coverage elsewhere (a newspaper article, another website), paste the full link here. A "Read the full article" button will be added to the page.</div>
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
    <div class="hint">The main photo for this item. Choose a file from your computer to upload it — JPG, PNG, WEBP or GIF. This is ignored if a YouTube video ID is set above, since the video thumbnail is used instead.</div>
  </div>

  <div class="field">
    <label for="body-editor">Body (the full story)</label>
    <div id="body-editor" style="background:#fff;"><?= $form['body'] ?></div>
    <textarea id="body" name="body" style="display:none;"><?= h($form['body']) ?></textarea>
    <div class="hint">This is the full write-up shown on the item's own page. Use the toolbar above to add headings, <strong>bold</strong>/<em>italic</em> text, links, quotes, and lists.</div>
  </div>

  <?php if ($existing): ?>
  <div class="field">
    <label>Gallery images</label>
    <?php if ($gallery): ?>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:0.75rem;">
        <?php foreach ($gallery as $image): ?>
          <div style="width:7rem;">
            <img src="<?= h($image['image_path']) ?>" alt="" style="width:100%;border-radius:6px;display:block;margin-bottom:0.3rem;">
            <label class="checkbox-field small"><input type="checkbox" name="delete_gallery[]" value="<?= (int) $image['id'] ?>"> Delete</label>
          </div>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <p class="muted small">No gallery images yet.</p>
    <?php endif; ?>
    <input type="file" name="gallery_upload[]" accept="image/*" multiple>
    <div class="hint">An optional set of extra photos shown in a clickable gallery at the bottom of the page (e.g. event photos). You can select multiple files at once. New files are added after the existing ones — they don't replace them.</div>
  </div>
  <?php else: ?>
    <p class="muted small">Save the feature first, then edit it again to add gallery images.</p>
  <?php endif; ?>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="highlights.php?locale=<?= h($form['locale']) ?>">Cancel</a>
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
