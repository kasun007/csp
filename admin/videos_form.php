<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? Video::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Video not found.');
}

$pageTitle = $existing ? 'Edit Video' : 'New Video';
$activePage = 'videos';

$errors = [];
$form = $existing ?: [
    'locale' => ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en',
    'slug' => '',
    'title' => '',
    'youtube_id' => '',
    'start_seconds' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    }

    $form = [
        'locale' => ($_POST['locale'] ?? 'en') === 'si' ? 'si' : 'en',
        'slug' => trim($_POST['slug'] ?? ''),
        'title' => trim($_POST['title'] ?? ''),
        'youtube_id' => trim($_POST['youtube_id'] ?? ''),
        'start_seconds' => trim($_POST['start_seconds'] ?? ''),
    ];

    $form['slug'] = slugify($form['slug'] !== '' ? $form['slug'] : $form['title']);

    if ($form['title'] === '') {
        $errors[] = 'Title is required.';
    }
    if ($form['youtube_id'] === '') {
        $errors[] = 'YouTube video ID is required.';
    }
    if ($form['start_seconds'] !== '' && !ctype_digit($form['start_seconds'])) {
        $errors[] = 'Start time must be a whole number of seconds.';
    }
    if ($form['slug'] === '') {
        $errors[] = 'Could not derive a slug — set a title or slug.';
    } elseif (Video::slugExists($form['locale'], $form['slug'], $existing['id'] ?? null)) {
        $errors[] = "The slug \"{$form['slug']}\" is already used in this locale.";
    }

    if (!$errors) {
        if ($existing) {
            Video::update($existing['id'], $form);
        } else {
            Video::create($form);
        }
        flash_set($existing ? 'Video updated.' : 'Video created.');
        header('Location: videos.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="videos.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Videos are shown on the Videos page as a thumbnail that links out to YouTube.</p>

<?php foreach ($errors as $error): ?>
  <div class="alert alert-error"><?= h($error) ?></div>
<?php endforeach; ?>

<form method="post" novalidate>
  <?= csrf_field() ?>

  <div class="field">
    <label>Language</label>
    <select name="locale">
      <option value="en" <?= $form['locale'] === 'en' ? 'selected' : '' ?>>English</option>
      <option value="si" <?= $form['locale'] === 'si' ? 'selected' : '' ?>>Sinhala</option>
    </select>
    <div class="hint">Which language version of the site this video appears on. English and Sinhala entries are entirely separate.</div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">The caption shown above the video thumbnail.</div>
  </div>

  <div class="field">
    <label for="slug">Web address (slug)</label>
    <input type="text" id="slug" name="slug" value="<?= h($form['slug']) ?>" placeholder="Leave blank to generate from title">
    <div class="hint">An internal identifier for this video. Leave it blank — it's generated automatically from the title.</div>
  </div>

  <div class="field">
    <label for="youtube_id">YouTube video ID</label>
    <input type="text" id="youtube_id" name="youtube_id" value="<?= h($form['youtube_id']) ?>" placeholder="dQw4w9WgXcQ">
    <div class="hint">The code from the video's YouTube link, e.g. in "youtube.com/watch?v=dQw4w9WgXcQ" it's "dQw4w9WgXcQ".</div>
  </div>

  <div class="field">
    <label for="start_seconds">Start time in seconds (optional)</label>
    <input type="text" id="start_seconds" name="start_seconds" value="<?= h($form['start_seconds']) ?>" placeholder="243">
    <div class="hint">If the video should start partway through, enter how many seconds in, e.g. "243" for 4 minutes 3 seconds. Leave blank to start from the beginning.</div>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="videos.php?locale=<?= h($form['locale']) ?>">Cancel</a>
  </div>
</form>
<?php require __DIR__ . '/_partials/footer.php'; ?>
