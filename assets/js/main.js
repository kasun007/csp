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
const CART_WHATSAPP_NUMBER = "94712760993";
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

/* ================= Books + Cart ================= */
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
  const books = window.CSP_BOOKS || [];

  wireBookCart(list, books, locale);
  renderCartPanel(books, locale);
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

function renderHighlightsHome() {
  const root = document.getElementById("highlights-carousel");
  if (!root) return;
  initCarousel(root);
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

/** Builds wireTypewriter segments from the server-rendered .type-output markup itself. */
function segmentsFromMarkup(el) {
  const output = el.querySelector(".type-output");
  if (!output) return [];
  return Array.from(output.childNodes).map((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "EM") {
      return { text: node.textContent, highlight: true };
    }
    return { text: node.textContent };
  });
}

function renderHomeHeroTypewriter() {
  ["en", "si"].forEach((locale) => {
    const el = document.getElementById(`hero-typewriter-${locale}`);
    if (!el) return;
    const segments = segmentsFromMarkup(el);
    if (segments.length) wireTypewriter(el, segments);
  });
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
  await renderBookList();
  renderHighlightsHome();
  renderHomeHeroTypewriter();
  wireReveals();
  initFilters(document.getElementById("blog-filters"), document.getElementById("blog-list"));
  initFilters(document.getElementById("course-filters"), document.getElementById("course-list"));
}

window.CSP = { initFilters, initCarousel, initLightbox };

document.addEventListener("DOMContentLoaded", init);
