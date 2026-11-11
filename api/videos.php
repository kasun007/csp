<?php
/**
 * JSON endpoint backing the Home page video library's search and
 * "Load more" button. Read-only, no auth needed (same data the public
 * video library already renders server-side on first load).
 */

require_once __DIR__ . '/../../src/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$locale = ($_GET['locale'] ?? 'en') === 'si' ? 'si' : 'en';
$query = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 12;

$videos = YouTubeVideo::paginate($page, $perPage, $query);
$total = YouTubeVideo::count($query);

$items = array_map(static function (array $video) use ($locale) {
    return [
        'id' => $video['youtube_video_id'],
        'title' => $video['title'],
        'description' => excerpt($video['description'], 160),
        'thumbnail' => $video['thumbnail_url'],
        'publishedAt' => $video['published_at'],
        'publishedAtDisplay' => format_display_date($video['published_at'], $locale),
    ];
}, $videos);

echo json_encode([
    'videos' => $items,
    'page' => $page,
    'perPage' => $perPage,
    'total' => $total,
    'hasMore' => ($page * $perPage) < $total,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
