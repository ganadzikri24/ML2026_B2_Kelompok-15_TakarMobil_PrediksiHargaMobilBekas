# TakarMobil — Estimasi Harga Mobil Bekas Jabodetabek

**Proyek Akhir Mata Kuliah Pembelajaran Mesin (Machine Learning) — Semester 5**  
**Kelas B2 · Kelompok 15**

> Proyek ini bersifat **edukatif dan nonkomersial** sebagai tugas pembelajaran universitas. Seluruh nama dan logo merek kendaraan (Toyota, Daihatsu, Suzuki, Honda, Mercedes-Benz) adalah milik pemegang mereknya masing-masing dan digunakan semata untuk menandai pilihan merek pada data, tanpa afiliasi komersial.

---

## Fitur Utama Web

1. **Landing Page Interaktif**: Hero video bergerak (`media/animasi_landing.webm`), navbar meluncur, alur 3 langkah, dan ringkasan metrik uji nyata.
2. **Estimasi Harga**: Form spesifikasi interaktif (pemilih logo merek + tipe mobil spesifik, penggulung tahun, animasi tuas transmisi Manual/Automatic, animasi bahan bakar Bensin/Diesel/Hybrid, peta Jabodetabek, spidometer kilometer bisa diketik) disertai loading animasi mobil dan kurva nilai per tahun produksi.
3. **Deal Checker**: Membandingkan harga iklan terhadap nilai pasar wajar dengan meteran jarum interaktif (Sangat Murah sampai Sangat Mahal).
4. **Faktor Harga (*Feature Importance*)**: Visualisasi kontribusi variabel pembentuk harga dari model XGBoost.
5. **Tentang Model**: Perbandingan 4 algoritma regresi + baseline statistik, arsitektur pipeline, dataset, dan tim pengembang.

---

## Dataset & Metodologi

- **Sumber Data:** Dataset Iklan Mobil Bekas Indonesia — *Implementation of Machine Learning Algorithms to Predict Used Car Prices in Indonesia* ([Zenodo Record 17548894](https://zenodo.org/records/17548894), Ivory Thania, Binus University, 2025, `DOI: 10.5281/zenodo.17548894`, lisensi **CC-BY-4.0**), hasil *web scraping* BeautifulSoup & Selenium pada OLX & Mobil123 (Mei–Oktober 2025).
- **Volume Data:** 17.670 baris mentah → **13.320 iklan unik terkurasi** setelah pembersihan harga/merek/tahun, aturan kota/wilayah `Jabodetabek` deterministik (termasuk label `% off`), perbaikan skala kilometer `'K'`, penghapusan 39 anomali salah input, serta deduplikasi ganda (10.656 train / 2.664 test).
- **Cakupan Merek & Tipe:** 5 Merek Terpopuler (Toyota, Daihatsu, Suzuki, Honda, Mercedes-Benz), **105 tipe ternormalisasi (`Model_Clean`)** lintas-platform beserta **ekstraksi `Varian_Clean`** (termasuk seri kode Mercedes `C200`, `C300`, `E300`, `G63`, dll.), fitur indikator **`KM_hilang`**, dan fitur waktu tunggal **`Usia_Mobil` (`2025 − Tahun`)**.
- **Model Utama:** **XGBoost Regressor** (`MAE = Rp 30,0 jt` terendah, `R² = 0,918`, `RMSE = Rp 86,6 jt`) dipilih atas **Ridge Regression** (`R² = 0,925`, `MAE = Rp 34,4 jt`, `RMSE = Rp 82,7 jt`) sesuai Ketentuan 16.9, dibandingkan pula terhadap Random Forest (`R² = 0,855`), Decision Tree (`R² = 0,835`), dan Baseline Median (`R² = 0,731`).
- **Skema Validasi:** Union-Find atas **kunci tanpa harga** dan **kunci dengan harga** + **`StratifiedGroupKFold` (80:20)** (`0` overlap iklan kembar di kedua definisi) & imputasi kilometer pasca-split khusus statistik training (`0 test leakage`), disertai 5-Fold Group-Aware Cross-Validation dan target $\log(1 + \text{Harga})$.

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
| :---: | --- | --- |
| 1. | Aisha Aulia Darmawan | J0404241007 |
| 2. | Muhamad Ganabitz Dzikri | J0404241157 |
| 3. | Gyanrendra Nayaran Wiratmaja | J0404241172 |
