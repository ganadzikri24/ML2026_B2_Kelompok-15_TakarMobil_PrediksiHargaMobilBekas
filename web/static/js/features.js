// Halaman fitur: Estimasi, Deal Checker, Faktor Harga, Tentang Model, dan Beranda.
import { $, $$, rp, jt, countUp, spec, api, loadMeta, logoUrl, clamp, reduced, carLoadingHTML } from "./util.js";
import { buildSpecForm, moneyWidget } from "./widgets.js";

const wait = (ms) => new Promise(r => setTimeout(r, ms));

function runLoaderStages(subEl, steps) {
  let i = 0;
  const id = setInterval(() => {
    i++;
    if (subEl && steps[i]) subEl.textContent = steps[i];
  }, 1400);
  return () => clearInterval(id);
}

function summaryChips(box) {
  box.innerHTML = [
    `<span class="sum-chip"><i class="lg" style="--src:url(${logoUrl(spec.merek)})"></i><b>${spec.merek} ${spec.model}</b></span>`,
    `<span class="sum-chip"><b>${spec.tahun}</b></span>`,
    `<span class="sum-chip"><b>${spec.transmisi}</b></span>`,
    `<span class="sum-chip"><b>${spec.bahan_bakar}</b></span>`,
    `<span class="sum-chip"><b>${spec.wilayah}</b></span>`,
    `<span class="sum-chip"><b>${spec.km.toLocaleString("id-ID")}</b> km</span>`,
  ].join("");
}

function curveSVG(points, year) {
  const W = 420, H = 152, L = 8, R = 8, T = 14, B = 26;
  const xs = points.map(p => p.tahun), ys = points.map(p => p.harga);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const lo = Math.min(...ys) * 0.9, hi = Math.max(...ys) * 1.06;
  const X = (t) => L + ((t - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const d = points.map((p, i) => `${i ? "L" : "M"}${X(p.tahun).toFixed(1)} ${Y(p.harga).toFixed(1)}`).join("");
  const me = points.find(p => p.tahun === clamp(year, x0, x1));
  const labels = [x0, Math.round((x0 + x1) / 2), x1].map(t =>
    `<text class="ax" x="${X(t)}" y="${H - 6}" text-anchor="${t === x0 ? "start" : t === x1 ? "end" : "middle"}">${t}</text>`
  ).join("");
  return `<svg viewBox="0 0 ${W} ${H}" aria-label="Kurva depresiasi per tahun produksi">
    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d9f66" stop-opacity=".22"/><stop offset="1" stop-color="#0d9f66" stop-opacity="0"/></linearGradient></defs>
    <path class="area" d="${d}L${X(x1)} ${H - B}L${X(x0)} ${H - B}Z"/>
    <path class="ln" pathLength="1" d="${d}"/>
    ${labels}
    ${me ? `<circle class="me" cx="${X(me.tahun).toFixed(1)}" cy="${Y(me.harga).toFixed(1)}" r="6"/>` : ""}</svg>`;
}

/* ============ ESTIMASI ============ */
export async function mountEstimator() {
  const meta = await loadMeta();
  const builder = $("#estBuilder"), res = $("#estResult"), go = $("#eGo");
  let busy = false;

  res.hidden = true;
  res.innerHTML = "";

  async function calc() {
    if (busy) return;
    busy = true;
    go.disabled = true;
    go.innerHTML = '<span class="spin"></span> Memproses estimasi...';

    res.hidden = false;
    res.innerHTML = `
      <div class="res-head"><h3>Hasil taksiran</h3><span class="live on"><i></i><span>MEMPROSES</span></span></div>
      <div class="res-body">
        <div class="summary" id="eSum"></div>
        <div id="eOut">${carLoadingHTML(`Membaca spesifikasi ${spec.merek} ${spec.model} (${spec.tahun})...`)}</div>
      </div>
    `;
    summaryChips($("#eSum"));
    res.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const stopStages = runLoaderStages($("#loaderSub"), [
      `Membaca spesifikasi ${spec.merek} ${spec.model} (${spec.tahun})...`,
      `Mencocokkan pola harga pasar di ${spec.wilayah}...`,
      `Menghitung valuasi akhir model XGBoost...`,
    ]);

    const snap = { ...spec };
    try {
      const [[p, curve]] = await Promise.all([
        Promise.all([api("predict", snap), api("curve", snap)]),
        wait(4200),
      ]);
      stopStages();
      const out = $("#eOut");
      res.querySelector(".live span").textContent = "SELESAI";
      out.innerHTML = `
        <div class="price-box fade-up"><small>Estimasi pasar wajar · ${snap.merek} ${p.model}</small><div class="price"><span class="rp">Rp</span><span id="pNum">0</span></div></div>
        <div class="range fade-up d1" id="pRange">
          <div class="range-rail"><div class="range-span"></div><div class="range-dot"></div></div>
          <div class="range-ends"><div><small>Batas bawah (−15%)</small><b id="pLo"></b></div><div><small>Batas atas (+15%)</small><b id="pHi"></b></div></div>
        </div>
        <div class="curve fade-up d2" id="pCurve"><h4>Nilai estimasi per tahun produksi</h4><div id="pCurveSvg">${curveSVG(curve, snap.tahun)}</div></div>
        <p class="note fade-up d3">Rentang ±15% digunakan sebagai batas negosiasi wajar. Rata-rata selisih absolut XGBoost pada data uji sekitar Rp ${Math.round(meta.mae / 1e6)} juta.</p>
      `;
      requestAnimationFrame(() => {
        $("#pRange").classList.add("go");
        $("#pCurve").classList.add("go");
      });
      countUp($("#pNum"), 0, p.harga, 1100);
      $("#pLo").textContent = jt(p.batas_bawah);
      $("#pHi").textContent = jt(p.batas_atas);
    } catch (e) {
      stopStages();
      res.querySelector(".live")?.classList.remove("on");
      $("#eOut").innerHTML = `<div class="err">${e.message}</div>`;
    } finally {
      busy = false;
      go.disabled = false;
      go.textContent = "Takar ulang harga";
    }
  }

  go.addEventListener("click", calc);
  builder.addEventListener("submit", (e) => { e.preventDefault(); calc(); });
  builder.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.target.closest(".combobox[data-open='true']")) {
      e.preventDefault();
      calc();
    }
  });
  buildSpecForm(builder, meta, spec, () => {
    const s = $("#eSum");
    if (s) summaryChips(s);
  });
}

/* ============ DEAL CHECKER ============ */
export async function mountDeal() {
  const meta = await loadMeta();
  const builder = $("#dealBuilder"), res = $("#dealResult"), go = $("#dGo");
  let price = 175_000_000, busy = false;

  res.hidden = true;
  res.innerHTML = "";

  const zones = ["#0d9f66", "#34d399", "#111114", "#d97706", "#dc2626"];
  const pt = (a, r) => { const t = (a * Math.PI) / 180; return [150 + r * Math.sin(t), 150 - r * Math.cos(t)]; };
  const arc = (a0, a1, r) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const meterSVG = `<svg viewBox="0 -14 300 184" aria-hidden="true">
    ${zones.map((c, i) => `<path d="${arc(-90 + 36 * i + 2, -90 + 36 * (i + 1) - 2, 118)}" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round" opacity=".92"/>`).join("")}
    <text class="m-lab" x="28" y="170">MURAH</text><text class="m-lab" x="150" y="-2">WAJAR</text><text class="m-lab" x="272" y="170">MAHAL</text>
    <g class="m-needle" id="mNeedle"><path d="M146 158L150 50L154 158Z" fill="#111114"/></g>
    <circle cx="150" cy="150" r="13" fill="#0d9f66"/><circle cx="150" cy="150" r="4.5" fill="#ffffff"/></svg>`;
  const bounds = [[-40, -20], [-20, -5], [-5, 5], [5, 20], [20, 40]];
  const needleAngle = (pct, level) => {
    const [a, b] = bounds[level];
    return -90 + 36 * level + 36 * clamp((pct - a) / (b - a), 0, 1);
  };

  async function calc() {
    if (!price || busy) return;
    busy = true;
    go.disabled = true;
    go.innerHTML = '<span class="spin"></span> Menganalisis iklan...';

    res.hidden = false;
    res.innerHTML = `
      <div class="res-head"><h3>Vonis harga iklan</h3><span class="live on"><i></i><span>MENGANALISIS</span></span></div>
      <div class="res-body">
        <div class="summary" id="dSum"></div>
        <div id="dOut">${carLoadingHTML(`Memeriksa iklan ${spec.merek} ${spec.model}...`)}</div>
      </div>
    `;
    summaryChips($("#dSum"));
    res.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const stopStages = runLoaderStages($("#loaderSub"), [
      `Memeriksa iklan ${spec.merek} ${spec.model} (${spec.tahun})...`,
      `Membandingkan dengan harga wajar di ${spec.wilayah}...`,
      `Menyiapkan vonis kewajaran harga...`,
    ]);

    try {
      const [d] = await Promise.all([
        api("deal", { ...spec, harga_iklan: price }),
        wait(4200),
      ]);
      stopStages();
      const out = $("#dOut");
      res.querySelector(".live span").textContent = "SELESAI";
      out.innerHTML = `
        <div class="meter fade-up">${meterSVG}</div>
        <div class="verdict fade-up d1" id="dVerdict" data-tone="${d.tone}"><b id="dWord">${d.verdict}</b><span id="dPct"></span></div>
        <div class="cmp fade-up d2">
          <div class="cmp-row"><div><span>Harga iklan</span><b id="cAd">Rp ${rp(d.harga_iklan)}</b></div><div class="cmp-bar"><i class="ad" id="bAd"></i></div></div>
          <div class="cmp-row"><div><span>Estimasi pasar (${d.model})</span><b id="cMk">Rp ${rp(d.harga)}</b></div><div class="cmp-bar"><i id="bMk"></i></div></div>
        </div>
        <p class="note fade-up d3" id="dNote"></p>
      `;
      const toneColor = { good: "var(--good)", fair: "var(--ink)", warn: "var(--warn)", bad: "var(--bad)" }[d.tone];
      const sign = d.selisih_persen > 0 ? "+" : "";
      $("#dPct").textContent = `${sign}${d.selisih_persen.toFixed(1).replace(".", ",")}% dari harga pasar`;
      const mx = Math.max(d.harga_iklan, d.harga) * 1.05;
      requestAnimationFrame(() => {
        $("#bAd").style.setProperty("--ad", toneColor);
        $("#bAd").style.width = (d.harga_iklan / mx) * 100 + "%";
        $("#bMk").style.width = (d.harga / mx) * 100 + "%";
        $("#mNeedle").style.transform = `rotate(${needleAngle(d.selisih_persen, d.level)}deg)`;
      });
      const diff = Math.abs(d.selisih);
      $("#dNote").textContent = `${d.catatan} Selisih nominal Rp ${rp(diff)} ${d.selisih > 0 ? "lebih tinggi" : "lebih rendah"} dari taksiran. Rentang wajar: ${jt(d.batas_bawah)} s.d. ${jt(d.batas_atas)}.`;
    } catch (e) {
      stopStages();
      res.querySelector(".live")?.classList.remove("on");
      $("#dOut").innerHTML = `<div class="err">${e.message}</div>`;
    } finally {
      busy = false;
      go.disabled = false;
      go.textContent = "Cek ulang harga iklan";
    }
  }

  go.addEventListener("click", calc);
  builder.addEventListener("submit", (e) => { e.preventDefault(); calc(); });
  builder.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.target.closest(".combobox[data-open='true']")) {
      e.preventDefault();
      calc();
    }
  });
  buildSpecForm(builder, meta, spec, () => {
    const s = $("#dSum");
    if (s) summaryChips(s);
  });
  builder.appendChild(moneyWidget(price, (v) => { price = v; }));
}

/* ============ FAKTOR HARGA ============ */
function featureName(f) {
  const m = f.match(/^(Merek|Model|Bahan_Bakar|Transmisi|Wilayah)_Clean_(.+)$/) || f.match(/^(Wilayah)_(.+)$/);
  if (m) return { Merek: "Merek ", Model: "Tipe ", Bahan_Bakar: "Bahan bakar ", Transmisi: "Transmisi ", Wilayah: "Wilayah " }[m[1]] + m[2];
  return { Tahun_Num: "Tahun produksi", KM_Clean: "Jarak tempuh", Usia_Mobil: "Usia mobil" }[f] || f;
}
const pct = (x) => (x * 100).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

export async function mountImportance() {
  const data = await api("importance");
  const max = Math.max(...data.map(d => d["XGBoost Importance"]));
  const box = $("#impBars");
  box.innerHTML = data.map(d =>
    `<div class="bar-row"><span class="nm">${featureName(d.Feature)}</span><div class="tr"><i data-w="${(d["XGBoost Importance"] / max) * 100}"></i></div><span class="pc">${pct(d["XGBoost Importance"])}</span></div>`
  ).join("");
  requestAnimationFrame(() => setTimeout(() => $$("i[data-w]", box).forEach((i, n) => setTimeout(() => (i.style.width = i.dataset.w + "%"), reduced ? 0 : n * 65)), 120));

  const get = (k) => data.find(d => d.Feature === k)?.["XGBoost Importance"] ?? 0;
  const merek = data.filter(d => d.Feature.startsWith("Merek_")).reduce((s, d) => s + d["XGBoost Importance"], 0);
  const modelShare = data.filter(d => d.Feature.startsWith("Model_")).reduce((s, d) => s + d["XGBoost Importance"], 0);
  $("#impInsights").innerHTML = [
    ["Segmen merek tetap paling dominan", `Fitur merek bersama menyumbang ${pct(merek)} (Mercedes-Benz sendiri ${pct(get("Merek_Clean_Mercedes-Benz"))}) karena kelas harga mobil mewah terpisah jauh dari merek massal.`],
    ["Tipe mobil (Model_Clean) memecah kelas harga", `Varian seperti Alphard (${pct(get("Model_Clean_Alphard"))}), CR-V, Jimny, G-Class, dan HR-V langsung membedakan segmen mobil di dalam satu merek yang sama (total top tipe: ${pct(modelShare)}).`],
    ["Bahan bakar & transmisi sebagai pembeda", `Bensin (${pct(get("Bahan_Bakar_Clean_Bensin"))}), diesel, dan transmisi membedakan nilai jual antar varian mesin serta preferensi pasar Jabodetabek.`],
    ["Tahun & kilometer mengatur depresiasi", `Setelah merek dan tipe menetapkan kelas dasar kendaraan, tahun produksi dan jarak tempuh menggeser nilai depresiasinya secara konsisten.`],
  ].map(([t, p]) => `<article class="insight"><h3>${t}</h3><p>${p}</p></article>`).join("");
}

/* ============ TENTANG ============ */
export async function mountAbout() {
  const [ev, meta] = await Promise.all([api("evaluation"), loadMeta()]);
  const tb = $("#evalTable tbody");
  tb.innerHTML = ev.map((m) => {
    const r2 = m["R² Score"];
    const isXgb = m.Model === "XGBoost";
    return `<tr class="${isXgb ? "best" : ""}"><td>${m.Model}${isXgb ? ' <span class="tag-pick">Dipakai</span>' : ""}</td><td class="n">${jt(m["MAE (Rupiah)"])}</td><td class="n">${jt(m["RMSE (Rupiah)"])}</td><td><div class="r2"><i data-w="${r2 * 100}" style="max-width:120px"></i><span>${r2.toFixed(3).replace(".", ",")}</span></div></td></tr>`;
  }).join("");
  requestAnimationFrame(() => setTimeout(() => $$(".r2 i", tb).forEach(i => (i.style.width = i.dataset.w * 1.2 + "px")), 120));
  $("#dataPanel").innerHTML = `<div class="stack" style="gap:14px"><span class="eyebrow">Dataset &amp; validasi</span>
    <p class="lead" style="max-width:none">Dataset Iklan Mobil Bekas Indonesia (<a class="link" href="https://zenodo.org/records/17548894" target="_blank" rel="noopener">Zenodo 17548894</a>), dari scraping OLX dan Mobil123. Dari 17.670 baris mentah dilakukan penyaringan harga/merek/tahun, pemetaan kawasan Jabodetabek (termasuk label <code>% off</code>), perbaikan skala kilometer, serta deduplikasi URL &amp; iklan repost identik hingga tersisa <b>${meta.total_data.toLocaleString("id-ID")}</b> iklan unik (${meta.train_data.toLocaleString("id-ID")} train dan ${meta.test_data.toLocaleString("id-ID")} test).</p>
    <p class="lead" style="max-width:none">Split data memakai <b>StratifiedGroupKFold</b> (80:20) berbasis grup iklan kembar <i>(merek, tipe, tahun, harga)</i> serta imputasi median kilometer pasca-split khusus dari data latih agar nol kebocoran data, disertai validasi silang 5-Fold dan transformasi log(1 + harga).</p></div>`;
}

/* ============ BERANDA ============ */
export async function initHome() {
  const meta = await loadMeta();
  const viz = $("#vizBrands");
  if (viz && !viz.children.length) {
    viz.innerHTML = meta.brands.map(b =>
      `<i style="--src:url(${logoUrl(b)});${b === "Daihatsu" ? "width:64px;aspect-ratio:6.4/1;align-self:center" : ""}"></i>`
    ).join("");
  }
  const proof = $("#proof");
  proof.innerHTML = [
    [meta.total_data, "iklan bersih dianalisis", n => rp(n)],
    [meta.r2, "R² XGBoost (dengan fitur tipe)", n => n.toFixed(3).replace(".", ",")],
    [meta.mae, "rata-rata selisih taksiran (MAE)", n => "Rp " + Math.round(n / 1e6) + " jt"],
    [Object.values(meta.models_by_brand || {}).reduce((s, a) => s + a.length, 0), "tipe spesifik di 5 merek utama", n => String(Math.round(n))],
  ].map(([v, l]) => `<div class="pf"><b data-to="${v}">0</b><span>${l}</span></div>`).join("");
  const fmts = [n => rp(n), n => n.toFixed(3).replace(".", ","), n => "Rp " + Math.round(n / 1e6) + " jt", n => String(Math.round(n))];
  let ran = false;
  const runProof = () => {
    if (ran) return;
    ran = true;
    io.disconnect();
    removeEventListener("scroll", onScroll);
    $$("[data-to]", proof).forEach((el, i) => countUp(el, 0, Number(el.dataset.to), 1400, fmts[i]));
  };
  const onScroll = () => {
    const r = proof.getBoundingClientRect();
    if (r.top < innerHeight * 0.94) runProof();
  };
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) runProof(); }, { threshold: 0.1 });
  io.observe(proof);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
