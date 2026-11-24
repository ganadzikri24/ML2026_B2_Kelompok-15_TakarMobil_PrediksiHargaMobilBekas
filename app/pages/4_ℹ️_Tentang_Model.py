import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Tambahkan path root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.utils.model_loader import load_models_and_meta

st.set_page_config(page_title="Tentang Model & Metodologi - TakarMobil", page_icon="ℹ️", layout="wide")

st.title("ℹ️ Metodologi & Evaluasi Model Machine Learning")
st.write("Dokumentasi teknis perbandingan algoritma, dataset, serta arsitektur sistem proyek akhir Machine Learning **TakarMobil**.")

st.divider()

# Load Data
try:
    data_bundle = load_models_and_meta()
    eval_rep = data_bundle['eval_report']
    meta = data_bundle['metadata']
except Exception as e:
    st.error(f"Gagal memuat evaluasi: {e}")
    st.stop()

# --- 1. TABEL EVALUASI LENGKAP ---
st.subheader("📊 1. Hasil Evaluasi Perbandingan 4 Algoritma ML vs Baseline")
st.write("Sesuai **Ketentuan Dosen Poin 9**, seluruh model diuji secara independen pada data testing (3.346 mobil) yang tidak pernah dilihat saat pelatihan:")

if 'metrics_table' in eval_rep:
    df_metrics = pd.DataFrame(eval_rep['metrics_table'])
    
    # Format Tampilan
    df_display = df_metrics.copy()
    df_display['MAE'] = df_display['MAE (Rupiah)'].apply(lambda x: f"Rp {x:,.0f}")
    df_display['RMSE'] = df_display['RMSE (Rupiah)'].apply(lambda x: f"Rp {x:,.0f}")
    df_display['MSE'] = df_display['MSE (Rupiah)'].apply(lambda x: f"{x:.2e}")
    df_display['R² Score'] = df_display['R² Score'].apply(lambda x: f"{x:.4f} ({x*100:.1f}%)")
    
    st.dataframe(
        df_display[['Model', 'MAE', 'RMSE', 'MSE', 'R² Score']],
        use_container_width=True,
        hide_index=True
    )
    
    st.caption("🏆 **XGBoost Regressor** terpilih sebagai model terbaik karena menghasilkan akurasi tertinggi ($R^2 = 69.3\%$) dan rata-rata galat terendah.")

st.divider()

# --- 2. PIPELINE & ARSITEKTUR ---
st.subheader("⚙️ 2. Arsitektur Alur Sistem (*Input &rarr; Process &rarr; Output*)")

col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("""
    #### 1. Input Pengguna
    - Merek Kendaraan (5 Merek)
    - Tahun Perakitan
    - Jarak Tempuh (Kilometer)
    - Transmisi (Manual / Matic)
    - Jenis Bahan Bakar
    - Wilayah Kota (Jabodetabek)
    """)
with col2:
    st.markdown("""
    #### 2. Proses Machine Learning
    - **Feature Engineering:** $2025 - \text{Tahun}$.
    - **Preprocessing Pipeline:**
      - Standard Scaler (Numerik)
      - One-Hot Encoding (Kategorik)
    - **XGBoost Model Inference:** Prediksi $\log(\text{Harga})$.
    - **Inverse Transform:** $\exp(\hat{y}) - 1$.
    """)
with col3:
    st.markdown("""
    #### 3. Output Sistem
    - **Estimasi Titik Tengah:** Nilai pasar wajar.
    - **Rentang Harga Wajar:** Interval $\pm 15\%$.
    - **Deal Checker Verdict:** Murah, Wajar, atau Kemahalan.
    - **Feature Importance:** Wawasan transparansi penentu harga.
    """)

st.divider()

# --- 3. DATASET & LITERATUR ---
st.subheader("📚 3. Sumber Dataset & Metodologi Ilmiah")
st.markdown("""
- **Dataset:** *Dataset Iklan Mobil Bekas Indonesia* ([Zenodo Record 17548894](https://zenodo.org/records/17548894)).
- **Volume Data:** 17.670 baris data mentah $\\rightarrow$ **16.799 baris data bersih** setelah filtering.
- **Skema Validasi:** `GroupShuffleSplit` (80% Train : 20% Test) berbasis grup merek/model kendaraan guna mencegah kebocoran data (*zero data leakage*), serta 5-Fold `GroupKFold` untuk *hyperparameter tuning*.
- **Target Transformation:** Menggunakan transformasi $\log(1 + \text{Harga})$ untuk menormalkan distribusi harga yang menceng ke kanan (*right-skewed*).
""")

st.divider()

# --- 4. IDENTITAS KELOMPOK ---
st.subheader("👥 4. Identitas Tim Pengembang")
st.markdown("""
**Mata Kuliah:** Pembelajaran Mesin (Machine Learning) - Semester 5  
**Kelas:** B2 · **Kelompok:** 15  

| No. | Nama Mahasiswa | NIM | Peran Utama |
|:---:|---|---|---|
| 1. | **Gana Dzikri** | *(NIM)* | Preprocessing, Feature Engineering & Git Repository |
| 2. | **(Anggota 2)** | *(NIM)* | Model Training, Hyperparameter Tuning & Evaluasi |
| 3. | **(Anggota 3)** | *(NIM)* | Implementasi Aplikasi Streamlit & Visualisasi Interaktif |
""")
