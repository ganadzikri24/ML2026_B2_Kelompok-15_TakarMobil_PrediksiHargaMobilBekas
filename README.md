# TakarMobil — Estimasi Harga Mobil Bekas Jabodetabek

**Proyek Akhir Mata Kuliah Pembelajaran Mesin (Machine Learning) — Semester 5**  
**Kelas B2 · Kelompok 15**

> Proyek ini bersifat **edukatif dan nonkomersial** sebagai tugas pembelajaran universitas. Seluruh nama dan logo merek kendaraan (Toyota, Daihatsu, Suzuki, Honda, Mercedes-Benz) adalah milik pemegang mereknya masing-masing dan digunakan semata untuk menandai pilihan merek pada data, tanpa afiliasi komersial.

---

## Fitur Utama Web
1. **Landing Page Interaktif**: Hero video bergerak (`media/animasi_landing.webm`), navbar meluncur, alur 3 langkah, dan ringkasan metrik uji nyata.
2. **Estimasi Harga**: Form spesifikasi interaktif (pemilih logo merek, penggulung tahun, animasi tuas transmisi Manual/Automatic, animasi bahan bakar Bensin/Diesel/Hybrid, peta skematik Jabodetabek, dan spidometer kilometer) disertai kurva nilai per tahun produksi dan rentang harga wajar ±15%.
3. **Deal Checker**: Membandingkan harga iklan terhadap nilai pasar wajar dengan meteran jarum interaktif (Sangat Murah sampai Sangat Mahal).
4. **Faktor Harga (*Feature Importance*)**: Visualisasi kontribusi variabel pembentuk harga dari model XGBoost.
5. **Tentang Model**: Perbandingan 4 algoritma regresi + baseline statistik, arsitektur pipeline, dataset, dan tim pengembang.

---

## Dataset & Metodologi
- **Sumber Data:** Dataset Iklan Mobil Bekas Indonesia ([Zenodo Record 17548894](https://zenodo.org/records/17548894)) dari scraping OLX & Mobil123.
- **Volume Data:** 17.670 baris mentah → **16.799 baris bersih** (13.453 train / 3.346 test).
- **Cakupan Merek & Tipe:** 5 Merek Terpopuler (Toyota, Daihatsu, Suzuki, Honda, Mercedes-Benz) beserta 223 tipe spesifik (`Model_Clean`).
- **Model Utama:** **XGBoost Regressor** (`R² = 0,844`, `MAE ≈ Rp 30,9 jt`, `RMSE ≈ Rp 161,6 jt`) dibandingkan dengan Ridge Regression (`R² = 0,918`, `MAE ≈ Rp 35,6 jt`), Random Forest, Decision Tree, dan Baseline Median.
- **Skema Validasi:** `StratifiedShuffleSplit` 80:20 berbasis grup merek/tipe (`Model_Clean` menjadi fitur resmi) & 5-Fold Cross-Validation, target ditransformasi $\log(1 + \text{Harga})$.

---

## Struktur Direktori
```text
TakarMobil/
├── web/                    # Aplikasi web utama (FastAPI + frontend kustom)
│   ├── server.py           # Backend API (/api/predict, /api/deal, /api/curve, dll.)
│   └── static/             # HTML, CSS, JS, font lokal, dan logo merek
├── media/                  # Video landing (animasi_landing.webm) & logo navbar
├── models/                 # Model terlatih (.joblib), metadata & laporan evaluasi
├── notebooks/              # 01_EDA, 02_Preprocessing, 03_Modeling, 04_Evaluation
├── data/                   # Dataset mentah dan data terproses
├── legacy_streamlit/       # Versi prototipe Streamlit awal (arsip cadangan)
├── Dockerfile              # Siap deploy ke Hugging Face Spaces / Docker
├── render.yaml             # Siap deploy ke Render
└── requirements.txt
```

---

## Cara Menjalankan di Lokal

1. **Pasang dependensi:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Jalankan server web:**
   ```bash
   python -m uvicorn web.server:app --reload --port 8000
   ```
3. **Buka di browser:**
   ```text
   http://127.0.0.1:8000
   ```

*(Opsional: versi Streamlit lama masih tersedia di `legacy_streamlit/` dengan `streamlit run legacy_streamlit/app.py`.)*

---

## Tim Pengembang (Kelompok 15 · Kelas B2)
| No. | Nama Mahasiswa | NIM |
|:---:|---|---|
| 1. | Gyanrendra Nayaran Wiratmaja | J0404241007 |
| 2. | Aisha Aulia Darmawan | J0404241172 |
| 3. | Muhamad Ganabitz Dzikri | J0404241157 |
