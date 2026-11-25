// Router dengan View Transitions API (halus saat klik), navbar, dan kontrol autoplay video hero.
import { $, $$ } from "./util.js";
import { mountEstimator, mountDeal, mountImportance, mountAbout, initHome } from "./features.js";

const ROUTES = {
  "/": { init: initHome },
  "/estimasi": { init: mountEstimator, title: "Estimasi Harga" },
  "/deal-checker": { init: mountDeal, title: "Deal Checker" },
  "/faktor-harga": { init: mountImportance, title: "Faktor Harga" },
  "/tentang": { init: mountAbout, title: "Tentang Model" },
};

const pages = $$(".page");
const nav = $("#nav");
const pill = $("#pill");
const ind = $("#pillInd");
const vid = $("#heroVideo");
let current = null;

function ensureVideoPlays() {
  if (!vid || vid.dataset.paused) return;
  vid.muted = true;
  vid.play().catch(() => {});
}

// Mulai video secepat mungkin saat DOM siap.
if (vid) {
  vid.addEventListener("canplay", ensureVideoPlays, { once: true });
  ensureVideoPlays();
}

function placeIndicator() {
  const on = $('a[aria-current="page"]', pill);
  if (!on) { ind.style.width = "0"; return; }
  ind.style.width = on.offsetWidth + "px";
  ind.style.transform = `translateX(${on.offsetLeft - 5}px)`;
}

function updateNav() {
  nav.classList.toggle("solid", current !== "/" || scrollY > 40);
}

async function applyRoute(route, push) {
  if (push && location.pathname !== route) history.pushState({}, "", route);
  current = route;
  pages.forEach(p => p.classList.toggle("on", p.dataset.route === route));
  $$("[data-link]").forEach((a) => {
    const on = a.getAttribute("href") === route && (a.closest("#pill") || a.closest("#menu"));
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.title = (ROUTES[route].title ? ROUTES[route].title + " — " : "") + "TakarMobil";
  scrollTo({ top: 0, behavior: "instant" });
  closeMenu();
  updateNav();
  requestAnimationFrame(placeIndicator);
  if (vid) {
    if (route === "/") ensureVideoPlays();
    else vid.pause();
  }
  try { await ROUTES[route].init(); } catch (e) { console.error(e); }
}

async function go(path, push = true) {
  const route = ROUTES[path] ? path : "/";
  if (route === current && push) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduced && current !== null) {
    const t = document.startViewTransition(() => applyRoute(route, push));
    await t.finished.catch(() => {});
  } else {
    await applyRoute(route, push);
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
  e.preventDefault();
  go(a.getAttribute("href"));
});
addEventListener("popstate", () => go(location.pathname, false));
addEventListener("scroll", updateNav, { passive: true });
addEventListener("resize", placeIndicator);
document.fonts?.ready.then(placeIndicator);

// Menu mobile
const burger = $("#burger"), menu = $("#menu");
function closeMenu() {
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Buka menu");
}
burger.addEventListener("click", () => {
  const open = !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
});
addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// Video hero: jeda/putar manual
const vctl = $("#vctl"), vIcon = $("#vIcon");
const PAUSE = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
const PLAY = '<path d="M8 5v14l11-7z"/>';
function setVideo(playing) {
  if (!vid) return;
  vid.dataset.paused = playing ? "" : "1";
  if (playing) ensureVideoPlays(); else vid.pause();
  vIcon.innerHTML = playing ? PAUSE : PLAY;
  vctl.setAttribute("aria-pressed", String(!playing));
  vctl.setAttribute("aria-label", playing ? "Jeda video latar" : "Putar video latar");
}
vctl?.addEventListener("click", () => setVideo(vid.paused));
if (matchMedia("(prefers-reduced-motion: reduce)").matches) setVideo(false);

go(location.pathname, false);
