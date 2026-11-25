"""
TakarMobil - backend FastAPI.

Menyajikan frontend statis (web/static), media (video + logo) dan API prediksi
yang memakai model XGBoost hasil training (dengan fitur Model_Clean).

Jalankan dari root proyek:
    python -m uvicorn web.server:app --reload --port 8000
"""
import json
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"
MEDIA_DIR = ROOT / "media"
STATIC_DIR = Path(__file__).resolve().parent / "static"

TAHUN_ACUAN = 2025
TOLERANSI = 0.15


@lru_cache(maxsize=1)
def load_bundle():
    """Memuat model, metadata fitur & model per merek, serta laporan evaluasi."""
    with open(MODELS_DIR / "feature_metadata.json", encoding="utf-8") as f:
        meta = json.load(f)
    report = {}
    report_path = MODELS_DIR / "evaluation_report.json"
    if report_path.exists():
        with open(report_path, encoding="utf-8") as f:
            report = json.load(f)
    model = joblib.load(MODELS_DIR / "xgboost_model.joblib")
    return {"model": model, "meta": meta, "report": report}


class CarSpec(BaseModel):
    merek: str
    model: str = ""
    varian: str = ""
    tahun: int = Field(ge=1995, le=TAHUN_ACUAN)
    km: float = Field(ge=0, le=500000)
    transmisi: str
    bahan_bakar: str
    wilayah: str


class DealRequest(CarSpec):
    harga_iklan: float = Field(gt=0)


def resolve_model_name(merek: str, tipe: str, meta: dict) -> str:
    """Memastikan nama tipe mobil valid untuk merek terpilih."""
    items = meta.get("models_by_brand", {}).get(merek, [])
    names = [it["name"] for it in items]
    if not names:
        return tipe or "Lainnya"
    if tipe and tipe in names:
        return tipe
    low = (tipe or "").strip().lower()
    for n in names:
        if n.lower() == low:
            return n
    return names[0]


def resolve_varian_name(merek: str, model_clean: str, varian: str, meta: dict) -> str:
    """Memastikan varian valid untuk pasangan merek+model, default ke varian paling umum."""
    items = meta.get("variants_by_model", {}).get(f"{merek}||{model_clean}", [])
    names = [it["name"] for it in items]
    if not names:
        return varian.strip() if varian else "Standar"
    if varian and varian in names:
        return varian
    low = (varian or "").strip().lower()
    for n in names:
        if n.lower() == low:
            return n
    return names[0]


def check_choices(spec: CarSpec) -> tuple[str, str]:
    meta = load_bundle()["meta"]
    checks = [
        ("merek", spec.merek, meta["brands"]),
        ("transmisi", spec.transmisi, meta["transmisi_list"]),
        ("bahan_bakar", spec.bahan_bakar, meta["bahan_bakar_list"]),
        ("wilayah", spec.wilayah, meta["wilayah_list"]),
    ]
    for name, value, allowed in checks:
        if value not in allowed:
            raise HTTPException(422, f"Nilai '{value}' tidak valid untuk {name}.")
    model_clean = resolve_model_name(spec.merek, spec.model, meta)
    varian_clean = resolve_varian_name(spec.merek, model_clean, spec.varian, meta)
    return model_clean, varian_clean


def predict_price(spec: CarSpec, model_clean: str, varian_clean: str) -> dict:
    """Input -> DataFrame -> model XGBoost (log harga) -> expm1 -> Rupiah."""
    model = load_bundle()["model"]
    usia = TAHUN_ACUAN - spec.tahun
    frame = pd.DataFrame([{
        "Usia_Mobil": int(usia),
        "KM_Clean": float(spec.km),
        "KM_hilang": 0,
        "Merek_Clean": spec.merek,
        "Model_Clean": model_clean,
        "Varian_Clean": varian_clean,
        "Transmisi_Clean": spec.transmisi,
        "Bahan_Bakar_Clean": spec.bahan_bakar,
        "Wilayah": spec.wilayah,
    }])
    price = float(np.expm1(model.predict(frame)[0]))
    return {
        "harga": price,
        "batas_bawah": price * (1 - TOLERANSI),
        "batas_atas": price * (1 + TOLERANSI),
        "usia": usia,
        "model": model_clean,
        "varian": varian_clean,
    }


def judge_deal(ad_price: float, market_price: float) -> dict:
    diff = ad_price - market_price
    pct = diff / market_price * 100
    if pct < -20:
        level, verdict, tone = 0, "Sangat murah", "good"
        note = "Jauh di bawah estimasi pasar (>20% lebih hemat). Pastikan kelengkapan surat, riwayat bebas banjir, dan kondisi rangka."
    elif pct < -5:
        level, verdict, tone = 1, "Murah", "good"
        note = "Lebih hemat 5–20% dari estimasi pasar wajar. Penawaran menarik bagi pembeli."
    elif pct <= 5:
        level, verdict, tone = 2, "Wajar", "fair"
        note = "Selaras dengan nilai pasar saat ini dalam batas wajar (±5%)."
    elif pct <= 20:
        level, verdict, tone = 3, "Agak mahal", "warn"
        note = "5–20% di atas estimasi pasar. Masih ada ruang negosiasi harga."
    else:
        level, verdict, tone = 4, "Sangat mahal", "bad"
        note = "Lebih dari 20% di atas pasar. Pastikan ada keunggulan khusus (kilometer sangat rendah atau unit terawat istimewa)."
    return {
        "level": level,
        "verdict": verdict,
        "tone": tone,
        "catatan": note,
        "selisih": diff,
        "selisih_persen": pct,
    }


app = FastAPI(title="TakarMobil API", docs_url="/api/docs", redoc_url=None, openapi_url="/api/openapi.json")


@app.get("/api/meta")
def api_meta():
    bundle = load_bundle()
    meta, report = bundle["meta"], bundle["report"]
    rows = report.get("metrics_table", [])
    xgb_row = next((r for r in rows if r.get("Model") == "XGBoost"), {})
    return {
        "brands": meta["brands"],
        "models_by_brand": meta.get("models_by_brand", {}),
        "variants_by_model": meta.get("variants_by_model", {}),
        "wilayah": meta["wilayah_list"],
        "wilayah_counts": meta.get("wilayah_counts", {}),
        "transmisi": meta["transmisi_list"],
        "bahan_bakar": meta["bahan_bakar_list"],
        "tahun_acuan": TAHUN_ACUAN,
        "total_data": meta["total_clean_samples"],
        "train_data": meta["train_samples"],
        "test_data": meta["test_samples"],
        "model_terbaik": "XGBoost Regressor",
        "r2": xgb_row.get("R² Score", report.get("best_r2")),
        "mae": xgb_row.get("MAE (Rupiah)", report.get("best_mae")),
        "rmse": xgb_row.get("RMSE (Rupiah)", report.get("best_rmse")),
    }


@app.post("/api/predict")
def api_predict(spec: CarSpec):
    model_clean, varian_clean = check_choices(spec)
    return predict_price(spec, model_clean, varian_clean)


@app.post("/api/deal")
def api_deal(req: DealRequest):
    model_clean, varian_clean = check_choices(req)
    pred = predict_price(req, model_clean, varian_clean)
    return {**pred, **judge_deal(req.harga_iklan, pred["harga"]), "harga_iklan": req.harga_iklan}


@app.post("/api/curve")
def api_curve(spec: CarSpec):
    """Kurva estimasi harga mobil untuk rentang tahun produksi."""
    model_clean, varian_clean = check_choices(spec)
    model = load_bundle()["model"]
    years = list(range(max(2005, TAHUN_ACUAN - 20), TAHUN_ACUAN + 1))
    frame = pd.DataFrame([{
        "Usia_Mobil": TAHUN_ACUAN - y,
        "KM_Clean": float(spec.km),
        "KM_hilang": 0,
        "Merek_Clean": spec.merek,
        "Model_Clean": model_clean,
        "Varian_Clean": varian_clean,
        "Transmisi_Clean": spec.transmisi,
        "Bahan_Bakar_Clean": spec.bahan_bakar,
        "Wilayah": spec.wilayah,
    } for y in years])
    prices = np.expm1(model.predict(frame))
    return [{"tahun": y, "harga": float(p)} for y, p in zip(years, prices)]


@app.get("/api/importance")
def api_importance():
    return load_bundle()["report"].get("top_features", [])


@app.get("/api/evaluation")
def api_evaluation():
    return load_bundle()["report"].get("metrics_table", [])


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/{page:path}", include_in_schema=False)
def spa(page: str):
    if page.startswith("api/"):
        raise HTTPException(404)
    return FileResponse(STATIC_DIR / "index.html")
