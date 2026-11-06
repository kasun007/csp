<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$existing = $id ? Course::find($id) : null;
if ($id && !$existing) {
    http_response_code(404);
    exit('Course not found.');
}

$pageTitle = $existing ? 'Edit Course' : 'New Course';
$activePage = 'courses';

$errors = [];
$form = $existing ?: [
    'locale' => ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en',
    'slug' => '',
    'category' => '',
    'category_label' => '',
    'title' => '',
    'summary' => '',
    'duration' => '',
    'format' => '',
    'start_date' => '',
    'start_time' => '',
    'location' => '',
    'map_url' => '',
    'fee' => '',
    'instructor' => '',
    'image' => '',
    'description' => '',
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
        'summary' => trim($_POST['summary'] ?? ''),
        'duration' => trim($_POST['duration'] ?? ''),
        'format' => trim($_POST['format'] ?? ''),
        'start_date' => trim($_POST['start_date'] ?? ''),
        'start_time' => trim($_POST['start_time'] ?? ''),
        'location' => trim($_POST['location'] ?? ''),
        'map_url' => trim($_POST['map_url'] ?? ''),
        'fee' => trim($_POST['fee'] ?? ''),
        'instructor' => trim($_POST['instructor'] ?? ''),
        'image' => trim($_POST['existing_image'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
    ];

    if (!empty($_POST['remove_image'])) {
        $form['image'] = '';
    }

    try {
        $uploadedImage = save_uploaded_image($_FILES['image_upload'] ?? [], 'courses');
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
    if ($form['category'] === '') {
        $errors[] = 'Category is required.';
    }
    if ($form['summary'] === '') {
        $errors[] = 'Summary is required.';
    }
    if ($form['description'] === '') {
        $errors[] = 'Description is required.';
    }
    if ($form['slug'] === '') {
        $errors[] = 'Could not derive a slug — set a title or slug.';
    } elseif (Course::slugExists($form['locale'], $form['slug'], $existing['id'] ?? null)) {
        $errors[] = "The slug \"{$form['slug']}\" is already used in this locale.";
    }

    if (!$errors) {
        if ($existing) {
            Course::update($existing['id'], $form);
        } else {
            Course::create($form);
        }
        flash_set($existing ? 'Course updated.' : 'Course created.');
        header('Location: courses.php?locale=' . urlencode($form['locale']));
        exit;
    }
}

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
  <a class="btn btn-secondary" href="courses.php?locale=<?= h($form['locale']) ?>">Back to list</a>
</div>
<p class="muted">Courses are shown on the Courses page, with a listing card and a full detail page for each one.</p>

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
    <div class="hint">Which language version of the site this course appears on. English and Sinhala courses are entirely separate entries.</div>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= h($form['title']) ?>" required>
    <div class="hint">The name of the course, e.g. "The Deconstruction Course".</div>
  </div>

  <div class="field">
    <label for="slug">Web address (slug)</label>
    <input type="text" id="slug" name="slug" value="<?= h($form['slug']) ?>" placeholder="Leave blank to generate from title">
    <div class="hint">This becomes part of the course's web address. Leave it blank — it's generated automatically from the title.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="category">Category</label>
      <input type="text" id="category" name="category" value="<?= h($form['category']) ?>" placeholder="open">
      <div class="hint">A short internal code, e.g. "open" or "completed". Groups courses for the filter buttons on the Courses page — use the same word for courses in the same group.</div>
    </div>
    <div class="field">
      <label for="category_label">Category label</label>
      <input type="text" id="category_label" name="category_label" value="<?= h($form['category_label']) ?>" placeholder="Now Open Courses">
      <div class="hint">The friendly name shown to visitors for that category, e.g. "Now Open Courses".</div>
    </div>
  </div>

  <div class="field">
    <label for="summary">Summary</label>
    <textarea id="summary" name="summary" style="min-height:3rem;"><?= h($form['summary']) ?></textarea>
    <div class="hint">A one-sentence description shown under the title in the course list.</div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="duration">Duration</label>
      <input type="text" id="duration" name="duration" value="<?= h($form['duration']) ?>" placeholder="6 months">
      <div class="hint">How long the course runs for, in plain words.</div>
    </div>
    <div class="field">
      <label for="format">Format</label>
      <input type="text" id="format" name="format" value="<?= h($form['format']) ?>" placeholder="Live session">
      <div class="hint">How the course is delivered, e.g. "Live session" or "Online".</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="start_date">Start date</label>
      <input type="text" id="start_date" name="start_date" value="<?= h($form['start_date']) ?>" placeholder="1 August 2026">
      <div class="hint">The date the course starts, written out, e.g. "1 August 2026".</div>
    </div>
    <div class="field">
      <label for="start_time">Start time</label>
      <input type="text" id="start_time" name="start_time" value="<?= h($form['start_time']) ?>" placeholder="Saturdays, 10:30 AM to 12:30 PM">
      <div class="hint">The recurring day and time, written out, e.g. "Saturdays, 10:30 AM to 12:30 PM".</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="location">Location</label>
      <input type="text" id="location" name="location" value="<?= h($form['location']) ?>">
      <div class="hint">Where the course is held, e.g. "Mahaweli Centre, Colombo 07".</div>
    </div>
    <div class="field">
      <label for="map_url">Map link</label>
      <input type="text" id="map_url" name="map_url" value="<?= h($form['map_url']) ?>">
      <div class="hint">A Google Maps link to the location above. Visitors see a "View on map" button that opens this link.</div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label for="fee">Fee (optional)</label>
      <input type="text" id="fee" name="fee" value="<?= h($form['fee']) ?>" placeholder="Rs. 5,000 (monthly)">
      <div class="hint">The cost to join, written out. Leave blank if the course is free or has no listed fee.</div>
    </div>
    <div class="field">
      <label for="instructor">Instructor (optional)</label>
      <input type="text" id="instructor" name="instructor" value="<?= h($form['instructor']) ?>">
      <div class="hint">Who teaches the course. Leave blank if not applicable.</div>
    </div>
  </div>

  <div class="field">
    <label>Cover image (optional)</label>
    <?php if ($form['image']): ?>
      <div class="image-preview">
        <img src="<?= h($form['image']) ?>" alt="">
        <label class="checkbox-field"><input type="checkbox" name="remove_image" value="1"> Remove this image</label>
      </div>
    <?php endif; ?>
    <input type="file" name="image_upload" accept="image/*">
    <div class="hint">A photo for this course, shown on the detail page. Choose a file from your computer to upload it — JPG, PNG, WEBP or GIF.</div>
  </div>

  <div class="field">
    <label for="description">Description (the full course page text)</label>
    <textarea id="description" name="description" style="min-height:14rem;"><?= h($form['description']) ?></textarea>
    <div class="hint">The full write-up shown on the course's own page. Leave a blank line between paragraphs to start a new one.</div>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Save</button>
    <a class="btn btn-secondary" href="courses.php?locale=<?= h($form['locale']) ?>">Cancel</a>
  </div>
</form>
<?php require __DIR__ . '/_partials/footer.php'; ?>
