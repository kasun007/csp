/**
 * CSP site — shared behavior: partial injection, mobile nav toggle,
 * active link highlighting, locale switcher, and JSON-driven course
 * listing/detail rendering (so adding a course only means editing
 * assets/data/courses.<locale>.json, not any HTML file).
 *
 * Pages must be served over http(s) (e.g. `npx serve`), not opened via
 * file://, since fetch() for partials/data requires a real origin.
 */

const LOCALES = ["en", "si"];

const STRINGS = {
  en: {
    notFound: "Course not found.",
    backToCourses: "All courses",
    starts: "Starts",
    viewOnMap: "View on map",
    readMore: "Read more",
    instructor: "Instructor",
    fee: "Fee",
    currency: "Rs.",
    journeyContinues: "The Journey Continues →",
    addToCart: "Add to cart",
    decreaseQty: "Decrease quantity",
    increaseQty: "Increase quantity",
    cartTitle: "Your Book Bag",
    cartEmpty: "Your cart is empty. Add books above to get started.",
    cartRemove: "Remove",
    cartTotal: "Total",
    cartAddressLabel: "Delivery address",
    cartAddressPlaceholder: "Enter your delivery address",
    cartAddressPending: "(I'll add my delivery address in this chat)",
    cartCheckout: "Checkout on WhatsApp",
    cartWhatsappGreeting: "Hi CSP, I'd like to order the following books:",
    cartWhatsappTotal: "Total",
    cartWhatsappAddress: "Delivery address",
    cartWhatsappClosing: "I'll attach my payment slip in this chat.",
    highlightsTitle: "Highlights",
    highlightsIntro: "See what we've been doing lately.",
    highlightsLatestBadge: "Latest",
    highlightsViewAll: "View All Highlights",
    highlightsBack: "All highlights",
    highlightsNotFound: "Highlight not found.",
  },
  si: {
    notFound: "පාඨමාලාව හමු නොවීය.",
    backToCourses: "සියලු පාඨමාලා",
    starts: "ආරම්භය",
    viewOnMap: "සිතියමේ බලන්න",
    readMore: "වැඩිදුර කියවන්න",
    instructor: "පාඨමාලාව මෙහෙයවීම",
    fee: "ලියාපදිංචි ගාස්තුව",
    currency: "රු.",
    journeyContinues: "ගමන දිගටම යයි →",
    addToCart: "කරත්තයට එකතු කරන්න",
    decreaseQty: "ප්‍රමාණය අඩු කරන්න",
    increaseQty: "ප්‍රමාණය වැඩි කරන්න",
    cartTitle: "ඔබේ පොත් බෑගය",
    cartEmpty: "පොත් බෑගය හිස. ආරම්භ කිරීමට ඉහත පොත් එකතු කරන්න.",
    cartRemove: "ඉවත් කරන්න",
    cartTotal: "එකතුව",
    cartAddressLabel: "බෙදාහැරීමේ ලිපිනය",
    cartAddressPlaceholder: "ඔබේ බෙදාහැරීමේ ලිපිනය ඇතුළත් කරන්න",
    cartAddressPending: "(මම මගේ ලිපිනය මෙම සංවාදයට එක් කරන්නෙමි)",
    cartCheckout: "WhatsApp හරහා ඇණවුම කරන්න",
    cartWhatsappGreeting: "ආයුබෝවන් CSP, මට පහත පොත් ඇණවුම් කිරීමට අවශ්‍යයි:",
    cartWhatsappTotal: "එකතුව",
    cartWhatsappAddress: "බෙදාහැරීමේ ලිපිනය",
    cartWhatsappClosing: "මම මගේ ගෙවීම් රිසිට් පත මෙම සංවාදයට අමුණන්නෙමි.",
    highlightsTitle: "විශේෂාංග",
    highlightsIntro: "අප මෑතකදී කළ දේ බලන්න.",
    highlightsLatestBadge: "නවතම",
    highlightsViewAll: "සියලුම විශේෂාංග බලන්න",
    highlightsBack: "සියලුම විශේෂාංග",
    highlightsNotFound: "විශේෂාංගය හමු නොවීය.",
  },
};

const CART_STORAGE_KEY = "csp-cart-v1";
const CART_ADDRESS_KEY = "csp-cart-address-v1";
const CART_WHATSAPP_NUMBER = "94712760993";

function currentLocale() {
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(seg) ? seg : "en";
}

async function injectPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  const res = await fetch(url);
  if (!res.ok) return;
  el.outerHTML = await res.text();
}

function highlightActiveLink() {
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/index\.html$/, "/");
    if (linkPath === path) {
      link.classList.add("active");
    }
  });
}

function wireMobileNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function wireLocaleSwitcher() {
  const locale = currentLocale();
  document.querySelectorAll(".locale-switcher a[data-locale]").forEach((link) => {
    const targetLocale = link.dataset.locale;
    if (targetLocale === locale) {
      link.classList.add("active");
    }
    const parts = window.location.pathname.split("/").filter(Boolean);
    parts[0] = targetLocale;
    link.href = "/" + parts.join("/");
  });
}

function wireFilterPills() {
  document.querySelectorAll(".filter-pills").forEach((group) => {
    const grid = group.nextElementSibling;
    if (!grid) return;
    const cards = grid.querySelectorAll("[data-category]");
    group.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        group.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const filter = pill.dataset.filter;
        cards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.style.display = show ? "" : "none";
        });
      });
    });
  });
}

function courseEntryRowHTML(course, locale) {
  const strings = STRINGS[locale] || STRINGS.en;
  const href = `/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}`;
  return `
    <div class="entry-row entry-row--linked" data-category="${course.category}">
      <div class="entry-summary-main">
        ${course.image ? `<img class="entry-thumb" src="${course.image}" alt="">` : ""}
        <div>
          <h3>${course.title}</h3>
          <p>${course.summary}</p>
          <p><a class="read-more" href="${href}">${strings.readMore}</a></p>
        </div>
      </div>
      <div class="entry-meta">
        <div class="meta-row">
          <span><svg class="icon meta-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> ${course.duration}</span>
          <span><svg class="icon meta-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></svg> ${course.format}</span>
        </div>
      </div>
    </div>`;
}

async function renderCourseList() {
  const list = document.getElementById("course-list");
  if (!list) return;
  const locale = currentLocale();
  const strings = STRINGS[locale] || STRINGS.en;

  const res = await fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const courses = await res.json();

  const filters = document.getElementById("course-filters");
  if (filters) {
    const seen = new Set();
    const categories = [];
    courses.forEach((course) => {
      if (!seen.has(course.category)) {
        seen.add(course.category);
        categories.push({ category: course.category, label: course.categoryLabel });
      }
    });
    const pillsHTML = categories
      .map((c, i) => `<button class="filter-pill${i === 0 ? " active" : ""}" data-filter="${c.category}">${c.label}</button>`)
      .join("");
    filters.innerHTML = pillsHTML;
  }

  list.innerHTML = courses.map((course) => courseEntryRowHTML(course, locale)).join("");

  if (filters) {
    const defaultFilter = filters.querySelector(".filter-pill")?.dataset.filter;
    if (defaultFilter) {
      list.querySelectorAll("[data-category]").forEach((card) => {
        card.style.display = card.dataset.category === defaultFilter ? "" : "none";
      });
    }
  }
}

async function renderCourseDetail() {
  const el = document.getElementById("course-detail");
  if (!el) return;
  const locale = currentLocale();
  const strings = STRINGS[locale] || STRINGS.en;
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/courses/index.html`;

  const res = await fetch(`/assets/data/courses.${locale}.json`, { cache: "no-store" });
  const courses = res.ok ? await res.json() : [];
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    el.innerHTML = `<p>${strings.notFound}</p><p><a href="${backHref}">${strings.backToCourses}</a></p>`;
    return;
  }

  document.title = `${course.title} — Colombo School of Philosophy`;
  el.innerHTML = `
    ${course.image ? `<div class="detail-photo"><img src="${course.image}" alt=""></div>` : ""}
    <h1>${course.title}</h1>
    <p class="meta">${course.duration} &middot; ${course.format}</p>
    <p class="meta">${strings.starts} ${course.startDate} &middot; ${course.startTime}</p>
    <p class="meta">${course.location} &mdash; <a href="${course.mapUrl}" target="_blank" rel="noopener noreferrer">${strings.viewOnMap}</a></p>
    ${course.instructor ? `<p class="meta">${strings.instructor}: ${course.instructor}</p>` : ""}
    ${course.fee ? `<p class="meta">${strings.fee}: ${course.fee}</p>` : ""}
    ${course.description.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    <p><a href="${backHref}">${strings.backToCourses}</a></p>`;
}

function bookCardHTML(book, locale) {
  const strings = STRINGS[locale] || STRINGS.en;
  return `
    <div class="book-card" data-slug="${book.slug}">
      <div class="book-cover"><img src="${book.image}" alt="${book.title}"></div>
      <h3>${book.title}</h3>
      ${book.subtitle ? `<p class="book-subtitle">${book.subtitle}</p>` : ""}
      <p class="meta">${book.author}</p>
      <p class="book-price">${strings.currency} ${book.price}</p>
      <div class="qty-stepper" data-slug="${book.slug}">
        <button type="button" class="qty-btn qty-decrease" aria-label="${strings.decreaseQty}">&minus;</button>
        <span class="qty-value">0</span>
        <button type="button" class="qty-btn qty-increase" aria-label="${strings.increaseQty}">+</button>
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
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartAddress() {
  return localStorage.getItem(CART_ADDRESS_KEY) || "";
}

function saveCartAddress(address) {
  localStorage.setItem(CART_ADDRESS_KEY, address);
}

function setCartQty(slug, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[slug];
  } else {
    cart[slug] = qty;
  }
  saveCart(cart);
  return cart;
}

function syncBookCardQuantities(root) {
  const cart = getCart();
  root.querySelectorAll(".qty-stepper[data-slug]").forEach((stepper) => {
    const qty = cart[stepper.dataset.slug] || 0;
    stepper.querySelector(".qty-value").textContent = String(qty);
  });
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

function buildWhatsAppOrderUrl(items, total, address, locale) {
  const strings = STRINGS[locale] || STRINGS.en;
  const addressLine = address.trim() || strings.cartAddressPending;
  const lines = [
    strings.cartWhatsappGreeting,
    "",
    ...items.map((item) => `- ${item.title} x${item.qty} — ${strings.currency} ${item.subtotal}`),
    "",
    `${strings.cartWhatsappTotal}: ${strings.currency} ${total}`,
    "",
    `${strings.cartWhatsappAddress}: ${addressLine}`,
    "",
    strings.cartWhatsappClosing,
  ];
  return `https://wa.me/${CART_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function cartItemRowHTML(item, strings) {
  return `
    <div class="cart-item" data-slug="${item.slug}">
      <span class="cart-item-title">${item.title}</span>
      <span class="cart-item-qty">&times;${item.qty}</span>
      <span class="cart-item-subtotal">${strings.currency} ${item.subtotal}</span>
      <button type="button" class="cart-item-remove" data-slug="${item.slug}">${strings.cartRemove}</button>
    </div>`;
}

function renderCartPanel(books, locale) {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  const strings = STRINGS[locale] || STRINGS.en;
  const cart = getCart();
  const items = cartLineItems(books, cart);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (items.length === 0) {
    panel.innerHTML = `
      <h2>${strings.cartTitle}</h2>
      <p class="cart-empty">${strings.cartEmpty}</p>`;
    return;
  }

  const address = getCartAddress();

  panel.innerHTML = `
    <h2>${strings.cartTitle}</h2>
    <div class="cart-items">${items.map((item) => cartItemRowHTML(item, strings)).join("")}</div>
    <div class="cart-total"><span>${strings.cartTotal}</span><span>${strings.currency} ${total}</span></div>
    <div class="cart-address">
      <label for="cart-address-input">${strings.cartAddressLabel}</label>
      <textarea id="cart-address-input" rows="2" placeholder="${strings.cartAddressPlaceholder}">${address}</textarea>
    </div>
    <button type="button" class="button cart-checkout-btn" id="cart-checkout-btn">${strings.cartCheckout}</button>`;

  panel.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCartQty(btn.dataset.slug, 0);
      syncBookCardQuantities(document);
      renderCartPanel(books, locale);
    });
  });

  const addressInput = document.getElementById("cart-address-input");
  addressInput.addEventListener("input", () => saveCartAddress(addressInput.value));

  document.getElementById("cart-checkout-btn").addEventListener("click", () => {
    const url = buildWhatsAppOrderUrl(items, total, addressInput.value, locale);
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function wireBookCart(list, books, locale) {
  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".qty-btn");
    if (!btn) return;
    const stepper = btn.closest(".qty-stepper");
    const slug = stepper.dataset.slug;
    const current = getCart()[slug] || 0;
    const next = btn.classList.contains("qty-increase") ? current + 1 : Math.max(0, current - 1);
    setCartQty(slug, next);
    stepper.querySelector(".qty-value").textContent = String(next);
    renderCartPanel(books, locale);
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
  syncBookCardQuantities(list);
  wireBookCart(list, books, locale);
  renderCartPanel(books, locale);
}

function videoCardHTML(video) {
  const src = `https://www.youtube.com/embed/${video.youtubeId}${video.start ? `?start=${video.start}` : ""}`;
  return `
    <div class="video-card">
      <h3>${video.title}</h3>
      <div class="video-embed">
        <iframe src="${src}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="lazy" allowfullscreen></iframe>
      </div>
    </div>`;
}

async function renderVideoList() {
  const list = document.getElementById("video-list");
  if (!list) return;
  const locale = currentLocale();

  const res = await fetch(`/assets/data/videos.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const videos = await res.json();

  list.innerHTML = videos.map((video) => videoCardHTML(video)).join("");
}

const HIGHLIGHTS_HOME_LIMIT = 4;

function sortHighlightsByDateDesc(items) {
  return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function highlightCardHTML(item, locale, isLatest) {
  const strings = STRINGS[locale] || STRINGS.en;
  const href = `/${locale}/highlights/highlight.html?slug=${encodeURIComponent(item.slug)}`;
  return `
    <div class="highlight-card${isLatest ? " highlight-card--latest" : ""}">
      ${isLatest ? `<span class="highlight-badge">${strings.highlightsLatestBadge}</span>` : ""}
      ${item.image ? `<div class="highlight-image"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>` : ""}
      <div class="highlight-body">
        <span class="highlight-date">${item.dateLabel || item.date}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a class="read-more" href="${href}">${strings.readMore}</a>
      </div>
    </div>`;
}

async function fetchHighlights(locale) {
  const res = await fetch(`/assets/data/highlights.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return [];
  return sortHighlightsByDateDesc(await res.json());
}

async function renderHighlightsHome() {
  const list = document.getElementById("highlights-home-list");
  if (!list) return;
  const locale = currentLocale();
  const items = await fetchHighlights(locale);

  list.innerHTML = items
    .slice(0, HIGHLIGHTS_HOME_LIMIT)
    .map((item, index) => highlightCardHTML(item, locale, index === 0))
    .join("");
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
  const strings = STRINGS[locale] || STRINGS.en;
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/highlights/index.html`;

  const items = await fetchHighlights(locale);
  const item = items.find((h) => h.slug === slug);

  if (!item) {
    el.innerHTML = `<p>${strings.highlightsNotFound}</p><p><a href="${backHref}">${strings.highlightsBack}</a></p>`;
    return;
  }

  document.title = `${item.title} — Colombo School of Philosophy`;
  el.innerHTML = `
    ${item.image ? `<div class="detail-photo"><img src="${item.image}" alt="${item.title}"></div>` : ""}
    <h1>${item.title}</h1>
    <p class="meta">${item.dateLabel || item.date}</p>
    ${item.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    <p><a href="${backHref}">${strings.highlightsBack}</a></p>`;
}

function descriptionParagraphsHTML(description) {
  return description
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
    .join("");
}

function timelineDescriptionHTML(description, strings) {
  const paragraphs = description.split(/\n\s*\n/).map((paragraph) => paragraph.trim());
  const [first, ...rest] = paragraphs;

  if (rest.length === 0) {
    return `<p>${first}</p>`;
  }

  return `
    <p>${first}</p>
    <details class="timeline-more">
      <summary>${strings.readMore}</summary>
      ${rest.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    </details>`;
}

function timelineItemHTML(item, index, locale) {
  const strings = STRINGS[locale] || STRINGS.en;

  if (item.closing) {
    return `
      <div class="timeline-item timeline-item--closing">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <h3>${item.title}</h3>
          ${descriptionParagraphsHTML(item.description)}
          <p class="timeline-continues">${strings.journeyContinues}</p>
        </div>
      </div>`;
  }

  const isReverse = index % 2 === 1;
  const hasImage = Boolean(item.image);
  const mediaHTML = hasImage
    ? `
      <div class="timeline-media">
        <button class="timeline-image-btn" type="button" data-image-index="${item._imageIndex}">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <span class="timeline-hover-caption">
            <span class="timeline-hover-year">${item.year}</span>
            <span class="timeline-hover-title">${item.title}</span>
          </span>
        </button>
      </div>`
    : "";

  return `
    <div class="timeline-item${isReverse ? " timeline-item--reverse" : ""}${hasImage ? "" : " timeline-item--text-only"}">
      <div class="timeline-marker"></div>
      ${mediaHTML}
      <div class="timeline-content">
        <span class="timeline-year">${item.year}</span>
        <h3>${item.title}</h3>
        ${timelineDescriptionHTML(item.description, strings)}
        ${item.location ? `<p class="timeline-location">${item.location}</p>` : ""}
      </div>
    </div>`;
}

function wireTimelineReveal(list) {
  const items = list.querySelectorAll(".timeline-item");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  items.forEach((item) => observer.observe(item));
}

function wireTimelineLightbox(list, imageItems) {
  const lightbox = document.getElementById("timeline-lightbox");
  if (!lightbox || imageItems.length === 0) return;

  const imageEl = lightbox.querySelector(".lightbox-image");
  const yearEl = lightbox.querySelector(".lightbox-year");
  const titleEl = lightbox.querySelector(".lightbox-title");
  const descriptionEl = lightbox.querySelector(".lightbox-description");
  let currentIndex = 0;

  function show(index) {
    currentIndex = (index + imageItems.length) % imageItems.length;
    const item = imageItems[currentIndex];
    imageEl.src = item.image;
    imageEl.alt = item.title;
    yearEl.textContent = item.year || "";
    titleEl.textContent = item.title;
    descriptionEl.textContent = item.description;
  }

  function open(index) {
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  list.querySelectorAll(".timeline-image-btn").forEach((btn) => {
    btn.addEventListener("click", () => open(Number(btn.dataset.imageIndex)));
  });

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", close);
  });
  lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(currentIndex - 1));
  lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => show(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });
}

async function renderTimeline() {
  const list = document.getElementById("timeline-list");
  if (!list) return;
  const locale = currentLocale();

  const res = await fetch(`/assets/data/timeline.${locale}.json`, { cache: "no-store" });
  if (!res.ok) return;
  const items = await res.json();

  const imageItems = [];
  items.forEach((item) => {
    if (item.image) {
      item._imageIndex = imageItems.length;
      imageItems.push(item);
    }
  });

  list.innerHTML = items.map((item, index) => timelineItemHTML(item, index, locale)).join("");

  wireTimelineReveal(list);
  wireTimelineLightbox(list, imageItems);
}

async function init() {
  const locale = currentLocale();
  await Promise.all([
    injectPartial("header-placeholder", `/partials/${locale}/header.html`),
    injectPartial("footer-placeholder", `/partials/${locale}/footer.html`),
  ]);
  wireMobileNavToggle();
  wireLocaleSwitcher();
  highlightActiveLink();
  await renderCourseList();
  await renderCourseDetail();
  await renderBookList();
  await renderVideoList();
  await renderHighlightsHome();
  await renderHighlightsFull();
  await renderHighlightDetail();
  await renderTimeline();
  wireFilterPills();
}

document.addEventListener("DOMContentLoaded", init);
