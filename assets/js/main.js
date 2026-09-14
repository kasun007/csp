/**
 * CSP site — shared behavior: partial injection, mobile nav toggle,
 * active link highlighting, locale switcher.
 *
 * Pages must be served over http(s) (e.g. `npx serve`), not opened via
 * file://, since fetch() for partials requires a real origin.
 */

const LOCALES = ["en", "si", "ta"];

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

async function init() {
  const locale = currentLocale();
  await Promise.all([
    injectPartial("header-placeholder", `/partials/${locale}/header.html`),
    injectPartial("footer-placeholder", `/partials/${locale}/footer.html`),
  ]);
  wireMobileNavToggle();
  wireLocaleSwitcher();
  highlightActiveLink();
  wireFilterPills();
}

document.addEventListener("DOMContentLoaded", init);
