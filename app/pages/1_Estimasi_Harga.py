import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Tambahkan path utils langsung (fix import)
_utils_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'utils'))
if _utils_dir not in sys.path:
    sys.path.insert(0, _utils_dir)
from model_loader import load_models_and_meta
from predictor import predict_car_price
from visualizer import create_price_gauge

st.set_page_config(page_title="Estimasi Harga - TakarMobil", page_icon="🔍", layout="wide")

# Header
st.title("🔍 Estimasi Rentang Harga Pasar Mobil Bekas")
st.write("Masukkan spesifikasi kendaraan yang ingin ditaksir untuk mendapatkan estimasi nilai pasar wajar dan rentang toleransi harga.")

# Load Model
try:
    data_bundle = load_models_and_meta()
    model = data_bundle['model_xgb']
    meta = data_bundle['metadata']
except Exception as e:
    st.error(f"Gagal memuat model: {e}")
    st.stop()

# Form Input Spesifikasi Mobil
st.divider()

col_form, col_result = st.columns([1, 1], gap="large")

with col_form:
    st.subheader("📋 Spesifikasi Kendaraan")
    
    col1, col2 = st.columns(2)
    with col1:
        merek = st.selectbox("1. Merek Mobil", options=meta['brands'], index=0)
    with col2:
        tahun = st.slider("2. Tahun Produksi", min_value=1995, max_value=2025, value=2020)
        
    col3, col4 = st.columns(2)
    with col3:
        transmisi = st.selectbox("3. Transmisi", options=meta['transmisi_list'], index=0)
    with col4:
        bahan_bakar = st.selectbox("4. Bahan Bakar", options=meta['bahan_bakar_list'], index=0)
        
    col5, col6 = st.columns(2)
    with col5:
        wilayah = st.selectbox("5. Wilayah (Jabodetabek)", options=meta['wilayah_list'], index=3) # Default Jakarta
    with col6:
        km = st.number_input("6. Jarak Tempuh (Kilometer)", min_value=1000, max_value=300000, value=45000, step=5000)

    usia_calc = 2025 - tahun
    st.caption(f"ℹ️ Usia estimasi kendaraan: **{usia_calc} tahun** pada tahun acuan 2025.")
    
    btn_predict = st.button("🚀 Hitung Estimasi Harga Pasar", type="primary", use_container_width=True)

with col_result:
    st.subheader("🎯 Hasil Taksiran Harga Pasar")
    
    if btn_predict:
        res = predict_car_price(
            model=model,
            merek=merek,
            tahun=tahun,
            km=km,
            transmisi=transmisi,
            bahan_bakar=bahan_bakar,
            wilayah=wilayah
        )
        
        pred_p = res['predicted_price']
        low_p = res['lower_bound']
        up_p = res['upper_bound']
        
        # Kartu Nilai Estimasi
        st.markdown(f"""
        <div style="background-color: #EFF6FF; border-left: 6px solid #2563EB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #64748B; margin: 0; font-size: 0.95rem; font-weight: 600;">ESTIMASI NILAI PASAR RATIO (MEDIAN)</p>
            <h1 style="color: #1E3A8A; margin: 5px 0 10px 0; font-size: 2.3rem;">Rp {pred_p:,.0f}</h1>
            <p style="color: #475569; margin: 0; font-size: 0.9rem;">
                Rentang Wajar Pasar (&plusmn;15%): <b style="color: #0F172A;">Rp {low_p:,.0f} &mdash; Rp {up_p:,.0f}</b>
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Gauge Chart Interaktif
        fig_gauge = create_price_gauge(pred_p, low_p, up_p)
        st.plotly_chart(fig_gauge, use_container_width=True)
        
        # Detail Catatan Pasar
        st.markdown("""
        **💡 Panduan Rentang Harga:**
        - **Bawah Rentang (< Rp {:.0f} Jt):** Kesepakatan sangat hemat, periksa apakah ada catatan PR perbaikan.
        - **Tengah Rentang (Rp {:.0f} &ndash; {:.0f} Jt):** Harga pasar paling ideal untuk kondisi fisik terawat dan siap pakai.
        - **Atas Rentang (> Rp {:.0f} Jt):** Wajar bila kondisi unit seperti baru (*mint condition*), kilometer sangat rendah, atau pajak panjang.
        """.format(low_p/1e6, low_p/1e6, up_p/1e6, up_p/1e6))
        
    else:
        st.info("👈 Lengkapi spesifikasi mobil di sebelah kiri lalu klik tombol **'Hitung Estimasi Harga Pasar'**.")
        
        st.markdown("""
        #### 🌟 Contoh Skenario:
        - **Mobil Keluarga LCGC:** Daihatsu Sigra / Toyota Calya 2021 (~Rp 110–135 Juta).
        - **MPV Favorit:** Toyota Avanza / Suzuki Ertiga 2019 (~Rp 150–190 Juta).
        - **Sedan Mewah:** Mercedes-Benz C200 2016 (~Rp 400–550 Juta).
        """)
