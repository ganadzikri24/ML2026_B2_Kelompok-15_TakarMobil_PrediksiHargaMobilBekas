// Widget input interaktif: Merek -> Tipe (searchable), Tahun, Transmisi, Bahan Bakar, Wilayah, KM (ketik + spidometer).
import { h, clamp, logoUrl, reduced } from "./util.js";

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/>';
const MINUS = ARROW + "</svg>";
const PLUS = ARROW + '<path d="M12 5v14"/></svg>';

function digits(container, n) {
  const cols = [];
  for (let i = 0; i < n; i++) {
    const d = h(`<div class="digit"><div class="digit-in">${[0,1,2,3,4,5,6,7,8,9].map(x => `<span>${x}</span>`).join("")}</div></div>`);
    container.appendChild(d);
    cols.push(d.firstElementChild);
  }
  return (value) => {
    const s = String(Math.max(0, Math.round(value))).padStart(n, "0").slice(-n);
    cols.forEach((c, i) => { c.style.transform = `translateY(${-Number(s[i]) * 10}%)`; });
  };
}

function segment(options, current, onPick, label) {
  const seg = h(`<div class="seg" role="radiogroup" aria-label="${label}"><span class="thumb"></span>${options.map(o => `<button type="button" role="radio" aria-checked="${o === current}" data-v="${o}">${o}</button>`).join("")}</div>`);
  const thumb = seg.querySelector(".thumb");
  const place = () => {
    const on = seg.querySelector('[aria-checked="true"]');
    if (!on) return;
    thumb.style.width = on.offsetWidth + "px";
    thumb.style.transform = `translateX(${on.offsetLeft - 5}px)`;
  };
  seg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", String(x === b)));
    place();
    onPick(b.dataset.v);
  });
  requestAnimationFrame(() => { place(); setTimeout(place, 120); });
  addEventListener("resize", place);
  return seg;
}

/* ---------- 1 & 2. Merek + Tipe Mobil (Searchable Text & Klik) ---------- */
export function brandAndModelWidget(meta, spec, onChange) {
  const wrap = h(`
    <section class="w full">
      <div class="w-head">
        <h3>1. Merek &amp; Tipe Mobil</h3>
        <span class="val" data-v>${spec.merek} · ${spec.model}</span>
      </div>
      <div class="brands" role="radiogroup" aria-label="Pilih merek mobil"></div>
      <div class="model-panel is-open" id="modelPanel">
        <div class="model-top">
          <label class="model-label" for="modelSearch">Tipe mobil <span class="badge-brand" data-bname>${spec.merek}</span></label>
          <span class="model-hint" data-count></span>
        </div>
        <div class="combobox" data-open="false">
          <svg class="cb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="modelSearch" type="text" autocomplete="off" placeholder="Ketik nama tipe (mis. Avanza, Brio, C200)..." value="${spec.model}">
          <button type="button" class="cb-clear" aria-label="Hapus pencarian tipe" title="Cari tipe lain">×</button>
          <div class="cb-drop" role="listbox" aria-label="Daftar tipe mobil"></div>
        </div>
        <div class="popular-row">
          <span class="pop-cap">Populer:</span>
          <div class="pop-chips"></div>
        </div>
      </div>
    </section>
  `);

  const brandsBox = wrap.querySelector(".brands");
  const panel = wrap.querySelector("#modelPanel");
  const combo = wrap.querySelector(".combobox");
  const input = wrap.querySelector("#modelSearch");
  const drop = wrap.querySelector(".cb-drop");
  const popChips = wrap.querySelector(".pop-chips");
  const valHead = wrap.querySelector("[data-v]");
  const bBadge = wrap.querySelector("[data-bname]");
  const countEl = wrap.querySelector("[data-count]");

  meta.brands.forEach((b) => {
    const wide = b === "Daihatsu";
    const btn = h(`<button type="button" class="brand-btn" role="radio" aria-checked="${b === spec.merek}" data-v="${b}" aria-label="${b}">
      <span class="lg" style="--src:url(${logoUrl(b)});${wide ? "width:74%;aspect-ratio:6.4/1;" : ""}"></span>
      <small>${b === "Mercedes-Benz" ? "Mercedes" : b}</small>
    </button>`);
    brandsBox.appendChild(btn);
  });

  const getModels = () => meta.models_by_brand?.[spec.merek] || [];

  function renderPopular() {
    const list = getModels().slice(0, 6);
    popChips.innerHTML = list.map(m =>
      `<button type="button" class="chip sm" aria-checked="${m.name === spec.model}" data-m="${m.name}">${m.name}</button>`
    ).join("");
  }

  function renderDropdown(query = "") {
    const q = query.trim().toLowerCase();
    const all = getModels();
    const filtered = q ? all.filter(m => m.name.toLowerCase().includes(q)) : all.slice(0, 18);
    if (!filtered.length) {
      drop.innerHTML = `<div class="cb-empty">Tipe "${query}" tidak ditemukan di data ${spec.merek}.</div>`;
      return;
    }
    drop.innerHTML = filtered.slice(0, 18).map(m => `
      <button type="button" class="cb-opt" role="option" aria-selected="${m.name === spec.model}" data-m="${m.name}">
        <span>${m.name}</span>
        <small>${m.count} iklan</small>
      </button>
    `).join("");
  }

  function updateHeader() {
    valHead.textContent = `${spec.merek} · ${spec.model}`;
    bBadge.textContent = spec.merek;
    countEl.textContent = `${getModels().length} tipe di dataset`;
  }

  function pickModel(name, closeDrop = true) {
    spec.model = name;
    input.value = name;
    if (closeDrop) combo.dataset.open = "false";
    updateHeader();
    renderPopular();
    onChange("model", name);
  }

  brandsBox.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const nextBrand = b.dataset.v;
    brandsBox.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", String(x === b)));
    spec.merek = nextBrand;
    const list = getModels();
    spec.model = list[0]?.name || "";
    input.value = spec.model;
    panel.classList.remove("pulse-in");
    void panel.offsetWidth;
    panel.classList.add("pulse-in");
    updateHeader();
    renderPopular();
    renderDropdown("");
    combo.dataset.open = "true";
    input.focus();
    onChange("merek", nextBrand);
  });

  input.addEventListener("focus", () => {
    renderDropdown(input.value === spec.model ? "" : input.value);
    combo.dataset.open = "true";
  });

  input.addEventListener("input", () => {
    renderDropdown(input.value);
    combo.dataset.open = "true";
    // Cocokkan persis bila sudah lengkap
    const exact = getModels().find(m => m.name.toLowerCase() === input.value.trim().toLowerCase());
    if (exact) {
      spec.model = exact.name;
      updateHeader();
      renderPopular();
      onChange("model", exact.name);
    }
  });

  wrap.querySelector(".cb-clear").addEventListener("click", () => {
    input.value = "";
    renderDropdown("");
    combo.dataset.open = "true";
    input.focus();
  });

  drop.addEventListener("click", (e) => {
    const opt = e.target.closest(".cb-opt");
    if (!opt) return;
    pickModel(opt.dataset.m, true);
  });

  popChips.addEventListener("click", (e) => {
    const ch = e.target.closest(".chip");
    if (!ch) return;
    pickModel(ch.dataset.m, true);
  });

  document.addEventListener("click", (e) => {
    if (!combo.contains(e.target)) combo.dataset.open = "false";
  });

  updateHeader();
  renderPopular();
  renderDropdown("");
  return wrap;
}

/* ---------- 3. Tahun Produksi ---------- */
export function yearWidget(meta, spec, onChange) {
  const MIN = 1995, MAX = meta.tahun_acuan, S = 14;
  const w = h(`
    <section class="w">
      <div class="w-head"><h3>2. Tahun Produksi</h3><span class="val" data-v></span></div>
      <div class="year">
        <div class="year-num" aria-hidden="true"></div>
        <div class="ruler" tabindex="0" role="slider" aria-label="Tahun produksi" aria-valuemin="${MIN}" aria-valuemax="${MAX}">
          <div class="ruler-track"></div>
          <div class="ruler-mark"></div>
        </div>
        <div class="year-meta">
          <span class="age-pill" data-age></span>
          <div class="step-btns">
            <button type="button" aria-label="Satu tahun lebih lama" data-d="-1">${MINUS}</button>
            <button type="button" aria-label="Satu tahun lebih baru" data-d="1">${PLUS}</button>
          </div>
        </div>
      </div>
    </section>
  `);
  const setDigits = digits(w.querySelector(".year-num"), 4);
  const ruler = w.querySelector(".ruler");
  const track = w.querySelector(".ruler-track");
  for (let y = MIN; y <= MAX; y++) {
    const major = y % 5 === 0;
    track.appendChild(h(`<i class="tick${major ? " m" : ""}" style="left:${(y - MIN) * S}px">${major ? `<em>${y}</em>` : ""}</i>`));
  }
  let v = spec.tahun;
  const px = (val) => -(val - MIN) * S;
  const render = (val, offset) => {
    track.style.transform = `translateX(${offset ?? px(val)}px)`;
    setDigits(val);
    w.querySelector("[data-v]").textContent = val;
    w.querySelector("[data-age]").textContent = `Usia ${MAX - val} thn`;
    ruler.setAttribute("aria-valuenow", val);
  };
  const set = (val, emit = true) => {
    val = clamp(Math.round(val), MIN, MAX);
    const changed = val !== v;
    v = val;
    render(v);
    if (changed && emit) onChange("tahun", v);
  };
  let drag = null;
  ruler.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, v };
    ruler.classList.add("drag");
    ruler.setPointerCapture(e.pointerId);
  });
  ruler.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const off = clamp(px(drag.v) + dx, px(MAX), px(MIN));
    const nv = clamp(Math.round(MIN - off / S), MIN, MAX);
    render(nv, off);
    if (nv !== v) { v = nv; onChange("tahun", v); }
  });
  const end = () => { if (!drag) return; drag = null; ruler.classList.remove("drag"); render(v); };
  ruler.addEventListener("pointerup", end);
  ruler.addEventListener("pointercancel", end);
  ruler.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 }[e.key];
    if (k) { e.preventDefault(); set(v + k); }
  });
  w.querySelectorAll(".step-btns button").forEach(b => b.addEventListener("click", () => set(v + Number(b.dataset.d))));
  render(v);
  return w;
}

/* ---------- 4. Transmisi ---------- */
export function transmisiWidget(meta, spec, onChange) {
  const man = { N: [120, 92], 1: [54, 46], 2: [54, 138], 3: [120, 46], 4: [120, 138], 5: [186, 46], R: [186, 138] };
  const autoY = { P: 36, R: 74, N: 112, D: 150 };
  const w = h(`
    <section class="w">
      <div class="w-head"><h3>3. Transmisi</h3><span class="val" data-v>${spec.transmisi}</span></div>
      <div class="gear" data-t="${spec.transmisi}">
        <svg viewBox="0 0 240 184" aria-hidden="true">
          <g class="layer l-man">
            <rect x="28" y="20" width="184" height="144" rx="18" fill="#ffffff" stroke="#e4e2dc" stroke-width="1.5"/>
            <path class="gate" d="M54 46V138M120 46V138M186 46V138M54 92H186"/>
            ${Object.entries(man).filter(([k]) => k !== "N").map(([k, [x, y]]) =>
              `<text class="gl" data-g="${k}" x="${x}" y="${y < 92 ? y - 16 : y + 25}">${k}</text>`).join("")}
            <g class="knob" id="kMan" style="transform:translate(120px,92px)">
              <circle r="16" class="kb-outer"/><circle r="10" class="kb-in"/>
            </g>
          </g>
          <g class="layer l-auto">
            <rect x="66" y="16" width="108" height="154" rx="18" fill="#ffffff" stroke="#e4e2dc" stroke-width="1.5"/>
            <path class="gate" d="M104 36V150"/>
            ${Object.entries(autoY).map(([k, y]) =>
              `<text class="gl" data-g="${k}" x="145" y="${y + 4}">${k}</text>`).join("")}
            <g class="knob" id="kAuto" style="transform:translate(104px,36px)">
              <circle r="16" class="kb-outer"/><circle r="10" class="kb-in"/>
            </g>
          </g>
        </svg>
        <div class="gear-read">POSISI <b data-read>-</b></div>
      </div>
    </section>
  `);
  const gear = w.querySelector(".gear");
  const kMan = w.querySelector("#kMan"), kAuto = w.querySelector("#kAuto");
  const read = w.querySelector("[data-read]");
  let token = 0;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const mark = (layer, g) => {
    gear.querySelectorAll(`.${layer} .gl`).forEach(t => t.classList.toggle("on", t.dataset.g === g));
    read.textContent = g === "N" ? "NETRAL" : layer === "l-man" ? `GIGI ${g}` : g;
  };
  async function play(type) {
    const my = ++token;
    const step = reduced ? 0 : 280;
    if (type === "Manual") {
      const seq = [["N", 54, 92], ["1", 54, 46], ["N", 54, 92], ["2", 54, 138], ["N", 120, 92], ["3", 120, 46]];
      for (const [g, x, y] of seq) {
        if (my !== token) return;
        kMan.style.transform = `translate(${x}px,${y}px)`;
        mark("l-man", g);
        await wait(step);
      }
    } else {
      for (const g of ["P", "R", "N", "D"]) {
        if (my !== token) return;
        kAuto.style.transform = `translate(104px,${autoY[g]}px)`;
        mark("l-auto", g);
        await wait(step);
      }
    }
  }
  const seg = segment(meta.transmisi, spec.transmisi, (val) => {
    gear.dataset.t = val;
    w.querySelector("[data-v]").textContent = val;
    play(val);
    onChange("transmisi", val);
  }, "Transmisi");
  w.querySelector(".w-head").after(seg);
  setTimeout(() => play(spec.transmisi), 280);
  return w;
}

/* ---------- 5. Bahan Bakar ---------- */
const FUEL_COLOR = { Bensin: "#e5921d", Diesel: "#52463a", Hybrid: "#0d9f66" };
export function fuelWidget(meta, spec, onChange) {
  const w = h(`
    <section class="w">
      <div class="w-head"><h3>4. Bahan Bakar</h3><span class="val" data-v>${spec.bahan_bakar}</span></div>
      <div class="fuel" data-f="${spec.bahan_bakar}">
        <span class="pipe"></span>
        <div class="drops"><i></i><i></i><i></i></div>
        <svg viewBox="0 0 150 166" aria-hidden="true">
          <defs>
            <clipPath id="dropClip-${Math.random().toString(36).slice(2, 7)}">
              <path d="M75 10C75 10 20 68 20 110a55 55 0 0 0 110 0C130 68 75 10 75 10Z"/>
            </clipPath>
          </defs>
          <g class="liq-wrap">
            <g class="liq" style="transform:translateY(166px)">
              <path class="wv" d="M-60 0q15-9 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0V200H-60Z" fill="${FUEL_COLOR[spec.bahan_bakar]}"/>
            </g>
          </g>
          <path class="outline" d="M75 10C75 10 20 68 20 110a55 55 0 0 0 110 0C130 68 75 10 75 10Z"/>
          <g class="glyph"><path d="M80 82L63 114h12l-4 22 19-35H78z" fill="#ffffff"/></g>
        </svg>
        <div class="fuel-read">Tipe <b data-read>${spec.bahan_bakar}</b></div>
      </div>
    </section>
  `);
  const fuel = w.querySelector(".fuel");
  const clipId = w.querySelector("clipPath").id;
  w.querySelector(".liq-wrap").setAttribute("clip-path", `url(#${clipId})`);
  const liq = w.querySelector(".liq"), wv = w.querySelector(".wv");
  const apply = (val, refill) => {
    const c = FUEL_COLOR[val];
    fuel.dataset.f = val;
    fuel.style.setProperty("--fc", c);
    wv.setAttribute("fill", c);
    w.querySelector("[data-read]").textContent = val;
    if (refill && !reduced) {
      liq.style.transition = "none";
      liq.style.transform = "translateY(166px)";
      void liq.getBoundingClientRect();
      liq.style.transition = "";
    }
    requestAnimationFrame(() => { liq.style.transform = "translateY(56px)"; });
  };
  const seg = segment(meta.bahan_bakar, spec.bahan_bakar, (val) => {
    w.querySelector("[data-v]").textContent = val;
    apply(val, true);
    onChange("bahan_bakar", val);
  }, "Bahan bakar");
  w.querySelector(".w-head").after(seg);
  setTimeout(() => apply(spec.bahan_bakar, false), 200);
  return w;
}

/* ---------- 6. Wilayah (Peta Jabodetabek Beranimasi Sonar & Rute) ---------- */
const REGIONS = {
  Tangerang: { d: "M18 60L96 54L108 100L94 140L40 134L14 100Z", c: [60, 96] },
  Jakarta:   { d: "M96 54L204 52L214 96L160 112L108 100Z", c: [154, 78] },
  Bekasi:    { d: "M204 52L302 64L306 118L248 140L214 96Z", c: [256, 92] },
  Depok:     { d: "M108 100L160 112L214 96L248 140L192 158L120 150L94 140Z", c: [160, 128] },
  Bogor:     { d: "M94 140L120 150L192 158L248 140L270 180L202 214L118 210L68 178Z", c: [166, 182] },
};
export function wilayahWidget(meta, spec, onChange) {
  const OUT = "Luar Jabodetabek";
  const cOf = (n) => (n === OUT ? [40, 210] : REGIONS[n].c);
  const wCounts = meta.wilayah_counts || {};
  const w = h(`
    <section class="w">
      <div class="w-head"><h3>5. Wilayah</h3><span class="val" data-v>${spec.wilayah}</span></div>
      <div class="map">
        <svg viewBox="0 0 320 244" role="group" aria-label="Peta interaktif wilayah Jabodetabek">
          <g class="grid-bg">
            <path d="M0 58H320M0 116H320M0 174H320M80 0V244M160 0V244M240 0V244"/>
          </g>
          <g class="sea"><path d="M10 22q20-7 40 0t40 0 40 0 40 0 40 0 40 0 40 0 20 0"/><text x="160" y="38" text-anchor="middle">LAUT JAWA</text></g>
          <g class="region out" data-r="${OUT}" role="button" tabindex="0" aria-label="${OUT}">
            <rect x="8" y="8" width="304" height="228" rx="14"/>
            <text x="20" y="226" text-anchor="start">LUAR JABODETABEK</text>
          </g>
          ${Object.entries(REGIONS).map(([n, r]) => `
            <g class="region" data-r="${n}" role="button" tabindex="0" aria-label="${n}">
              <path d="${r.d}"/>
              <text x="${r.c[0]}" y="${r.c[1] + 4}">${n.toUpperCase()}</text>
            </g>`).join("")}
          <path class="route-line" id="routeLine" d="M154 78 L256 32" fill="none"/>
          <g class="pinG" style="transform:translate(${cOf(spec.wilayah)[0]}px,${cOf(spec.wilayah)[1] - 14}px)">
            <circle class="pulse p1" r="16"/><circle class="pulse p2" r="24"/>
            <circle class="pin" r="6"/><circle cx="0" cy="0" r="2.2" fill="#fff"/>
          </g>
        </svg>
        <div class="map-badge" id="mapBadge">
          <span class="dot"></span>
          <b data-city>${spec.wilayah}</b>
          <small data-citycnt></small>
        </div>
      </div>
      <div class="chips" role="radiogroup" aria-label="Wilayah">
        ${meta.wilayah.map(n => `<button type="button" role="radio" class="chip" aria-checked="${n === spec.wilayah}" data-v="${n}">${n}</button>`).join("")}
      </div>
    </section>
  `);
  const regs = [...w.querySelectorAll(".region")];
  const chips = [...w.querySelectorAll(".chip")];
  const pin = w.querySelector(".pinG");
  const p1 = pin.querySelector(".p1"), p2 = pin.querySelector(".p2");
  const rLine = w.querySelector("#routeLine");
  const badgeCity = w.querySelector("[data-city]"), badgeCnt = w.querySelector("[data-citycnt]");

  const select = (name, emit = true) => {
    regs.forEach(r => r.classList.toggle("on", r.dataset.r === name));
    chips.forEach(c => c.setAttribute("aria-checked", String(c.dataset.v === name)));
    const [x, y] = cOf(name);
    pin.style.transform = `translate(${x}px,${y - 14}px)`;
    rLine.setAttribute("d", `M${x} ${y - 14} Q${(x + 250) / 2} ${Math.max(18, y - 48)} 264 24`);
    rLine.classList.remove("go"); void rLine.getBBox(); rLine.classList.add("go");
    p1.classList.remove("run"); p2.classList.remove("run"); void p1.getBBox();
    p1.classList.add("run"); p2.classList.add("run");
    w.querySelector("[data-v]").textContent = name;
    badgeCity.textContent = name;
    const cnt = wCounts[name];
    badgeCnt.textContent = cnt ? `${cnt.toLocaleString("id-ID")} unit di data` : "";
    if (emit) onChange("wilayah", name);
  };
  regs.forEach(r => {
    r.addEventListener("click", () => select(r.dataset.r));
    r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(r.dataset.r); } });
  });
  chips.forEach(c => c.addEventListener("click", () => select(c.dataset.v)));
  select(spec.wilayah, false);
  return w;
}

/* ---------- 7. Jarak Tempuh (Spidometer Drag + Input Angka Bisa Diketik) ---------- */
export function kmWidget(meta, spec, onChange) {
  const CX = 150, CY = 150, R = 110, A0 = -135, A1 = 135, MAX = 300000, MINV = 1000;
  const pt = (a, r) => { const t = (a * Math.PI) / 180; return [CX + r * Math.sin(t), CY - r * Math.cos(t)]; };
  const arc = (a0, a1, r) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const angleOf = (v) => A0 + ((A1 - A0) * clamp(v, 0, MAX)) / MAX;
  let ticks = "";
  for (let v = 0; v <= MAX; v += 10000) {
    const a = angleOf(v), major = v % 50000 === 0;
    const [x0, y0] = pt(a, R - (major ? 16 : 9)), [x1, y1] = pt(a, R + 2);
    ticks += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${major ? "#64646d" : "#d4d2cb"}" stroke-width="${major ? 2 : 1.2}"/>`;
    if (major) { const [tx, ty] = pt(a, R - 29); ticks += `<text class="sp-t" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}">${v / 1000}</text>`; }
  }
  const w = h(`
    <section class="w full">
      <div class="w-head"><h3>6. Jarak Tempuh</h3><span class="val" data-v></span></div>
      <div class="speedo">
        <svg viewBox="0 0 300 226" role="slider" tabindex="0" aria-label="Spidometer jarak tempuh" aria-valuemin="${MINV}" aria-valuemax="${MAX}">
          <path d="${arc(A0, A1, R)}" fill="none" stroke="#eceae4" stroke-width="14" stroke-linecap="round"/>
          <path class="sp-arc" d="${arc(A0, A1, R)}" fill="none" stroke="url(#spg)" stroke-width="14" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
          <defs><linearGradient id="spg" x1="0" x2="1"><stop offset="0" stop-color="#0d9f66"/><stop offset=".68" stop-color="#111114"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs>
          ${ticks}
          <text class="sp-t" x="150" y="106" style="font-size:10px;letter-spacing:.1em">x1.000 KM</text>
          <g class="sp-needle" style="transform:rotate(-135deg)">
            <path d="M146 160L150 50L154 160Z" fill="#0d9f66"/>
          </g>
          <circle cx="150" cy="150" r="12" fill="#111114"/><circle cx="150" cy="150" r="4" fill="#ffffff"/>
        </svg>

        <div class="odo-edit">
          <label class="odo-box">
            <input id="kmInput" type="text" inputmode="numeric" aria-label="Ketik jarak tempuh dalam kilometer" value="${spec.km.toLocaleString("id-ID")}">
            <span class="unit">KM</span>
          </label>
          <span class="odo-tip">Putar spidometer atau ketik langsung</span>
        </div>

        <div class="speedo-ctl">
          <div class="step-btns">
            <button type="button" aria-label="Kurangi 5.000 km" data-d="-5000">${MINUS}</button>
            <button type="button" aria-label="Tambah 5.000 km" data-d="5000">${PLUS}</button>
          </div>
          <div class="quick">
            ${[15000, 45000, 90000, 150000].map(q => `<button type="button" class="chip sm" data-q="${q}">${q/1000} rb km</button>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `);
  const speedo = w.querySelector(".speedo");
  const svg = w.querySelector("svg");
  const needle = w.querySelector(".sp-needle");
  const arcActive = w.querySelector(".sp-arc");
  const kmInput = w.querySelector("#kmInput");
  let v = clamp(spec.km, MINV, MAX);

  const renderDial = (val, syncInput = true) => {
    const cl = clamp(val, 0, MAX);
    needle.style.transform = `rotate(${angleOf(cl)}deg)`;
    arcActive.style.strokeDashoffset = String(1 - cl / MAX);
    w.querySelector("[data-v]").textContent = Math.round(val).toLocaleString("id-ID") + " km";
    svg.setAttribute("aria-valuenow", Math.round(val));
    if (syncInput) kmInput.value = Math.round(val).toLocaleString("id-ID");
  };

  const set = (val, emit = true, syncInput = true) => {
    val = clamp(Math.round(val), MINV, MAX);
    if (val === v && syncInput) { renderDial(v, true); return; }
    v = val;
    renderDial(v, syncInput);
    if (emit) onChange("km", v);
  };

  kmInput.addEventListener("input", () => {
    const raw = Number(kmInput.value.replace(/\D/g, "")) || 0;
    const cl = clamp(raw, 0, MAX);
    v = clamp(raw, MINV, MAX);
    renderDial(cl, false);
    onChange("km", v);
  });

  kmInput.addEventListener("blur", () => {
    kmInput.value = v.toLocaleString("id-ID");
    renderDial(v, false);
  });

  let dragging = false;
  const fromPointer = (e) => {
    const r = svg.getBoundingClientRect();
    const k = r.width / 300;
    const dx = e.clientX - (r.left + CX * k), dy = e.clientY - (r.top + CY * k);
    const ang = clamp((Math.atan2(dx, -dy) * 180) / Math.PI, A0, A1);
    const rounded = Math.round((((ang - A0) / (A1 - A0)) * MAX) / 1000) * 1000;
    set(rounded, true, true);
  };
  svg.addEventListener("pointerdown", (e) => { dragging = true; speedo.classList.add("drag"); svg.setPointerCapture(e.pointerId); fromPointer(e); });
  svg.addEventListener("pointermove", (e) => { if (dragging) fromPointer(e); });
  const stop = () => { dragging = false; speedo.classList.remove("drag"); };
  svg.addEventListener("pointerup", stop);
  svg.addEventListener("pointercancel", stop);
  svg.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: -1000, ArrowDown: -1000, ArrowRight: 1000, ArrowUp: 1000, PageDown: -10000, PageUp: 10000 }[e.key];
    if (k) { e.preventDefault(); set(v + k); }
  });
  w.querySelectorAll(".step-btns button").forEach(b => b.addEventListener("click", () => set(v + Number(b.dataset.d))));
  w.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => set(Number(b.dataset.q))));
  setTimeout(() => renderDial(v, true), 200);
  return w;
}

/* ---------- Harga Iklan (Deal Checker) ---------- */
export function moneyWidget(initial, onChange) {
  const w = h(`
    <section class="w full">
      <div class="w-head"><h3>7. Harga Iklan Penjual</h3><span class="val">Nominal di iklan</span></div>
      <div class="price-in">
        <label class="money"><span>Rp</span><input id="adPriceInput" inputmode="numeric" autocomplete="off" aria-label="Harga iklan dalam Rupiah"></label>
        <div class="quick">${[-50, -10, 10, 50].map(d => `<button type="button" class="chip sm" data-d="${d}">${d > 0 ? "+" : "−"} ${Math.abs(d)} jt</button>`).join("")}</div>
      </div>
    </section>
  `);
  const input = w.querySelector("input");
  let value = initial;
  const show = () => { input.value = value ? value.toLocaleString("id-ID") : ""; };
  input.addEventListener("input", () => {
    value = Number(input.value.replace(/\D/g, "")) || 0;
    show();
    onChange(value);
  });
  w.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
    value = Math.max(5_000_000, value + Number(c.dataset.d) * 1_000_000);
    show();
    onChange(value);
  }));
  show();
  return w;
}

export function buildSpecForm(container, meta, spec, onChange) {
  container.innerHTML = "";
  const set = (k, v) => { spec[k] = v; onChange(k, v); };
  [brandAndModelWidget, yearWidget, transmisiWidget, fuelWidget, wilayahWidget, kmWidget].forEach(f => container.appendChild(f(meta, spec, set)));
}
