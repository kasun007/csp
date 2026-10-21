/**
 * CSP site — shared behaviour: partial injection, mobile nav,
 * locale switcher, JSON-driven rendering (courses, books,
 * highlights, videos, timeline, blog) and small UI widgets
 * (filters, carousel, lightbox, cart). Exposed as window.CSP.
 *
 * Pages must be served over http(s) (e.g. `npx serve`), not
 * opened via file://, since fetch() needs a real origin.
 */

const LOCALES = ["en", "si"];
const SITE_URL = "https://csp.lk";
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/brand/favicon-512.png?v=2`;
const CART_WHATSAPP_NUMBER = "94712760993";
const ENROL_WHATSAPP_NUMBER = "94710561317";
const POSTAGE_PER_BOOK = 300;
const CART_STORAGE_KEY = "csp-cart-v2";
const CART_ADDRESS_KEY = "csp-cart-address-v2";

const STRINGS = {
  en: {
    notFound: "Course not found.",
    backToCourses: "All courses",
    starts: "Starts",
    viewOnMap: "View on map",
    readMore: "Read more",
    viewFullPage: "View full page",
    enrolWhatsapp: "Enrol on WhatsApp",
    instructor: "Instructor",
    fee: "Fee",
    duration: "Duration",
    format: "Format",
    location: "Location",
    currency: "Rs.",
    addToCart: "Add to cart",
    addedToCart: "Added to cart",
    decreaseQty: "Decrease quantity",
    increaseQty: "Increase quantity",
    cartTitle: "Your cart",
    cartEmpty: "Your cart is empty.",
    cartRemove: "Remove",
    cartPostage: "Postage fee",
    cartTotal: "Total",
    cartAddressLabel: "Delivery address",
    cartAddressPlaceholder: "Enter your delivery address",
    cartAddressPending: "(I'll add my delivery address in this chat)",
    cartCheckout: "Checkout on WhatsApp",
    cartBankNote: "Payment is by bank deposit, confirmed on WhatsApp — there is no online checkout.",
    cartWhatsappGreeting: "Hi CSP, I'd like to order the following books:",
    cartWhatsappPostage: "Postage fee",
    cartWhatsappTotal: "Total",
    cartWhatsappAddress: "Delivery address",
    cartWhatsappClosing: "Payment slip and delivery address attached.",
    highlightsLatestBadge: "Latest",
    highlightsViewAll: "View all features",
    highlightsBack: "All features",
    highlightsNotFound: "Feature not found.",
    highlightsExternalLink: "Read the full article",
    blogBack: "All articles",
    blogNotFound: "Article not found.",
    blogNextArticle: "Next article",
    blogReadArticle: "Read the article",
    readingTime: (n) => `${n} min read`,
    visitorCountSuffix: "visits",
    menu: "Menu",
    filterAll: "All",
  },
  si: {
    notFound: "පාඨමාලාව හමු නොවීය.",
    backToCourses: "සියලු පාඨමාලා",
    starts: "ආරම්භය",
    viewOnMap: "සිතියමේ බලන්න",
    readMore: "වැඩිදුර කියවන්න",
    viewFullPage: "සම්පූර්ණ පිටුව බලන්න",
    enrolWhatsapp: "WhatsApp හරහා ලියාපදිංචි වන්න",
    instructor: "පාඨමාලාව මෙහෙයවීම",
    fee: "ලියාපදිංචි ගාස්තුව",
    duration: "කාලසීමාව",
    format: "ආකාරය",
    location: "ස්ථානය",
    currency: "රු.",
    addToCart: "පොත් මල්ලට එකතු කරන්න",
    addedToCart: "පොත් මල්ලට එකතු විය",
    decreaseQty: "ප්‍රමාණය අඩු කරන්න",
    increaseQty: "ප්‍රමාණය වැඩි කරන්න",
    cartTitle: "ඔබේ පොත් මල්ල",
    cartEmpty: "පොත් මල්ල හිස්.",
    cartRemove: "ඉවත් කරන්න",
    cartPostage: "තැපැල් ගාස්තුව",
    cartTotal: "එකතුව",
    cartAddressLabel: "බෙදාහැරීමේ ලිපිනය",
    cartAddressPlaceholder: "ඔබේ බෙදාහැරීමේ ලිපිනය ඇතුළත් කරන්න",
    cartAddressPending: "(මම මගේ ලිපිනය මෙම සංවාදයට එක් කරන්නෙමි)",
    cartCheckout: "WhatsApp හරහා ඇණවුම කරන්න",
    cartBankNote: "ගෙවීම බැංකු තැන්පතුවක් මගින් සිදු කර, WhatsApp හරහා තහවුරු කරනු ලැබේ — අන්තර්ජාල ගෙවීමක් නොමැත.",
    cartWhatsappGreeting: "ආයුබෝවන් CSP, මට පහත පොත් ඇණවුම් කිරීමට අවශ්‍යයි:",
    cartWhatsappPostage: "තැපැල් ගාස්තුව",
    cartWhatsappTotal: "එකතුව",
    cartWhatsappAddress: "බෙදාහැරීමේ ලිපිනය",
    cartWhatsappClosing: "මම මගේ ගෙවීම් රිසිට් පත සහ ලිපිනය මෙම සංවාදයට අමුණන්නෙමි.",
    highlightsLatestBadge: "නවතම",
    highlightsViewAll: "සියලුම විශේෂාංග බලන්න",
    highlightsBack: "සියලුම විශේෂාංග",
    highlightsNotFound: "විශේෂාංගය හමු නොවීය.",
    highlightsExternalLink: "සම්පූර්ණ ලිපිය කියවන්න",
    blogBack: "සියලුම ලිපි",
    blogNotFound: "ලිපිය හමු නොවීය.",
    blogNextArticle: "මීළඟ ලිපිය",
    blogReadArticle: "ලිපිය කියවන්න",
    readingTime: (n) => `මිනිත්තු ${n} කියවීම`,
    visitorCountSuffix: "පිවිසුම්",
    menu: "මෙනුව",
    filterAll: "සියල්ල",
  },
};

function currentLocale() {
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(seg) ? seg : "en";
}

function strings() {
  return STRINGS[currentLocale()] || STRINGS.en;
}

async function injectPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  const res = await fetch(url);
  if (!res.ok) return;
  el.outerHTML = await res.text();
}

function markCurrentNav(extraMatches) {
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".site-nav a[href]").forEach((link) => {
    let linkPath;
    try {
      linkPath = new URL(link.href).pathname.replace(/\/index\.html$/, "/");
    } catch {
      return;
    }
    const matches = linkPath === path || (extraMatches && extraMatches.includes(linkPath));
    if (matches) link.setAttribute("aria-current", "page");
  });
}

function wireMobileNavToggle() {
  const toggle = document.querySelector(".site-nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function wireLocaleSwitcher() {
  const locale = currentLocale();
  document.querySelectorAll(".locale-switcher a[data-locale]").forEach((link) => {
    const targetLocale = link.dataset.locale;
    if (targetLocale === locale) link.classList.add("active");
    const parts = window.location.pathname.split("/").filter(Boolean);
    parts[0] = targetLocale;
    link.href = "/" + parts.join("/");
  });
}

function upsertMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkTag(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setDynamicSeo({ title, description, path, image }) {
  const url = `${SITE_URL}${path}`;
  document.title = title;
  upsertLinkTag("canonical", url);
  upsertMetaTag("name", "description", description);
  upsertMetaTag("property", "og:title", title);
  upsertMetaTag("property", "og:description", description);
  upsertMetaTag("property", "og:url", url);
  upsertMetaTag("property", "og:image", image || DEFAULT_OG_IMAGE);
  upsertMetaTag("name", "twitter:title", title);
  upsertMetaTag("name", "twitter:description", description);
  upsertMetaTag("name", "twitter:image", image || DEFAULT_OG_IMAGE);
}

function setJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function setCourseStructuredData(course, locale) {
  setJsonLd("course-structured-data", {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    provider: { "@type": "EducationalOrganization", name: "Colombo School of Philosophy", sameAs: SITE_URL },
    inLanguage: locale,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: course.format,
      startDate: course.startDate,
      location: { "@type": "Place", name: course.location },
    },
  });
}

function setBreadcrumbJsonLd(items) {
  setJsonLd("breadcrumb-structured-data", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  });
}

/* ================= FilterPills (generic) ================= */
function initFilters(chips, list) {
  if (!chips || !list) return;
  const items = list.querySelectorAll("[data-category]");
  const pills = chips.querySelectorAll(".filter-pill");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.setAttribute("aria-pressed", "false"));
      pill.setAttribute("aria-pressed", "true");
      const filter = pill.dataset.filter;
      items.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.style.display = show ? "" : "none";
      });
    });
  });
}

/* ================= Carousel (generic, numbered tabs) ================= */
function initCarousel(root) {
  if (!root) return;
  const slides = Array.from(root.querySelectorAll(".carousel__slide"));
  if (slides.length === 0) return;
  let tabs = root.querySelector(".carousel__tabs");
  if (!tabs) {
    tabs = document.createElement("div");
    tabs.className = "carousel__tabs";
    root.insertBefore(tabs, root.firstChild);
  }
  tabs.innerHTML = slides
    .map((_, i) => `<button type="button" class="carousel__tab" data-index="${i}" role="tab" aria-selected="false">${String(i + 1).padStart(2, "0")}</button>`)
    .join("");

  const tabEls = Array.from(tabs.querySelectorAll(".carousel__tab"));

  function show(index) {
    const next = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.setAttribute("data-active", String(i === next)));
    tabEls.forEach((tab, i) => tab.setAttribute("aria-selected", String(i === next)));
  }

  tabEls.forEach((tab, i) => {
    tab.addEventListener("click", () => show(i));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") show(i + 1);
      if (event.key === "ArrowLeft") show(i - 1);
    });
  });

  show(0);
}

/* ================= Lightbox (generic, data-lightbox-src) ================= */
function initLightbox(root, box) {
  if (!root || !box) return;
  const openers = Array.from(root.querySelectorAll("[data-lightbox-src]"));
  if (openers.length === 0) return;

  const imageEl = box.querySelector(".lightbox-image");
  const yearEl = box.querySelector(".lightbox-year");
  const titleEl = box.querySelector(".lightbox-title");
  const descriptionEl = box.querySelector(".lightbox-description");
  let currentIndex = 0;
  let lastFocused = null;

  function show(index) {
    currentIndex = (index + openers.length) % openers.length;
    const opener = openers[currentIndex];
    imageEl.src = opener.dataset.lightboxSrc;
    imageEl.alt = opener.dataset.lightboxAlt || "";
    if (yearEl) yearEl.textContent = opener.dataset.lightboxYear || "";
    if (titleEl) titleEl.textContent = opener.dataset.lightboxTitle || "";
    if (descriptionEl) descriptionEl.textContent = opener.dataset.lightboxCaption || "";
  }

  function open(index, trigger) {
    lastFocused = trigger || document.activeElement;
    show(index);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close")?.focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  openers.forEach((opener, i) => {
    opener.addEventListener("click", (event) => {
      event.preventDefault();
      open(i, opener);
    });
  });

  box.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", close));
  box.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => show(currentIndex - 1));
  box.querySelector("[data-lightbox-next]")?.addEventListener("click", () => show(currentIndex + 1));
  box.querySelector(".lightbox-backdrop")?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });
}

/* ================= Courses ================= */
function factsListHTML(course, s) {
  const facts = [
    [s.duration, course.duration],
    [s.format, course.format],
    [s.starts, `${course.startDate} · ${course.startTime}`],
    [s.location, course.location],
  ];
  if (course.instructor) facts.push([s.instructor, course.instructor]);
  if (course.fee) facts.push([s.fee, course.fee]);
  return `<ul class="facts-list">${facts.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join("")}</ul>`;
}

function courseAccordionHTML(course, locale) {
  const s = strings();
  const detailHref = `/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}`;
  return `
    <details class="entry-accordion" data-category="${course.category}">
      <summary class="entry-summary">
        <span class="entry-row__meta">
          <span class="entry-row__meta-label">${course.categoryLabel}</span>
        </span>
        <span>
          <span class="entry-row__title">${course.title}</span>
          <p class="entry-row__summary">${course.summary}</p>
        </span>
        <span class="entry-summary__toggle" aria-hidden="true"></span>
      </summary>
      <div class="entry-accordion-details">
        <div class="entry-pills">
          <span class="entry-pill">${course.duration}</span>
          <span class="entry-pill">${course.format}</span>
        </div>
        ${course.image ? `<img class="entry-poster" src="${course.image}" alt="${course.title}">` : ""}
        ${course.description.slice(0, 1).map((p) => `<p>${p}</p>`).join("")}
        ${factsListHTML(course, s)}
        <p>
          <a class="text-link" href="${detailHref}">${s.viewFullPage}</a>
        </p>
      </div>
    </details>`;
}

async function renderCourseList() {
  const list = document.getElementById("course-list");
  if (!list) return;
  const locale = currentLocale();
  const s = strings();

  const res = await fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const courses = await res.json();

  const filters = document.getElementById("course-filters");
  if (filters) {
    const seen = new Set();
    const categories = [{ category: "all", label: s.filterAll }];
    courses.forEach((course) => {
      if (!seen.has(course.category)) {
        seen.add(course.category);
        categories.push({ category: course.category, label: course.categoryLabel });
      }
    });
    filters.innerHTML = categories
      .map((c, i) => `<button type="button" class="filter-pill" data-filter="${c.category}" aria-pressed="${i === 0}">${c.label}</button>`)
      .join("");
  }

  list.innerHTML = courses.map((course) => courseAccordionHTML(course, locale)).join("");
  initFilters(filters, list);
}

async function renderCourseDetail() {
  const el = document.getElementById("course-detail");
  if (!el) return;
  const locale = currentLocale();
  const s = strings();
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/courses/index.html`;

  const res = await fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" });
  const courses = res.ok ? await res.json() : [];
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    el.innerHTML = `<p>${s.notFound}</p><p><a href="${backHref}">${s.backToCourses}</a></p>`;
    return;
  }

  setDynamicSeo({
    title: `${course.title} — Colombo School of Philosophy`,
    description: course.summary,
    path: `/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}`,
    image: course.image ? `${SITE_URL}${course.image}` : undefined,
  });
  setCourseStructuredData(course, locale);
  setBreadcrumbJsonLd([
    { name: locale === "si" ? "මුල් පිටුව" : "Home", path: `/${locale}/index.html` },
    { name: locale === "si" ? "පාඨමාලා" : "Courses", path: `/${locale}/courses/index.html` },
    { name: course.title, path: `/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}` },
  ]);

  const enrolMessage = encodeURIComponent(
    locale === "si"
      ? `ආයුබෝවන් CSP, මට "${course.title}" පාඨමාලාවට ලියාපදිංචි වීමට අවශ්‍යයි.`
      : `Hi CSP, I'd like to enrol in "${course.title}".`
  );

  el.innerHTML = `
    <div class="page-hero container">
      <span class="tag">${course.categoryLabel}</span>
      <h1>${course.title}</h1>
      <p class="lead">${course.summary}</p>
    </div>
    <div class="container split-layout">
      <div class="essay-body">
        ${course.description.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
      <div class="split-layout__sticky">
        ${course.image ? `<div class="detail-photo"><img src="${course.image}" alt="${course.title}"></div>` : ""}
        <div class="info-card">
          <div class="info-card__panel">
            ${factsListAsDlHTML(course, s)}
          </div>
        </div>
        <p style="margin-top: var(--space-6);">
          <a class="button" href="https://wa.me/${ENROL_WHATSAPP_NUMBER}?text=${enrolMessage}" target="_blank" rel="noopener noreferrer">${s.enrolWhatsapp}</a>
        </p>
        <p><a href="${course.mapUrl}" target="_blank" rel="noopener noreferrer" class="text-link">${s.viewOnMap}</a></p>
      </div>
    </div>
    <div class="container"><p><a href="${backHref}">${s.backToCourses}</a></p></div>`;
}

function factsListAsDlHTML(course, s) {
  const facts = [
    [s.duration, course.duration],
    [s.format, course.format],
    [s.starts, `${course.startDate} · ${course.startTime}`],
    [s.location, course.location],
  ];
  if (course.instructor) facts.push([s.instructor, course.instructor]);
  if (course.fee) facts.push([s.fee, course.fee]);
  return `<dl>${facts.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}</dl>`;
}

/* ================= Books + Cart ================= */
function bookCardHTML(book, locale) {
  const s = strings();
  return `
    <div class="book-card" data-slug="${book.slug}">
      <div class="book-card__panel">
        <div class="book-cover">
          ${book.image ? `<img src="${book.image}" alt="${book.title}">` : `<div class="badge-fallback">${book.title.charAt(0)}</div>`}
        </div>
        <h3>${book.title}</h3>
        ${book.subtitle ? `<p class="book-subtitle">${book.subtitle}</p>` : ""}
        <p class="meta">${book.author}</p>
        <p class="book-price">${s.currency} ${Number(book.price).toLocaleString("en-LK")}</p>
        <div class="book-card__add">
          <button type="button" class="button button--small" data-add="${book.slug}">${s.addToCart}</button>
        </div>
      </div>
    </div>`;
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* localStorage unavailable */
  }
}

function getCartAddress() {
  try {
    return localStorage.getItem(CART_ADDRESS_KEY) || "";
  } catch {
    return "";
  }
}

function saveCartAddress(address) {
  try {
    localStorage.setItem(CART_ADDRESS_KEY, address);
  } catch {
    /* localStorage unavailable */
  }
}

function setCartQty(slug, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[slug];
  else cart[slug] = qty;
  saveCart(cart);
  updateHeaderCartCount();
  return cart;
}

function cartCount() {
  return Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
}

function updateHeaderCartCount() {
  const el = document.getElementById("header-cart-count");
  if (el) el.textContent = String(cartCount());
}

function cartLineItems(books, cart) {
  return Object.entries(cart)
    .map(([slug, qty]) => {
      const book = books.find((b) => b.slug === slug);
      if (!book) return null;
      return { slug, title: book.title, price: book.price, qty, subtotal: book.price * qty };
    })
    .filter(Boolean);
}

function buildWhatsAppOrderUrl(items, postage, total, address, locale) {
  const s = STRINGS[locale] || STRINGS.en;
  const addressLine = address.trim() || s.cartAddressPending;
  const lines = [
    s.cartWhatsappGreeting,
    "",
    ...items.map((item) => `- ${item.title} x${item.qty} — ${s.currency} ${item.subtotal.toLocaleString("en-LK")}`),
    "",
    `${s.cartWhatsappPostage}: ${s.currency} ${postage.toLocaleString("en-LK")}`,
    `${s.cartWhatsappTotal}: ${s.currency} ${total.toLocaleString("en-LK")}`,
    "",
    `${s.cartWhatsappAddress}: ${addressLine}`,
    "",
    s.cartWhatsappClosing,
  ];
  return `https://wa.me/${CART_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function cartItemRowHTML(item, s) {
  return `
    <div class="cart-item" data-slug="${item.slug}">
      <span class="cart-item-title">${item.title}</span>
      <span class="qty-stepper" data-slug="${item.slug}">
        <button type="button" class="qty-btn qty-decrease" aria-label="${s.decreaseQty}">&minus;</button>
        <span class="qty-value">${item.qty}</span>
        <button type="button" class="qty-btn qty-increase" aria-label="${s.increaseQty}">+</button>
      </span>
      <span class="cart-item-subtotal">${s.currency} ${item.subtotal.toLocaleString("en-LK")}</span>
      <button type="button" class="cart-item-remove" data-slug="${item.slug}">${s.cartRemove}</button>
    </div>`;
}

function renderCartPanel(books, locale) {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  const s = strings();
  const cart = getCart();
  const items = cartLineItems(books, cart);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const bookCount = items.reduce((sum, item) => sum + item.qty, 0);
  const postage = bookCount * POSTAGE_PER_BOOK;
  const total = subtotal + postage;

  if (items.length === 0) {
    panel.innerHTML = `<h2>${s.cartTitle}</h2><p class="cart-empty">${s.cartEmpty}</p>`;
    return;
  }

  const address = getCartAddress();

  panel.innerHTML = `
    <h2>${s.cartTitle}</h2>
    <div class="cart-items">${items.map((item) => cartItemRowHTML(item, s)).join("")}</div>
    <div class="cart-postage"><span>${s.cartPostage}</span><span>${s.currency} ${postage.toLocaleString("en-LK")}</span></div>
    <div class="cart-total"><span>${s.cartTotal}</span><span>${s.currency} ${total.toLocaleString("en-LK")}</span></div>
    <div class="cart-address">
      <label for="cart-address-input">${s.cartAddressLabel}</label>
      <textarea id="cart-address-input" rows="2" placeholder="${s.cartAddressPlaceholder}">${address}</textarea>
    </div>
    <button type="button" class="button cart-checkout-btn" id="cart-checkout-btn">${s.cartCheckout}</button>
    <p class="cart-bank-note">${s.cartBankNote}</p>`;

  panel.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const stepper = btn.closest(".qty-stepper");
      const slug = stepper.dataset.slug;
      const current = getCart()[slug] || 0;
      const next = btn.classList.contains("qty-increase") ? current + 1 : Math.max(0, current - 1);
      setCartQty(slug, next);
      renderCartPanel(books, locale);
    });
  });

  panel.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCartQty(btn.dataset.slug, 0);
      renderCartPanel(books, locale);
    });
  });

  const addressInput = document.getElementById("cart-address-input");
  addressInput.addEventListener("input", () => saveCartAddress(addressInput.value));

  document.getElementById("cart-checkout-btn").addEventListener("click", () => {
    const url = buildWhatsAppOrderUrl(items, postage, total, addressInput.value, locale);
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function showToast(message) {
  let toast = document.getElementById("csp-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "csp-toast";
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "6.5rem";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "var(--color-ink)";
    toast.style.color = "var(--color-paper)";
    toast.style.padding = "0.75rem 1.5rem";
    toast.style.borderRadius = "var(--radius-pill)";
    toast.style.fontSize = "0.875rem";
    toast.style.zIndex = "95";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 1600);
}

function wireBookCart(list, books, locale) {
  const s = strings();
  list.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-add]");
    if (!btn) return;
    const slug = btn.dataset.add;
    const current = getCart()[slug] || 0;
    setCartQty(slug, current + 1);
    renderCartPanel(books, locale);
    showToast(s.addedToCart);
  });
}

async function renderBookList() {
  const list = document.getElementById("book-list");
  if (!list) return;
  const locale = currentLocale();

  const res = await fetch(`/assets/data/books.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const books = await res.json();

  list.innerHTML = books.map((book) => bookCardHTML(book, locale)).join("");
  wireBookCart(list, books, locale);
  renderCartPanel(books, locale);
}

/* ================= Videos ================= */
function videoThumbHTML(video) {
  const href = `https://www.youtube.com/watch?v=${video.youtubeId}${video.start ? `&t=${video.start}s` : ""}`;
  const thumb = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  return `
    <div class="video-card">
      <h3>${video.title}</h3>
      <a class="video-thumb" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${video.title}">
        <img src="${thumb}" alt="" loading="lazy">
        <span class="video-thumb__play" aria-hidden="true"></span>
      </a>
    </div>`;
}

async function renderVideoList() {
  const list = document.getElementById("video-list");
  if (!list) return;
  const locale = currentLocale();

  const res = await fetch(`/assets/data/videos.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const videos = await res.json();

  list.innerHTML = videos.map((video) => videoThumbHTML(video)).join("");
}

/* ================= Highlights ================= */
function sortHighlightsByDateDesc(items) {
  return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function fetchHighlights(locale) {
  const res = await fetch(`/assets/data/highlights.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return [];
  return sortHighlightsByDateDesc(await res.json());
}

function highlightMediaHTML(item, className) {
  if (item.youtubeId) {
    const src = `https://www.youtube.com/embed/${item.youtubeId}${item.start ? `?start=${item.start}` : ""}`;
    return `<div class="${className} ${className}--video"><iframe src="${src}" title="${item.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="lazy" allowfullscreen></iframe></div>`;
  }
  if (item.image) {
    return `<div class="${className}"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>`;
  }
  return `<div class="${className}"><div class="badge-fallback">${item.title.charAt(0)}</div></div>`;
}

function highlightCardHTML(item, locale, isLead) {
  const s = strings();
  const href = `/${locale}/highlights/highlight.html?slug=${encodeURIComponent(item.slug)}`;
  return `
    <a class="highlight-card${isLead ? " highlight-card--lead" : ""}" href="${href}">
      <div class="highlight-card__panel">
        ${highlightMediaHTML(item, "highlight-image")}
        <div class="highlight-body">
          <span class="highlight-date">${item.dateLabel || item.date}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <span class="text-link">${s.readMore}</span>
        </div>
      </div>
    </a>`;
}

function highlightCarouselSlideHTML(item, locale) {
  const s = strings();
  const href = `/${locale}/highlights/highlight.html?slug=${encodeURIComponent(item.slug)}`;
  return `
    <article class="carousel__slide">
      <div class="carousel__media">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.title}">`
            : item.youtubeId
            ? `<img src="https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg" alt="${item.title}">`
            : `<div class="badge-fallback">${item.title.charAt(0)}</div>`
        }
      </div>
      <div>
        <span class="tag">${item.dateLabel || item.date}</span>
        <h3 class="carousel__title">${item.title}</h3>
        <p>${item.description}</p>
        <a class="text-link" href="${href}">${s.readMore}</a>
      </div>
    </article>`;
}

/* ================= Scroll-triggered box reveal ================= */
const REVEAL_SELECTORS = [
  ".feature-card",
  ".topic-card",
  ".carousel__slide",
  ".blog-card",
  ".book-card",
  ".entry-accordion",
  ".entry-row",
  ".highlight-card",
  ".video-card",
  ".timeline-item",
  ".step",
  ".info-card",
];

function wireReveal(selector, { stagger = 70 } = {}) {
  const items = Array.from(document.querySelectorAll(selector));
  if (items.length === 0) return;
  items.forEach((el) => el.classList.add("reveal"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const index = items.indexOf(el);
        el.style.transitionDelay = `${(index % 4) * stagger}ms`;
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

function wireReveals() {
  REVEAL_SELECTORS.forEach((selector) => wireReveal(selector));
}

async function renderHighlightsHome() {
  const track = document.getElementById("highlights-home-list");
  if (!track) return;
  const locale = currentLocale();
  const items = await fetchHighlights(locale);

  track.innerHTML = items.map((item) => highlightCarouselSlideHTML(item, locale)).join("");
  initCarousel(document.getElementById("highlights-carousel"));
}

async function renderHighlightsFull() {
  const list = document.getElementById("highlights-full-list");
  if (!list) return;
  const locale = currentLocale();
  const items = await fetchHighlights(locale);

  list.innerHTML = items.map((item, index) => highlightCardHTML(item, locale, index === 0)).join("");
}

async function renderHighlightDetail() {
  const el = document.getElementById("highlight-detail");
  if (!el) return;
  const locale = currentLocale();
  const s = strings();
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/highlights/index.html`;

  const items = await fetchHighlights(locale);
  const item = items.find((h) => h.slug === slug);

  if (!item) {
    el.innerHTML = `<p>${s.highlightsNotFound}</p><p><a href="${backHref}">${s.highlightsBack}</a></p>`;
    return;
  }

  setDynamicSeo({
    title: `${item.title} — Colombo School of Philosophy`,
    description: item.description,
    path: `/${locale}/highlights/highlight.html?slug=${encodeURIComponent(item.slug)}`,
    image: item.image ? `${SITE_URL}${item.image}` : undefined,
  });
  setBreadcrumbJsonLd([
    { name: locale === "si" ? "මුල් පිටුව" : "Home", path: `/${locale}/index.html` },
    { name: locale === "si" ? "විශේෂාංග" : "Features", path: `/${locale}/highlights/index.html` },
    { name: item.title, path: `/${locale}/highlights/highlight.html?slug=${encodeURIComponent(item.slug)}` },
  ]);

  const galleryItems = item.gallery
    ? item.gallery
        .map(
          (src, i) =>
            `<img data-lightbox-src="${src}" data-lightbox-alt="${item.title}" data-lightbox-title="${item.title}" src="${src}" alt="${item.title}" loading="lazy">`
        )
        .join("")
    : "";

  el.innerHTML = `
    ${highlightMediaHTML(item, "detail-photo")}
    <h1>${item.title}</h1>
    <p class="meta">${item.dateLabel || item.date}</p>
    ${item.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    ${galleryItems ? `<div class="highlight-gallery">${galleryItems}</div>` : ""}
    ${item.externalUrl ? `<p><a href="${item.externalUrl}" target="_blank" rel="noopener noreferrer">${s.highlightsExternalLink}</a></p>` : ""}
    <p><a href="${backHref}">${s.highlightsBack}</a></p>`;

  if (item.gallery) {
    initLightbox(el, document.getElementById("lightbox"));
  }
}

/* ================= Timeline ================= */
function timelineItemHTML(item, index) {
  if (item.closing) {
    return `
      <li class="timeline-item timeline-item--closing">
        <div class="timeline-content">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </li>`;
  }
  return `
    <li class="timeline-item">
      <span class="timeline-year">${item.year}</span>
      <div class="timeline-content">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      ${
        item.image
          ? `<button type="button" class="timeline-image-btn" data-lightbox-src="${item.image}" data-lightbox-alt="${item.title}" data-lightbox-year="${item.year}" data-lightbox-title="${item.title}" data-lightbox-caption="${item.description}">
              <img src="${item.image}" alt="${item.title}" loading="lazy">
            </button>`
          : ""
      }
    </li>`;
}

async function renderTimeline() {
  const list = document.getElementById("timeline-list");
  if (!list) return;
  const locale = currentLocale();

  const res = await fetch(`/assets/data/timeline.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const items = await res.json();

  list.innerHTML = items.map((item, index) => timelineItemHTML(item, index)).join("");
  initLightbox(list, document.getElementById("lightbox"));
}

/* ================= Blog ================= */
function wordsCount(body) {
  return body.join(" ").split(/\s+/).filter(Boolean).length;
}

function readingTime(body) {
  return Math.max(1, Math.ceil(wordsCount(body) / 180));
}

function blogCardHTML(post, locale, isLead) {
  const s = strings();
  const href = `/${locale}/blog/post.html?slug=${encodeURIComponent(post.slug)}`;
  return `
    <a class="blog-card${isLead ? " blog-card--lead" : ""}" href="${href}" data-category="${post.category}">
      <div class="blog-card__panel">
        <div class="blog-card__photo">
          ${post.image ? `<img src="${post.image}" alt="${post.title}">` : `<div class="badge-fallback">${post.title.charAt(0)}</div>`}
        </div>
        <div>
          <div class="blog-card__meta">
            <span class="blog-card__category">${post.categoryLabel || post.category}</span>
            <span>${s.readingTime(readingTime(post.body))}</span>
          </div>
          <h3 class="blog-card__title">${post.title}</h3>
          <p class="blog-card__excerpt">${post.excerpt}</p>
          <span class="text-link">${s.blogReadArticle}</span>
        </div>
      </div>
    </a>`;
}

async function fetchBlogPosts(locale) {
  const res = await fetch(`/assets/data/blog.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function renderBlogList() {
  const list = document.getElementById("blog-list");
  if (!list) return;
  const locale = currentLocale();
  const s = strings();
  const posts = await fetchBlogPosts(locale);

  const filters = document.getElementById("blog-filters");
  if (filters) {
    const seen = new Set();
    const categories = [{ category: "all", label: s.filterAll }];
    posts.forEach((post) => {
      if (!seen.has(post.category)) {
        seen.add(post.category);
        categories.push({ category: post.category, label: post.categoryLabel || post.category });
      }
    });
    filters.innerHTML = categories
      .map((c, i) => `<button type="button" class="filter-pill" data-filter="${c.category}" aria-pressed="${i === 0}">${c.label}</button>`)
      .join("");
  }

  list.innerHTML = posts.map((post, index) => blogCardHTML(post, locale, index === 0)).join("");
  initFilters(filters, list);
}

async function renderBlogPost() {
  const el = document.getElementById("blog-post");
  if (!el) return;
  const locale = currentLocale();
  const s = strings();
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/blog/index.html`;

  const posts = await fetchBlogPosts(locale);
  const index = posts.findIndex((p) => p.slug === slug);
  const post = posts[index];

  if (!post) {
    el.innerHTML = `<p>${s.blogNotFound}</p><p><a href="${backHref}">${s.blogBack}</a></p>`;
    return;
  }

  setDynamicSeo({
    title: `${post.title} — Colombo School of Philosophy`,
    description: post.excerpt,
    path: `/${locale}/blog/post.html?slug=${encodeURIComponent(post.slug)}`,
    image: post.image ? `${SITE_URL}${post.image}` : undefined,
  });
  setBreadcrumbJsonLd([
    { name: locale === "si" ? "මුල් පිටුව" : "Home", path: `/${locale}/index.html` },
    { name: locale === "si" ? "බ්ලොගය" : "Blog", path: `/${locale}/blog/index.html` },
    { name: post.title, path: `/${locale}/blog/post.html?slug=${encodeURIComponent(post.slug)}` },
  ]);

  const next = posts[(index + 1) % posts.length];
  const nextHref = `/${locale}/blog/post.html?slug=${encodeURIComponent(next.slug)}`;

  el.innerHTML = `
    <div class="container">
      <p><a class="text-link" href="${backHref}">${s.blogBack}</a></p>
      <header class="article-header">
        <span class="blog-card__category">${post.categoryLabel || post.category}</span>
        <h1>${post.title}</h1>
        <div class="article-header__meta">
          <span>${post.author}</span>
          <span>${s.readingTime(readingTime(post.body))}</span>
        </div>
      </header>
      ${post.image ? `<div class="article-photo"><img src="${post.image}" alt="${post.title}"></div>` : ""}
      <div class="article-body">
        ${post.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        ${post.quote ? `<blockquote>${post.quote}</blockquote>` : ""}
      </div>
      <div class="article-next">
        <a class="text-link" href="${nextHref}">${s.blogNextArticle}: ${next.title}</a>
      </div>
    </div>`;
}

/* ================= Typewriter (grapheme-safe) ================= */
function graphemeSplit(str) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(str), (s) => s.segment);
  }
  return Array.from(str);
}

function wireTypewriter(el, segments, { speed = 55 } = {}) {
  if (!el) return;
  const output = el.querySelector(".type-output");
  if (!output) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const hasBreakRM = segments.some((s) => s.break);
    const rowsRM = [""];
    segments.forEach((s) => {
      if (s.break) {
        rowsRM.push("");
      } else {
        rowsRM[rowsRM.length - 1] += s.highlight ? `<em class="hl">${s.text}</em>` : s.text;
      }
    });
    rowsRM[rowsRM.length - 1] += '<span class="type-cursor" aria-hidden="true"></span>';
    output.innerHTML = hasBreakRM ? rowsRM.map((r) => `<span class="type-row">${r}</span>`).join("") : rowsRM[0];
    el.classList.add("type-done");
    return;
  }

  const chunks = segments.map((s) =>
    s.break ? { break: true, chars: [""] } : { highlight: Boolean(s.highlight), chars: graphemeSplit(s.text) }
  );
  const total = chunks.reduce((sum, c) => sum + c.chars.length, 0);
  output.innerHTML = "";

  let count = 0;
  const hasBreaks = chunks.some((c) => c.break);

  function render() {
    let remaining = count;
    const rows = [""];
    for (const chunk of chunks) {
      if (remaining <= 0) break;
      if (chunk.break) {
        rows.push("");
        remaining -= 1;
        continue;
      }
      const take = Math.min(remaining, chunk.chars.length);
      const text = chunk.chars.slice(0, take).join("");
      rows[rows.length - 1] += chunk.highlight ? `<em class="hl">${text}</em>` : text;
      remaining -= take;
    }
    rows[rows.length - 1] += '<span class="type-cursor" aria-hidden="true"></span>';
    output.innerHTML = hasBreaks ? rows.map((r) => `<span class="type-row">${r}</span>`).join("") : rows[0];
  }

  function tick() {
    count += 1;
    render();
    if (count < total) {
      setTimeout(tick, speed);
    } else {
      el.classList.add("type-done");
    }
  }

  tick();
}

function renderHomeHeroTypewriter() {
  const siEl = document.getElementById("hero-typewriter-si");
  if (siEl) {
    wireTypewriter(siEl, [
      { text: "දර්ශනය ගැන දැන ගැනීම වෙනුවට" },
      { break: true },
      { text: " දර්ශනය " },
      { text: "ව්‍යවහාර", highlight: true },
      { text: " කිරීම." },
    ]);
  }

  const enEl = document.getElementById("hero-typewriter-en");
  if (enEl) {
    wireTypewriter(enEl, [
      { text: "What does it mean to live " },
      { text: "philosophically", highlight: true },
      { text: "?" },
    ]);
  }
}

/* ================= Home page assembly ================= */
async function renderHomeFeatureCards() {
  const mount = document.getElementById("home-feature-cards");
  if (!mount) return;
  const locale = currentLocale();
  const s = strings();
  const isSi = locale === "si";

  const [coursesRes, booksRes] = await Promise.all([
    fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" }),
    fetch(`/assets/data/books.${locale}.json`, { cache: "no-store" }),
  ]);
  const courses = coursesRes.ok ? await coursesRes.json() : [];
  const books = booksRes.ok ? await booksRes.json() : [];
  const openCourse = courses.find((c) => c.category === "open") || courses[0];
  const newestBook = books[0];

  const cards = [];
  if (openCourse) {
    cards.push({
      href: `/${locale}/courses/course.html?slug=${encodeURIComponent(openCourse.slug)}`,
      label: isSi ? "දැන් ලියාපදිංචි විය හැක" : "Now open",
      title: openCourse.title,
    });
  }
  if (newestBook) {
    cards.push({
      href: `/${locale}/books/index.html`,
      label: isSi ? "නවතම ප්‍රකාශනය" : "Newest publication",
      title: newestBook.title,
    });
  }
  cards.push({
    href: `/${locale}/about.html`,
    label: isSi ? "2012 සිට" : "Since 2012",
    title: isSi ? "දශකයකට වැඩි කාලයක් කොළඹ දර්ශනය" : "A decade of philosophy in Colombo",
    accent: true,
  });

  mount.innerHTML = cards
    .map(
      (card, i) => `
    <li class="feature-card${card.accent ? " feature-card--accent" : ""}">
      <a href="${card.href}" class="feature-card__panel" style="display: block; text-decoration: none;">
        <span class="feature-card__label">${card.label}</span>
        <span class="feature-card__title">${card.title}</span>
      </a>
    </li>`
    )
    .join("");
}

async function renderHomeTopics() {
  const mount = document.getElementById("home-topics");
  if (!mount) return;
  const locale = currentLocale();
  const isSi = locale === "si";

  const res = await fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" });
  const courses = res.ok ? await res.json() : [];
  const topicCourses = courses.slice(0, 2);

  const topics = topicCourses.map((course) => ({
    href: `/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}`,
    image: course.image,
    title: course.title,
    sub: course.duration,
  }));
  topics.push({
    href: `/${locale}/books/index.html`,
    image: "/assets/img/books/collection.jpeg",
    title: isSi ? "අපේ ප්‍රකාශන" : "Our Publications",
    sub: isSi ? "පොත් මිලදී ගන්න" : "Browse the books",
  });
  topics.push({
    href: `/${locale}/highlights/index.html`,
    image: "/assets/img/images/2026.jpeg",
    title: isSi ? "විශේෂාංග" : "Features",
    sub: isSi ? "නවතම ක්‍රියාකාරකම්" : "Latest activity",
  });

  mount.innerHTML = `<ul class="topic-grid">${topics
    .map(
      (topic) => `
    <li>
      <a class="topic-card" href="${topic.href}">
        <span class="topic-card__media"><img src="${topic.image}" alt=""></span>
        <span class="topic-card__body">
          <span class="topic-card__title">${topic.title}</span>
          <span class="topic-card__sub">${topic.sub}</span>
        </span>
      </a>
    </li>`
    )
    .join("")}</ul>`;
}

async function renderHomeBlogTeaser() {
  const mount = document.getElementById("home-blog-teaser");
  if (!mount) return;
  const locale = currentLocale();
  const posts = (await fetchBlogPosts(locale)).slice(0, 3);
  mount.innerHTML = `<div class="blog-grid">${posts.map((post) => blogCardHTML(post, locale, false)).join("")}</div>`;
}

async function renderHomeBookTeaser() {
  const mount = document.getElementById("home-book-teaser");
  if (!mount) return;
  const locale = currentLocale();
  const res = await fetch(`/assets/data/books.${locale}.json`, { cache: "no-store" });
  const books = res.ok ? await res.json() : [];
  mount.innerHTML = `<div class="book-grid">${books
    .slice(0, 4)
    .map((book) => bookCardHTML(book, locale))
    .join("")}</div>`;
  wireBookCart(mount, books, locale);
}

/* ================= Visitor counter ================= */
async function renderVisitorCounter() {
  const el = document.getElementById("visitor-count");
  if (!el) return;
  const locale = currentLocale();
  const s = strings();
  try {
    const res = await fetch("https://abacus.jasoncameron.dev/hit/csplk/site-visits");
    if (!res.ok) return;
    const data = await res.json();
    el.textContent = `${data.value.toLocaleString(locale === "si" ? "si-LK" : "en-US")} ${s.visitorCountSuffix}`;
  } catch {
    /* third-party counter unreachable - leave the widget blank */
  }
}

/* ================= Init ================= */
async function init() {
  const locale = currentLocale();
  await Promise.all([
    injectPartial("header-placeholder", `/partials/${locale}/header.html`),
    injectPartial("footer-placeholder", `/partials/${locale}/footer.html`),
  ]);
  wireMobileNavToggle();
  wireLocaleSwitcher();
  markCurrentNav(window.CSP_NAV_EXTRA_MATCHES);
  updateHeaderCartCount();
  renderVisitorCounter();
  await renderCourseList();
  await renderCourseDetail();
  await renderBookList();
  await renderVideoList();
  await renderHighlightsHome();
  await renderHighlightsFull();
  await renderHighlightDetail();
  await renderTimeline();
  await renderBlogList();
  await renderBlogPost();
  await renderHomeFeatureCards();
  await renderHomeTopics();
  await renderHomeBlogTeaser();
  await renderHomeBookTeaser();
  renderHomeHeroTypewriter();
  wireReveals();
}

window.CSP = { initFilters, initCarousel, initLightbox };

document.addEventListener("DOMContentLoaded", init);
