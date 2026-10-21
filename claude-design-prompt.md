You are designing for the Colombo School of Philosophy (CSP), a Sri Lankan non-profit educational organization. Use the following as full context before proposing or generating any design.

## Mission & purpose
CSP exists to make philosophical thinking accessible and popular in Sri Lanka — not confined to academia — through courses, talks, publications, and community discussion, in English and Sinhala, open to anyone regardless of background or prior training. Founded informally in 2012 as a University of Colombo study circle; formally organized as CSP in 2024. Registered non-profit under the Societies Ordinance.

## Audience & tone
Curious general public plus serious students of philosophy — bilingual (English/Sinhala). Tone is calm, intellectually serious, "quiet confidence" — minimalist editorial style like philosophy journals, prestigious universities, and museums. Not corporate, not flashy, not tourist-Sri-Lanka imagery. International/universal feel rather than local-cliché visuals.

## Tech constraints
Plain HTML/CSS/vanilla JS, no framework, no build step, no backend/database. Folder-per-locale (`/en/`, `/si/`), shared header/footer injected at runtime, one shared stylesheet. Content for list-type sections (courses, books, highlights, videos, timeline) is JSON-driven — adding an item means adding one JSON object, never a new HTML file. Any new design should respect this pattern: structural templates + data files, not one-off hand-built pages.

## Current site structure (for reference / consistency)
- Home — mission statement, rotating "Features" carousel, YouTube embed, pull-quote CTA into Courses
- About — long-form essay, history, a visual timeline with lightbox, a translated interview excerpt
- Courses — filterable accordion list + one generic detail template driven by `?slug=`
- Our Publications (Books) — catalog + client-side cart that builds a WhatsApp checkout message (manual bank-deposit payment, no online checkout)
- Features (Highlights) — news/activity feed, YouTube-timestamped
- Videos — flat list of embedded talks
- Donate — static page with bank details
- Contact — email, location, social links
- Forum — external link, separate system

## Design system (current — follow unless explicitly asked to change it)
**Palette (warm editorial: ivory/charcoal + deep forest green + bronze accent):**
- `--color-ink` #2A2823 — text, dark photo bands
- `--color-parchment` #F4EFE1 — page background
- `--color-surface` #ECE4D3 — panels/chips
- `--color-accent` #33493B — buttons, links, active states
- `--color-accent-dark` #22322A — hover
- `--color-accent-secondary` #6E6B45 — reserved, unused for text (low contrast)
- `--color-bronze` #9C7A4E — pull-quote border, active-nav underline
- `--color-muted` #6B665C — secondary text
- `--color-border` #DDD3BC — hairlines

**Typography:** Literata (serif, headings) + Work Sans (sans, body/UI); Noto Serif/Sans Sinhala fallbacks for the `si` locale.

**Layout:** `max-width: 72rem`, minimal border-radius (3px), hairline dividers, asymmetric editorial grid. Deliberately minimal — avoid rounded-shadow cards, pill buttons, ALL-CAPS eyebrows, arrow-suffixed buttons, or any generic "AI startup" look.

**Imagery:** real curated photography (classical sculpture, books/manuscripts/libraries, light-and-shadow), never stock-corporate or Sri-Lanka-tourist imagery. Unify mixed photo sources with a consistent CSS filter so they read as one cohesive, muted, archival palette:
- hero/paired images: `grayscale(0.3) sepia(0.12) contrast(1.05)`
- dark banner-behind-text images: `grayscale(0.45) sepia(0.1) contrast(1.1) brightness(0.5)`

**Key existing components to reuse or extend:** `.hero-editorial`/`.hero-photo`, `.manuscript-band`/`.banner-photo`, `.section`/`.section-heading`, `.quote-band`/`.pull-quote`, `.entry-list`/`.entry-row`/`.entry-accordion`, `.filter-pills`/`.filter-pill`, `.timeline`/`.timeline-item` + lightbox, `.carousel`, `.book-grid`/`.book-card`, `.cart-panel`, `.video-list`, `.badge-fallback`, `.floating-whatsapp`, `.footer-colophon` (bilingual EN/SI name stack).

## Content/data shapes (JSON)
- Course: `slug, category, categoryLabel, title, summary, duration, format, startDate, startTime, location, mapUrl, fee, description[], image`
- Book: `slug, title, subtitle, author, price, image`
- Highlight: `slug, title, description, date, dateLabel, youtubeId, start, body[]`
- Video: `slug, title, youtubeId, start`
- Timeline entry: `year, title, description, image`

## Integrations already in place
WhatsApp (floating chat button + cart checkout), Facebook/YouTube social links, Google Maps (plain URL, no API key), GA4 analytics, bilingual EN/SI throughout, manual bank-deposit payment flow (no payment gateway).

## Explicitly out of scope
Event registration, user accounts, online checkout/payment gateway — any future transactional feature should be designed as a separate addition, not a rework of the static content.

---

Task: [describe the new page/template/section you want designed here]
