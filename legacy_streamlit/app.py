import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Tambahkan direktori utils langsung ke path (fix import)
_utils_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'utils'))
if _utils_dir not in sys.path:
    sys.path.insert(0, _utils_dir)
from model_loader import load_models_and_meta

# Konfigurasi Halaman Utama
st.set_page_config(
    page_title="TakarMobil - Estimasi & Deal Checker Mobil Bekas",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.4rem;
        font-weight: 800;
        color: #1E3A8A;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.15rem;
        color: #4B5563;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border-radius: 10px;
        padding: 20px;
        border: 1px solid #E2E8F0;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .badge-brand {
        display: inline-block;
        padding: 6px 14px;
        margin: 4px;
        background-color: #EFF6FF;
        color: #1D4ED8;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.95rem;
    }
</style>
""", unsafe_allow_html=True)

# Load Model & Metadata
try:
    data_bundle = load_models_and_meta()
    meta = data_bundle['metadata']
    eval_rep = data_bundle['eval_report']
    models_ready = True
except Exception as e:
    st.error(f"Gagal memuat model machine learning: {e}")
    models_ready = False

# --- HEADER SECTION ---
st.markdown('<div class="main-title">🚗 TakarMobil</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Sistem Cerdas Estimasi Rentang Harga Pasar, Pengecek Kewajaran Iklan (Deal Checker), dan Analisis Faktor Penentu Harga Mobil Bekas Berbasis Machine Learning untuk Wilayah Jabodetabek.</div>', unsafe_allow_html=True)

st.divider()

# --- STATISTIK CEPAT DATASET & MODEL ---
if models_ready:
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3 style="color:#2563EB; margin:0;">13.359</h3>
            <p style="color:#64748B; margin:5px 0 0 0; font-size:0.9rem;">Total Iklan Unik Dianalisis</p>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h3 style="color:#10B981; margin:0;">XGBoost</h3>
            <p style="color:#64748B; margin:5px 0 0 0; font-size:0.9rem;">Algoritma Utama (R² = 88.1% · MAE Rp 33,9 Jt)</p>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3 style="color:#F59E0B; margin:0;">Jabodetabek</h3>
            <p style="color:#64748B; margin:5px 0 0 0; font-size:0.9rem;">Cakupan Pasar Utama</p>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <h3 style="color:#8B5CF6; margin:0;">5 Merek</h3>
            <p style="color:#64748B; margin:5px 0 0 0; font-size:0.9rem;">Segmen Populer Indonesia</p>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# --- LAYANAN UTAMA TAKARMOBIL ---
st.subheader("💡 Fitur Unggulan TakarMobil")

col_a, col_b, col_c = st.columns(3)

with col_a:
    st.info("### 🔍 1. Estimasi Harga Pasar")
    st.write(r"""
    Prediksi nilai pasar mobil bekas secara akurat dan objektif berdasarkan spesifikasi kendaraan (Merek, Tahun Perakitan, Jarak Tempuh, Tipe Transmisi, Bahan Bakar, dan Wilayah Kota).
    - Menghasilkan nilai estimasi titik tengah.
    - Menampilkan interval batas bawah dan batas atas harga wajar ($\pm 15\%$).
    """)
    st.page_link("pages/1_Estimasi_Harga.py", label="👉 Buka Estimasi Harga", icon="🔍")

with col_b:
    st.success("### 🏷️ 2. Deal Checker Iklan")
    st.write(r"""
    Temukan iklan mobil bekas di OLX atau Mobil123? Cek langsung apakah penawaran penjual tergolong **Sangat Murah**, **Wajar**, atau **Kemahalan** (*Overpriced*).
    - Membandingkan harga iklan terhadap estimasi nilai pasar riil.
    - Memberikan rekomendasi negosiasi dan tips verifikasi fisik.
    """)
    st.page_link("pages/2_Deal_Checker.py", label="👉 Buka Deal Checker", icon="🏷️")

with col_c:
    st.warning("### 📊 3. Faktor Penentu Harga")
    st.write(r"""
    Ketahui komponen dan spesifikasi apa saja yang paling memengaruhi depresiasi dan pembentukan harga mobil bekas di pasar otomotif Jabodetabek.
    - Analisis tingkat pengaruh (*Feature Importance*).
    - Transparan dan dapat dipertanggungjawabkan secara ilmiah.
    """)
    st.page_link("pages/3_Feature_Importance.py", label="👉 Lihat Faktor Penentu", icon="📊")

st.divider()

# --- MEREK DIDUKUNG ---
st.subheader("🚘 5 Merek Utama yang Didukung")
st.write("Sistem dilatih secara spesifik menggunakan dataset komprehensif dari 5 merek mobil terpopuler di Indonesia:")

brands = ["🚗 Toyota", "🚙 Daihatsu", "🏎️ Honda", "🚐 Suzuki", "⭐ Mercedes-Benz"]
st.markdown("".join([f'<span class="badge-brand">{b}</span>' for b in brands]), unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# --- INFORMASI PROYEK AKADEMIK ---
with st.expander("📌 Informasi Tim & Mata Kuliah"):
    st.markdown("""
    **Mata Kuliah:** Pembelajaran Mesin (*Machine Learning*) - Semester 5  
    **Kelas:** B2 · **Kelompok:** 15  
    **Sumber Data:** Dataset Iklan Mobil Bekas Indonesia ([Zenodo Record 17548894](https://zenodo.org/records/17548894)) hasil scraping OLX & Mobil123.  
    **Algoritma:** XGBoost Regressor, Random Forest, Decision Tree, Ridge Regression vs Baseline Statistik.  
    *Disclaimer: Sistem ini ditujukan sebagai alat bantu estimasi harga pasar wajar berbasis data machine learning. Kondisi riil kendaraan (bebas tabrakan/banjir) tetap memerlukan inspeksi fisik langsung.*
    """)
