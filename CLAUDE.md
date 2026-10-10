# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, bilingual (English/Sinhala) marketing + content site for the Colombo School of Philosophy, hosted on Hostinger shared hosting at `csp.lk`. Plain HTML/CSS/vanilla JS — **no framework, no bundler, no npm dependencies, no backend/database.** Content is hand-authored HTML plus a handful of JSON data files; there is no build step.

## Commands

There is no build/lint/test tooling. To develop locally, serve the repo root over HTTP (not `file://` — partials and JSON are loaded via `fetch()`, which needs a real origin):

```bash
npx serve .
```

`serve.json` defines clean-URL rewrites (`/en` → `/en/index.html`, `/en/courses` → `/en/courses/index.html`, etc.) that only apply when served through `serve`; direct `.html` paths always work too. Sanity-check a change with `curl -o /dev/null -w "%{http_code}" <url>` for each touched page, and `node --check assets/js/main.js` after editing the shared script.

## Deployment

Deploys are **manual** — there is no CI/CD or git-based auto-deploy. After pushing to `main`, the changed files still need to be re-uploaded to Hostinger (File Manager) for the live site to update. Always mention this when finishing a task that touched any file.

Hostinger's CDN caches static assets (`styles.css`, `main.js`, images) for 7 days via `Cache-Control: public, max-age=604800`, independent of browser cache. HTML pages are never cached. **Every time `assets/css/styles.css` or `assets/js/main.js` changes, bump its cache-busting query string** (`?v=N` → `?v=N+1`) across every HTML file that references it, or the CDN/browsers will keep serving the stale file for up to a week:

```bash
grep -rl 'main\.js?v=OLD' --include="*.html" . | xargs sed -i '' 's/main\.js?v=OLD/main.js?v=NEW/g'
```

(Use Python for other bulk find/replace across files — `perl -0pi` has previously mangled Google Fonts URLs by misinterpreting `@` as array interpolation.)

## Git

Commit freely, but **always confirm with the user before `git push`** — pushing is a separate, deliberate step since it's the trigger for the "now re-upload to Hostinger" reminder, not something to bundle silently into every commit.

This sandbox can't auto-detect a git identity, so every commit needs explicit author/committer env vars:

```bash
GIT_AUTHOR_NAME="Kasun Wickramanayake" GIT_AUTHOR_EMAIL="kwickramanayake007@gmail.com" \
GIT_COMMITTER_NAME="Kasun Wickramanayake" GIT_COMMITTER_EMAIL="kwickramanayake007@gmail.com" \
git commit -m "..."
```

## Architecture

**Locale routing:** every page exists twice, once under `/en/` and once under `/si/`, mirroring the same relative path (`en/about.html` ↔ `si/about.html`). `LOCALES` in `assets/js/main.js` is `["en", "si"]`; `currentLocale()` reads the locale from the first path segment. Root `index.html` is a redirect-only stub that sends visitors to their browser-language locale (falling back to English).

**Shared chrome via partials:** the header and footer are not duplicated per page. `partials/{locale}/header.html` and `partials/{locale}/footer.html` are fetched and swapped into `<div id="header-placeholder">` / `<div id="footer-placeholder">` at runtime by `injectPartial()` in `main.js`. Edit nav/footer once per locale, not once per page. The header partials also carry sitewide JSON-LD (`EducationalOrganization`, `WebSite`, `SiteNavigationElement`).

**JSON-driven sections:** several sections are static HTML shells with empty containers (`<div id="course-list">`, `#book-list`, `#video-list`, `#highlights-home-list`/`#highlights-full-list`, `#timeline-list`) that `main.js` populates at runtime by fetching a matching pair of locale-specific JSON files under `assets/data/`:

| Section | Data files | Render entry points in `main.js` |
|---|---|---|
| Courses | `courses.en.json` / `courses.si.json` | `renderCourseList()`, `renderCourseDetail()` |
| Books (store) | `books.en.json` / `books.si.json` | `renderBookList()`, cart functions |
| Videos | `videos.en.json` / `videos.si.json` | `renderVideoList()` |
| Highlights | `highlights.en.json` / `highlights.si.json` | `renderHighlightsHome()`, `renderHighlightsFull()`, `renderHighlightDetail()` |
| Timeline (About page) | `timeline.en.json` / `timeline.si.json` | `renderTimeline()` |

**Adding an item to any of these sections means editing the two JSON files — never creating or editing an HTML file.** Courses and Highlights use a single generic detail-page template per locale (`courses/course.html`, `highlights/highlight.html`) that reads `?slug=` from the URL and looks up the matching JSON entry; there is one template file, not one file per item. Keep the `en`/`si` JSON files structurally parallel (same slugs, same optional fields) — a few entries are intentionally locale-only (e.g. a Sinhala-only course about a Sinhala-language text), which is fine, but don't let the field *shape* drift between locales.

Both `courses.*.json` and `highlights.*.json` support an optional `image` field (cover photo) and, for Highlights, an optional `gallery` array for multi-photo entries (renders as a grid of thumbnails that open full-size in a new tab — no lightbox JS).

**Book store / cart:** `books.*.json` + `main.js`'s cart functions (`getCart`/`saveCart`/`renderCartPanel`/`wireBookCart`) implement a client-side cart in `localStorage` (`csp-cart-v1`). There's no payment processing — checkout builds a pre-filled WhatsApp message (`buildWhatsAppOrderUrl`) to `CART_WHATSAPP_NUMBER` and opens `wa.me`.

**i18n:** `STRINGS` in `main.js` holds UI microcopy (button labels, "not found" messages, etc.) keyed by locale, separate from the page-authored prose in each HTML file. Sinhala content that's draft machine translation is flagged with an HTML comment (`<!-- DRAFT MACHINE TRANSLATION — please have a native Sinhala speaker review -->`) and a visible `.badge-fallback` notice; remove both once a native speaker signs off on that specific page.

**SEO:** every static page carries canonical/hreflang (`en`/`si`/`x-default`), Open Graph, Twitter Card, and `BreadcrumbList` JSON-LD tags, all pointing at `https://csp.lk`. Course and Highlight detail pages set these dynamically in JS (`setDynamicSeo()`, `setCourseStructuredData()`, `setBreadcrumbJsonLd()`) once their slug's content loads, since the template HTML has no page-specific content to derive them from statically. `sitemap.xml` and `robots.txt` live at the repo root and need the same domain-consistency treatment if the domain ever changes again.

**Styling:** one stylesheet, `assets/css/styles.css`, no preprocessor, using CSS custom properties for the design system (warm ivory/charcoal/forest-green "editorial" palette — see tokens at the top of the file). Photography is unified across sources via a shared CSS filter (`grayscale(0.3) sepia(0.12) contrast(1.05)` for most photos, a darker variant for text-over-photo banners) rather than picking visually-matched stock photos.
