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
    
    # 2. Pembahasan Bisnis & Penjelasan Ilmiah (dinamis dari evaluation_report.json)
    st.subheader("💡 Wawasan Otomotif & Interpretasi Bisnis")
    fi_map = {d['Feature']: d['XGBoost Importance'] * 100 for d in top_features}
    pct_mb = fi_map.get('Merek_Clean_Mercedes-Benz', 52.3)
    pct_alphard = fi_map.get('Model_Clean_Alphard', 3.2)
    pct_crv = fi_map.get('Model_Clean_Cr-V', 2.1)
    pct_bensin = fi_map.get('Bahan_Bakar_Clean_Bensin', 1.1)
    pct_auto = fi_map.get('Transmisi_Clean_Automatic', 1.0)
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.markdown(f"""
        #### 1. Kasta & Merek Kendaraan (Mercedes-Benz vs Merek Jepang)
        - **Merek Mercedes-Benz** menyumbang bobot pengaruh terbesar (**~{pct_mb:.1f}%**).
        - Segmen mobil mewah (*luxury cars*) memiliki titik awal harga (*baseline price*) serta kurva depresiasi yang terpisah jauh dari segmen mobil massal keluarga.
        - Merek Jepang seperti **Toyota**, **Daihatsu**, **Honda**, dan **Suzuki** mempertahankan nilai jual kembali stabil berkat ketersediaan suku cadang dan jaringan servis yang luas.
        
        #### 2. Tipe Spesifik (`Model_Clean`) & Transmisi
        - Varian spesifik seperti **Alphard (~{pct_alphard:.1f}%)**, **CR-V (~{pct_crv:.1f}%)**, Jimny, G-Class, dan HR-V memisahkan kelas harga di dalam satu merek.
        - Transmisi **Automatic** (**~{pct_auto:.1f}%**) memengaruhi koreksi harga antar varian sejenis karena tingginya minat mobil matic di perkotaan Jabodetabek.
        """)
        
    with col_b:
        st.markdown(f"""
        #### 3. Jenis Bahan Bakar (Bensin, Hybrid & Diesel)
        - Fitur bahan bakar **Bensin** menyumbang koreksi **~{pct_bensin:.1f}%** pada pemisahan segmen mesin.
        - Varian mesin **Diesel** dan **Hybrid** pada model tertentu cenderung mempertahankan harga jual kembali lebih tinggi akibat efisiensi maupun torsi mesin.
        
        #### 4. Tahun Perakitan & Jarak Tempuh (Kilometer)
        - Setelah merek dan tipe menetapkan segmen harga dasar kendaraan, **Tahun Produksi** dan **Kilometer Tempuh** menggeser taksiran harga secara progresif mengikuti penyusutan usia dan pemakaian.
        """)
        
    st.markdown("""
    ---
    **📌 Catatan Metodologi:**  
    Nilai *Feature Importance* di atas diekstraksi dari bobot Gain pohon keputusan pada algoritma **XGBoost Regressor**, yang mengukur seberapa besar setiap variabel berkontribusi dalam memangkas ketidakpastian (*residual variance*) prediksi harga mobil.
    """)
else:
    st.info("Data feature importance belum tersedia.")
