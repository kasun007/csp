<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::requireLogin();

$pageTitle = 'Site Pages';
$activePage = 'pages';

$pageSchemas = [
    'home' => [
        'label' => 'Home',
        'fields' => [
            ['key' => 'hero_tagline', 'label' => 'Hero tagline', 'type' => 'textarea', 'hint' => 'The animated headline on the home page. Wrap the emphasized word in <em class="hl">...</em> to match the current highlight style.'],
            ['key' => 'project_steps', 'label' => '"Our Project" mission steps', 'type' => 'textarea', 'hint' => 'Separate each step with a blank line. Shown as numbered steps.'],
        ],
    ],
    'about' => [
        'label' => 'About',
        'fields' => [
            ['key' => 'hero_tag', 'label' => 'Hero tag', 'type' => 'text'],
            ['key' => 'hero_title', 'label' => 'Hero title', 'type' => 'text'],
            ['key' => 'approach_tag', 'label' => '"Our approach" tag', 'type' => 'text'],
            ['key' => 'approach_body', 'label' => '"Our approach" body', 'type' => 'textarea', 'hint' => 'Separate paragraphs with a blank line.'],
            ['key' => 'pull_quote', 'label' => 'Pull quote', 'type' => 'textarea'],
            ['key' => 'history_heading', 'label' => '"Our History" heading', 'type' => 'text'],
            ['key' => 'history_body', 'label' => '"Our History" body', 'type' => 'textarea', 'hint' => 'Separate paragraphs with a blank line.'],
            ['key' => 'interview_heading', 'label' => 'Interview section heading', 'type' => 'text'],
            ['key' => 'interview_intro', 'label' => 'Interview intro (before the divider)', 'type' => 'textarea', 'hint' => 'Separate paragraphs with a blank line.'],
            ['key' => 'interview_qa', 'label' => 'Interview Q&A (after the divider)', 'type' => 'textarea', 'hint' => 'Separate paragraphs with a blank line. Wrap speaker names in <span class="interview-speaker">Name:</span> (add interview-speaker--interviewer for the interviewer) to match the current style.'],
        ],
    ],
    'contact' => [
        'label' => 'Contact',
        'fields' => [
            ['key' => 'lead', 'label' => 'Lead paragraph', 'type' => 'textarea'],
            ['key' => 'contacts', 'label' => 'Contact cards', 'type' => 'textarea', 'hint' => 'One per line: Label | Name | WhatsApp number (digits only, no +). Example: Study circles | Vangeesa Sumanasekara | 94710561317'],
            ['key' => 'address', 'label' => 'Address', 'type' => 'textarea'],
            ['key' => 'map_url', 'label' => 'Google Maps URL', 'type' => 'text'],
        ],
    ],
    'donate' => [
        'label' => 'Donate',
        'fields' => [
            ['key' => 'intro', 'label' => 'Intro paragraph', 'type' => 'textarea'],
            ['key' => 'bank_account_name', 'label' => 'Bank account name', 'type' => 'text'],
            ['key' => 'bank_account_number', 'label' => 'Bank account number', 'type' => 'text'],
            ['key' => 'bank_name', 'label' => 'Bank name', 'type' => 'text'],
            ['key' => 'gift_items', 'label' => '"What a gift funds" items', 'type' => 'textarea', 'hint' => 'One per line: Label | Title. The last item is shown accented.'],
        ],
    ],
];

$page = $_GET['page'] ?? 'home';
if (!isset($pageSchemas[$page])) {
    $page = 'home';
}
$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$schema = $pageSchemas[$page];

$flash = flash_get();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Your session expired — please try again.';
    } else {
        $values = [];
        foreach ($schema['fields'] as $field) {
            $values[$field['key']] = trim($_POST[$field['key']] ?? '');
        }
        SiteContent::setMany($page, $locale, $values);
        flash_set('Saved.');
        header('Location: pages.php?page=' . urlencode($page) . '&locale=' . urlencode($locale));
        exit;
    }
}

$values = SiteContent::allForPage($page, $locale);

require __DIR__ . '/_partials/header.php';
?>
<div class="topbar">
  <h1><?= h($pageTitle) ?></h1>
</div>
<p class="muted">The wording used on the Home, About, Contact and Donate pages. Pick a page and language below, edit the text, then save.</p>

<?php if ($flash): ?>
  <div class="alert alert-<?= h($flash['type']) ?>"><?= h($flash['message']) ?></div>
<?php endif; ?>
<?php foreach ($errors as $error): ?>
  <div class="alert alert-error"><?= h($error) ?></div>
<?php endforeach; ?>

<div class="locale-tabs">
  <?php foreach ($pageSchemas as $key => $s): ?>
    <a href="?page=<?= h($key) ?>&locale=<?= h($locale) ?>" class="<?= $page === $key ? 'active' : '' ?>"><?= h($s['label']) ?></a>
  <?php endforeach; ?>
</div>
<div class="locale-tabs">
  <a href="?page=<?= h($page) ?>&locale=en" class="<?= $locale === 'en' ? 'active' : '' ?>">English</a>
  <a href="?page=<?= h($page) ?>&locale=si" class="<?= $locale === 'si' ? 'active' : '' ?>">Sinhala</a>
</div>

<form method="post">
  <?= csrf_field() ?>
  <?php foreach ($schema['fields'] as $field): ?>
    <div class="field">
      <label for="<?= h($field['key']) ?>"><?= h($field['label']) ?></label>
      <?php if ($field['type'] === 'textarea'): ?>
        <textarea id="<?= h($field['key']) ?>" name="<?= h($field['key']) ?>" style="min-height:8rem;"><?= h($values[$field['key']] ?? '') ?></textarea>
      <?php else: ?>
        <input type="text" id="<?= h($field['key']) ?>" name="<?= h($field['key']) ?>" value="<?= h($values[$field['key']] ?? '') ?>">
      <?php endif; ?>
      <?php if (!empty($field['hint'])): ?>
        <div class="hint"><?= h($field['hint']) ?></div>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <div class="actions">
    <button type="submit" class="btn">Save</button>
  </div>
</form>
<?php require __DIR__ . '/_partials/footer.php'; ?>
