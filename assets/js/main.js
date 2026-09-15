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
    allCourses: "All Courses",
    notFound: "Course not found.",
    backToCourses: "All courses",
    starts: "Starts",
    viewOnMap: "View on map",
    viewFullPage: "View full page",
  },
  si: {
    allCourses: "සියලු පාඨමාලා",
    notFound: "පාඨමාලාව හමු නොවීය.",
    backToCourses: "සියලු පාඨමාලා",
    starts: "ආරම්භය",
    viewOnMap: "සිතියමේ බලන්න",
    viewFullPage: "සම්පූර්ණ පිටුව බලන්න",
  },
};

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
  return `
    <details class="entry-row entry-accordion" name="course-accordion" data-category="${course.category}">
      <summary class="entry-summary">
        <div>
          <h3>${course.title}</h3>
          <p>${course.summary}</p>
        </div>
        <div class="entry-meta">
          <div class="meta-row">
            <span><svg class="icon meta-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> ${course.duration}</span>
            <span><svg class="icon meta-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></svg> ${course.format}</span>
          </div>
        </div>
      </summary>
      <div class="entry-accordion-details">
        <p class="meta">${strings.starts} ${course.startDate} &middot; ${course.startTime}</p>
        <p class="meta">${course.location} &mdash; <a href="${course.mapUrl}" target="_blank" rel="noopener noreferrer">${strings.viewOnMap}</a></p>
        ${course.description.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        <p><a href="/${locale}/courses/course.html?slug=${encodeURIComponent(course.slug)}">${strings.viewFullPage}</a></p>
      </div>
    </details>`;
}

async function renderCourseList() {
  const list = document.getElementById("course-list");
  if (!list) return;
  const locale = currentLocale();
  const strings = STRINGS[locale] || STRINGS.en;

  const res = await fetch(`/assets/data/courses.${locale}.json`);
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
    const pillsHTML = [`<button class="filter-pill active" data-filter="all">${strings.allCourses}</button>`]
      .concat(categories.map((c) => `<button class="filter-pill" data-filter="${c.category}">${c.label}</button>`))
      .join("");
    filters.innerHTML = pillsHTML;
  }

  list.innerHTML = courses.map((course) => courseEntryRowHTML(course, locale)).join("");
}

async function renderCourseDetail() {
  const el = document.getElementById("course-detail");
  if (!el) return;
  const locale = currentLocale();
  const strings = STRINGS[locale] || STRINGS.en;
  const slug = new URLSearchParams(window.location.search).get("slug");
  const backHref = `/${locale}/courses/index.html`;

  const res = await fetch(`/assets/data/courses.${locale}.json`);
  const courses = res.ok ? await res.json() : [];
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    el.innerHTML = `<p>${strings.notFound}</p><p><a href="${backHref}">${strings.backToCourses}</a></p>`;
    return;
  }

  document.title = `${course.title} — Colombo School of Philosophy`;
  el.innerHTML = `
    <h1>${course.title}</h1>
    <p class="meta">${course.duration} &middot; ${course.format}</p>
    <p class="meta">${strings.starts} ${course.startDate} &middot; ${course.startTime}</p>
    <p class="meta">${course.location} &mdash; <a href="${course.mapUrl}" target="_blank" rel="noopener noreferrer">${strings.viewOnMap}</a></p>
    ${course.description.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    <p><a href="${backHref}">${strings.backToCourses}</a></p>`;
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
  wireFilterPills();
}

document.addEventListener("DOMContentLoaded", init);
