<?php
// Locale redirect — mirrors the live site's root index.html behavior, but
// server-side via Accept-Language instead of a client-side JS redirect.
$supported = ['en', 'si'];
$lang = 'en';
if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
    $primary = strtolower(substr(trim(explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE'])[0]), 0, 2));
    if (in_array($primary, $supported, true)) {
        $lang = $primary;
    }
}

header("Location: /{$lang}/index.html", true, 302);
exit;
