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
from visualizer import create_feature_importance_plot

st.set_page_config(page_title="Faktor Penentu Harga - TakarMobil", page_icon="📊", layout="wide")

st.title("📊 Analisis Faktor Penentu Harga (*Feature Importance*)")
st.write("Visualisasi transparan mengenai variabel dan spesifikasi kendaraan yang paling menentukan depresiasi serta pembentukan harga pasar mobil bekas berdasarkan model **XGBoost Regressor**.")

st.divider()

# Load Metadata & Evaluation Report
try:
    data_bundle = load_models_and_meta()
    eval_rep = data_bundle['eval_report']
    top_features = eval_rep.get('top_features', [])
except Exception as e:
    st.error(f"Gagal memuat data feature importance: {e}")
    st.stop()

if top_features:
    # 1. Grafik Interaktif Plotly
    fig_fi = create_feature_importance_plot(top_features)
    st.plotly_chart(fig_fi, use_container_width=True)
    
    st.divider()
    
    # 2. Pembahasan Bisnis & Penjelasan Ilmiah
    st.subheader("💡 Wawasan Otomotif & Interpretasi Bisnis")
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.markdown("""
        #### 1. Kasta & Merek Kendaraan (Mercedes-Benz vs Merek Jepang)
        - **Merek Mercedes-Benz** menyumbang bobot pengaruh terbesar (**>50%**).
        - Segmen mobil mewah (*luxury cars*) memiliki titik awal harga (*baseline price*) serta kurva depresiasi yang terpisah jauh dari segmen mobil massal keluarga.
        - Merek seperti **Toyota** dan **Daihatsu** mempertahankan nilai jual kembali (*resale value*) yang sangat stabil di Indonesia karena ketersediaan suku cadang yang melimpah dan jaringan bengkel yang luas.
        
        #### 2. Tipe Transmisi (Automatic vs Manual)
        - Transmisi **Automatic** memberikan pengaruh positif yang kuat terhadap harga jual di Jabodetabek (**~8.3% importance**).
        - Kondisi lalu lintas perkotaan yang padat membuat permintaan mobil matic jauh melampaui mobil manual, sehingga mobil matic memiliki nilai pasar lebih tinggi.
        """)
        
    with col_b:
        st.markdown("""
        #### 3. Jenis Bahan Bakar (Bensin vs Diesel)
        - Jenis bahan bakar memegang pengaruh sekitar **~10.9%**.
        - Varian mesin **Diesel** (seperti pada Toyota Fortuner atau Innova Reborn Diesel) memiliki kecenderungan harga bekas yang lebih bertahan dan diminati karena efisiensi bahan bakar dan torsi yang bertenaga.
        
        #### 4. Tahun Perakitan & Jarak Tempuh (Kilometer)
        - **Tahun Produksi** menyumbang depresiasi harga tahunan yang konsisten (**~3.5%**).
        - **Kilometer Tempuh** merefleksikan keausan fisik komponen gerak (kaki-kaki, transmisi, mesin). Mobil dengan kilometer rendah (*low mileage*) selalu mendapatkan apresiasi harga yang lebih tinggi.
        """)
        
    st.markdown("""
    ---
    **📌 Catatan Metodologi:**  
    Nilai *Feature Importance* di atas diekstraksi dari bobot Gain pohon keputusan pada algoritma **XGBoost Regressor**, yang mengukur seberapa besar setiap variabel berkontribusi dalam memangkas ketidakpastian (*residual variance*) prediksi harga mobil.
    """)
else:
    st.info("Data feature importance belum tersedia.")
