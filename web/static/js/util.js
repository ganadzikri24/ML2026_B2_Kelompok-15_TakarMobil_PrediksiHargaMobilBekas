// Utilitas bersama: DOM, format angka, animasi hitung, API, dan state spesifikasi.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const rp = (n) => Math.round(n).toLocaleString("id-ID");
export const jt = (n) => "Rp " + Math.round(n / 1e6).toLocaleString("id-ID") + " jt";
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const ease = (t) => 1 - Math.pow(1 - t, 4);

export function countUp(el, from, to, dur = 1000, fmt = rp) {
  cancelAnimationFrame(el._raf);
  if (reduced || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = fmt(from + (to - from) * ease(p));
    if (p < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

const LOGO_FILE = {
  "Toyota": "toyota",
  "Daihatsu": "daihatsu",
  "Suzuki": "suzuki",
  "Honda": "honda",
  "Mercedes-Benz": "mercedes",
};
export const logoUrl = (b) => `/static/logos/${LOGO_FILE[b]}.svg`;

export async function api(path, body) {
  const opt = body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : {};
  const res = await fetch("/api/" + path, opt);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(typeof j.detail === "string" ? j.detail : "Server tidak merespons. Coba lagi sebentar.");
  }
  return res.json();
}

export const spec = {
  merek: "Toyota",
  model: "Avanza",
  varian: "G",
  tahun: 2020,
  km: 45000,
  transmisi: "Automatic",
  bahan_bakar: "Bensin",
  wilayah: "Jakarta",
};

let _meta = null;
export async function loadMeta() {
  if (!_meta) {
    _meta = await api("meta");
    const list = _meta.models_by_brand?.[spec.merek] || [];
    if (list.length && !list.some((it) => it.name === spec.model)) {
      spec.model = list[0].name;
    }
    const vlist = _meta.variants_by_model?.[`${spec.merek}||${spec.model}`] || [];
    if (vlist.length && !vlist.some((it) => it.name === spec.varian)) {
      spec.varian = vlist[0].name;
    } else if (!vlist.length) {
      spec.varian = "Standar";
    }
  }
  return _meta;
}

export function carLoadingHTML(label = "Membaca spesifikasi kendaraan...") {
  return `
    <div class="car-loader" role="status" aria-live="polite">
      <div class="car-scene">
        <div class="speed-lines"><i></i><i></i><i></i></div>
        <svg class="car-svg" viewBox="0 0 220 90" fill="none" aria-hidden="true">
          <g class="car-chassis">
            <path d="M24 56h12l8-16c4-8 12-13 22-14h48c14 0 26 6 36 16l26 4c10 2 16 7 16 14v8h-16a17 17 0 0 0-34 0H76a17 17 0 0 0-34 0H24a5 5 0 0 1-5-5v-2a5 5 0 0 1 5-5Z" fill="#111114"/>
            <path d="M58 43l9-11c2-2 5-3 9-3h36c9 0 18 4 25 11l3 3H58Z" fill="#0d9f66" opacity=".88"/>
            <path d="M180 51h9a3 3 0 0 1 3 3v2h-12v-5Z" fill="#fef08a"/>
            <path d="M20 53h7v5h-7z" fill="#ef4444"/>
          </g>
          <g class="wheel w1" transform="translate(59 64)">
            <circle r="13" fill="#111114"/>
            <circle r="7.5" fill="none" stroke="#e4e2dc" stroke-width="2"/>
            <circle r="2.8" fill="#0d9f66"/>
            <path d="M0-7.5L0 0M6.5 3.7L0 0M-6.5 3.7L0 0" stroke="#e4e2dc" stroke-width="1.5" stroke-linecap="round"/>
          </g>
          <g class="wheel w2" transform="translate(159 64)">
            <circle r="13" fill="#111114"/>
            <circle r="7.5" fill="none" stroke="#e4e2dc" stroke-width="2"/>
            <circle r="2.8" fill="#0d9f66"/>
            <path d="M0-7.5L0 0M6.5 3.7L0 0M-6.5 3.7L0 0" stroke="#e4e2dc" stroke-width="1.5" stroke-linecap="round"/>
          </g>
        </svg>
        <div class="road"><span></span></div>
      </div>
      <div class="loader-text">
        <b id="loaderTitle">Menghitung valuasi...</b>
        <span id="loaderSub">${label}</span>
      </div>
      <div class="loader-bar"><i></i></div>
    </div>
  `;
}
