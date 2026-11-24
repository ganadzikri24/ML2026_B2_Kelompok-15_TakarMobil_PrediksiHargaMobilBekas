import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Tambahkan path root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.utils.model_loader import load_models_and_meta
from app.utils.predictor import predict_car_price, evaluate_deal

st.set_page_config(page_title="Deal Checker - TakarMobil", page_icon="🏷️", layout="wide")

# Header
st.title("🏷️ Deal Checker: Pengecek Kewajaran Harga Iklan")
st.write("Temukan iklan mobil bekas yang menarik di situs jual-beli online? Masukkan harga iklan untuk mengetahui apakah harga tersebut **Murah**, **Wajar**, atau **Kemahalan** (*Overpriced*).")

# Load Model
try:
    data_bundle = load_models_and_meta()
    model = data_bundle['model_xgb']
    meta = data_bundle['metadata']
except Exception as e:
    st.error(f"Gagal memuat model: {e}")
    st.stop()

st.divider()

col_input, col_verdict = st.columns([1, 1], gap="large")

with col_input:
    st.subheader("📝 Data Iklan Mobil yang Ditemukan")
    
    col1, col2 = st.columns(2)
    with col1:
        merek = st.selectbox("Merek Mobil", options=meta['brands'], index=0)
    with col2:
        tahun = st.slider("Tahun Perakitan", min_value=1995, max_value=2025, value=2019)
        
    col3, col4 = st.columns(2)
    with col3:
        transmisi = st.selectbox("Transmisi", options=meta['transmisi_list'], index=0)
    with col4:
        bahan_bakar = st.selectbox("Bahan Bakar", options=meta['bahan_bakar_list'], index=0)
        
    col5, col6 = st.columns(2)
    with col5:
        wilayah = st.selectbox("Wilayah Penjual", options=meta['wilayah_list'], index=3)
    with col6:
        km = st.number_input("Kilometer di Iklan", min_value=1000, max_value=300000, value=60000, step=5000)
        
    st.markdown("#### 💰 Harga yang Ditawarkan Penjual")
    harga_iklan = st.number_input(
        "Harga Iklan (Rupiah)",
        min_value=20000000,
        max_value=10000000000,
        value=175000000,
        step=5000000,
        help="Masukkan nominal harga yang tertera di postingan iklan OLX / Mobil123."
    )
    
    st.caption(f"Nominal terinput: **Rp {harga_iklan:,.0f}**")
    btn_check = st.button("⚖️ Cek Kewajaran Harga Iklan", type="primary", use_container_width=True)

with col_verdict:
    st.subheader("📊 Analisis Kewajaran Penawaran")
    
    if btn_check:
        # 1. Hitung harga pasar wajar menurut ML model
        res_pred = predict_car_price(
            model=model,
            merek=merek,
            tahun=tahun,
            km=km,
            transmisi=transmisi,
            bahan_bakar=bahan_bakar,
            wilayah=wilayah
        )
        
        market_p = res_pred['predicted_price']
        
        # 2. Evaluasi Deal
        deal = evaluate_deal(harga_iklan, market_p)
        
        # Tampilan Badge Verdict
        color_map = {
            'green': ('#DCFCE7', '#15803D', '#16A34A'),
            'blue': ('#DBEAFE', '#1D4ED8', '#2563EB'),
            'orange': ('#FEF3C7', '#B45309', '#D97706'),
            'red': ('#FEE2E2', '#B91C1C', '#DC2626')
        }
        bg, border, text_c = color_map[deal['color']]
        
        st.markdown(f"""
        <div style="background-color: {bg}; border: 2px solid {border}; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
            <div style="font-size: 1.2rem; font-weight: 700; color: {text_c};">
                {deal['emoji']} STATUS: {deal['verdict']}
            </div>
            <div style="margin-top: 10px; font-size: 1.05rem; color: #1F2937;">
                {deal['desc']}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Tabel Komparasi Angka
        c_m1, c_m2 = st.columns(2)
        with c_m1:
            st.metric("Harga Iklan Penjual", f"Rp {harga_iklan:,.0f}")
        with c_m2:
            st.metric(
                "Estimasi Nilai Pasar",
                f"Rp {market_p:,.0f}",
                delta=f"{deal['diff_pct']:+.1f}% vs Pasar",
                delta_color="inverse" if deal['diff_pct'] > 0 else "normal"
            )
            
        st.markdown(f"""
        ---
        **📌 Rincian Selisih:**
        - **Selisih Nominal:** Rp {abs(deal['diff_nominal']):,.0f} {'lebih tinggi' if deal['diff_nominal'] > 0 else 'lebih murah'}.
        - **Persentase Perbedaan:** **{abs(deal['diff_pct']):.1f}%** dari nilai wajar pasar.
        - **Rentang Pasar Wajar:** Rp {res_pred['lower_bound']:,.0f} s/d Rp {res_pred['upper_bound']:,.0f}.
        """)
        
        # Tips Praktis Bertransaksi
        with st.expander("💡 Tips Penting Sebelum Bertransaksi"):
            st.markdown("""
            1. **Jika Harga Terlalu Murah (>20% di bawah pasar):** Waspada modus penipuan DP online, BPKB leasing tertahan, atau bekas banjir besar/tabrakan rangka. Wajib cek fisik langsung!
            2. **Jika Harga Tergolong Mahal (>10% di atas pasar):** Tanyakan riwayat buku servis (*service record* resmi), kondisi ban, dan masa berlaku pajak STNK sebagai bahan negosiasi.
            3. **Inspeksi Pihak Ketiga:** Sangat dianjurkan menggunakan jasa inspektor independen sebelum melakukan pelunasan.
            """)
            
    else:
        st.info("👈 Masukkan data kendaraan dan harga iklan yang tertera, lalu klik **'Cek Kewajaran Harga Iklan'**.")
        
        st.markdown("""
        #### 🧭 Cara Kerja Deal Checker:
        1. Model Machine Learning menghitung **nilai wajar pasar** untuk spesifikasi mobil tersebut.
        2. Sistem membandingkan harga iklan terhadap kurva sebaran harga mobil sejenis di Jabodetabek.
        3. Diberikan kesimpulan:
           - 🟢 **Murah / Good Deal:** Penghematan menguntungkan pembeli.
           - 🔵 **Wajar / Fair Deal:** Harga tepat di rata-rata pasar.
           - 🟠 **Agak Mahal / Overpriced:** Ruang untuk menawar masih terbuka lebar.
        """)
