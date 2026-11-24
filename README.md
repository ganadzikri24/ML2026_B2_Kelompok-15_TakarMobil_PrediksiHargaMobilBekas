# 🚗 TakarMobil: Sistem Estimasi Rentang Harga dan Analisis Faktor Penentu Harga Mobil Bekas Berbasis Machine Learning

**Proyek Akhir Mata Kuliah Pembelajaran Mesin (Machine Learning) - Semester 5**  
**Kelas B2 · Kelompok 15**  

---

## 📌 Deskripsi Proyek
**TakarMobil** adalah sistem estimasi harga mobil bekas berbasis web (*Streamlit*) untuk wilayah Jabodetabek yang menyajikan:
1. **Prediksi Harga Pasar:** Estimasi harga wajar menggunakan algoritma Machine Learning terbaik.
2. **Rentang Harga Wajar:** Memberikan estimasi interval batas bawah dan batas atas harga pasar kendaraan.
3. **Deal Checker:** Fitur interaktif untuk memverifikasi apakah harga iklan mobil bekas yang ditemukan tergolong *Murah*, *Wajar*, atau *Kemahalan*.
4. **Analisis Faktor Penentu (*Feature Importance*):** Visualisasi transparan mengenai variabel/fitur yang paling berpengaruh terhadap pembentukan harga mobil.

---

## 📊 Dataset
- **Sumber Data:** Dataset Iklan Mobil Bekas Indonesia ([Zenodo Record 17548894](https://zenodo.org/records/17548894)).
- **Metode Pengumpulan:** Hasil *web scraping* dari platform OLX dan Mobil123 (Periode Juli – Oktober 2025).
- **Cakupan Wilayah:** Jabodetabek.
- **Cakupan Merek:** 5 Merek Terpopuler (Toyota, Daihatsu, Suzuki, Honda, Mercedes-Benz).
- **Ukuran Data:** 17.670 baris, 16 fitur awal.

---

## 🤖 Algoritma & Metodologi
- **Baseline:** Statistik Median Harga per Merek / Model.
- **Model Regresi yang Dibandingkan:**
  1. *Ridge Regression* (Linear Regularized)
  2. *Decision Tree Regressor* (Non-Linear Tree-based)
  3. *Random Forest Regressor* (Ensemble Bagging)
  4. *XGBoost Regressor* (Ensemble Gradient Boosting)
- **Skema Validasi:**
  - `GroupShuffleSplit` (80% Train, 20% Test) berbasis grup merek/model untuk mencegah *data leakage*.
  - 5-Fold `GroupKFold` Cross-Validation pada data training.
- **Metrik Evaluasi:**
  - Mean Absolute Error (MAE)
  - Mean Squared Error (MSE)
  - Root Mean Squared Error (RMSE)
  - Coefficient of Determination ($R^2$)

---

## 📂 Struktur Direktori Proyek
```text
TakarMobil/
├── data/
│   ├── raw/                # Dataset mentah (Data Scraping.xlsx)
│   └── processed/          # Dataset hasil preprocessing & split train-test
├── notebooks/
│   ├── 01_EDA.ipynb        # Exploratory Data Analysis
│   ├── 02_Preprocessing.ipynb  # Data cleaning, encoding, feature engineering
│   ├── 03_Modeling.ipynb   # Pelatihan model & hyperparameter tuning
│   └── 04_Evaluation.ipynb # Evaluasi perbandingan metrik & visualisasi
├── models/                 # Model tersimpan (.joblib) & metadata
├── app/
│   ├── app.py              # Entry point aplikasi Streamlit
│   ├── pages/              # Halaman Streamlit (Estimasi, Deal Checker, dll.)
│   └── utils/              # Helper functions, loader model, & visualizer
├── assets/                 # Gambar, ilustrasi, & visual pendukung
├── requirements.txt        # Daftar dependensi library Python
├── .gitignore              # Konfigurasi file yang diabaikan git
└── README.md               # Dokumentasi utama proyek
```

---

## ⚙️ Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repository
```bash
git clone https://github.com/ganadzikri24/ML2026_B2_Kelompok-15_TakarMobil_PrediksiHargaMobilBekas.git
cd ML2026_B2_Kelompok-15_TakarMobil_PrediksiHargaMobilBekas
```

### 2. Pasang Dependensi
```bash
pip install -r requirements.txt
```

### 3. Menjalankan Aplikasi Web Streamlit
```bash
streamlit run app/app.py
```

---

## 👥 Anggota Kelompok 15
| No. | Nama Mahasiswa | NIM | Peran / Tugas Utama |
|---|---|---|---|
| 1. | *Gyanrendra Nayaran Wiratmaja* | *J0404241007* | Dataset, EDA, & Data Preprocessing |
| 2. | *Aisha Aulia Darmawan* | *J0404241172* | Modeling & Evaluasi Algoritma |
| 3. | *Muhamad Ganabitz Dzikri* | *J0404241157* | Implementasi Aplikasi Streamlit & Deployment |
