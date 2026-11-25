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
    pct_mb = fi_map.get('Merek_Clean_Mercedes-Benz', 43.5)
    pct_alphard = fi_map.get('Model_Clean_Alphard', 4.6)
    pct_hiace = fi_map.get('Model_Clean_Hiace', 2.6)
    pct_g = fi_map.get('Model_Clean_G-Class', 2.4)
    pct_crv = fi_map.get('Model_Clean_CR-V', 1.8)
    pct_diesel = fi_map.get('Bahan_Bakar_Clean_Diesel', 1.6)
    pct_manual = fi_map.get('Transmisi_Clean_Manual', 2.5)
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.markdown(f"""
        #### 1. Kasta & Merek Kendaraan (Mercedes-Benz vs Merek Jepang)
        - **Merek Mercedes-Benz** menyumbang bobot pengaruh terbesar (**~{pct_mb:.1f}%**).
        - Segmen mobil mewah (*luxury cars*) memiliki titik awal harga (*baseline price*) serta kurva depresiasi yang terpisah jauh dari segmen mobil massal keluarga.
        - Merek Jepang seperti **Toyota**, **Daihatsu**, **Honda**, dan **Suzuki** mempertahankan nilai jual kembali stabil berkat ketersediaan suku cadang dan jaringan servis yang luas.
        
        #### 2. Keluarga Model (`Model_Clean`) & Transmisi
        - Model ternormalisasi seperti **Alphard (~{pct_alphard:.1f}%)**, **Hiace (~{pct_hiace:.1f}%)**, **G-Class (~{pct_g:.1f}%)**, **CR-V (~{pct_crv:.1f}%)**, dan Jimny langsung memisahkan segmen nilai antar kendaraan.
        - Transmisi **Manual** (**~{pct_manual:.1f}%**) menjadi pembeda kuat koreksi harga terhadap unit otomatis di pasar Jabodetabek.
        """)
        
    with col_b:
        st.markdown(f"""
        #### 3. Jenis Bahan Bakar (Bensin, Diesel & Hybrid)
        - Fitur bahan bakar **Diesel** memberi kontribusi **~{pct_diesel:.1f}%** terutama pada segmen MPV/SUV tangguh dan niaga.
        - Kategori `Hybrid` juga menampung unit elektrik pada dataset (*1 unit Listrik disatukan ke Hybrid*).
        
        #### 4. Usia Mobil, Varian & Jarak Tempuh (Kilometer)
        - Setelah merek, model, dan varian menetapkan segmen harga dasar kendaraan, **`Usia_Mobil` (`2025 - Tahun`)** dan **`KM_Clean`** (beserta **`KM_hilang`**) menggeser taksiran harga mengikuti penyusutan pemakaian.
        """)
        
    st.markdown("""
    ---
    **📌 Catatan Metodologi:**  
    Nilai *Feature Importance* di atas diekstraksi dari bobot Gain pohon keputusan pada algoritma **XGBoost Regressor**, yang mengukur seberapa besar setiap variabel berkontribusi dalam memangkas ketidakpastian (*residual variance*) prediksi harga mobil.
    """)
else:
    st.info("Data feature importance belum tersedia.")
