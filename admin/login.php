<?php
require_once __DIR__ . '/../../src/bootstrap.php';

Auth::start();
if (Auth::check()) {
    header('Location: index.php');
    exit;
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Enter both a username and password.';
    } elseif (Auth::attempt($username, $password)) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Incorrect username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Login — CSP</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>
<div class="gate">
  <div class="gate-card">
    <h1>CSP Admin</h1>
    <p class="muted small">Sign in to manage courses, books, features, the blog, timeline and site copy.</p>
    <?php if ($error): ?>
      <div class="alert alert-error"><?= h($error) ?></div>
    <?php endif; ?>
    <form method="post" novalidate>
      <div class="field">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" autocomplete="username" autofocus required>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" autocomplete="current-password" required>
      </div>
      <button type="submit" class="btn" style="width:100%;">Sign in</button>
    </form>
  </div>
</div>
</body>
</html>
