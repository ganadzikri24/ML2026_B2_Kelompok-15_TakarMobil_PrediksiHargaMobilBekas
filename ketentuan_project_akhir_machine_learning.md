# Deskripsi Project

Project akhir Mata Kuliah Pembelajaran Mesin (Machine Learning) dirancang untuk memberikan pengalaman kepada mahasiswa dalam menerapkan konsep, metode, dan algoritma Machine Learning untuk menyelesaikan permasalahan nyata berbasis data.

Setiap kelompok akan mengembangkan suatu model Machine Learning mulai dari tahapan identifikasi masalah, pengumpulan atau pemilihan dataset, eksplorasi data, preprocessing, pembangunan model, evaluasi, hingga implementasi model dalam bentuk aplikasi sederhana yang dapat digunakan oleh pengguna.

Mahasiswa diharapkan tidak hanya mampu menghasilkan model dengan performa yang baik, tetapi juga mampu menjelaskan alasan pemilihan metode, melakukan evaluasi model secara tepat, serta menginterpretasikan hasil yang diperoleh.

**Hasil akhir project meliputi:**
- Model Machine Learning yang telah dilatih dan dievaluasi.
- Aplikasi/interface sederhana untuk menjalankan model.
- Source code project.
- PPT laporan project.
- Video demo aplikasi.

---

## 1. Kelompok

- Setiap kelompok terdiri dari **3 orang mahasiswa**.
- Setiap anggota kelompok harus memiliki pembagian tugas yang jelas.
- Seluruh anggota wajib memahami konsep, dataset, metode, algoritma, serta implementasi project yang dikerjakan.
- Nilai pengerjaan project merupakan nilai kelompok.
- Nilai presentasi dan tanya jawab merupakan nilai individu.
- Setiap anggota kelompok wajib dapat menjelaskan bagian project yang dikerjakan maupun konsep utama project secara keseluruhan.

## 2. Tema Project

Setiap kelompok dapat memilih permasalahan yang dapat diselesaikan menggunakan pendekatan Machine Learning. Tema yang dapat dipilih antara lain:

### A. Classification
Membangun model untuk memprediksi kategori atau kelas tertentu.
*Contoh:*
- Prediksi kelayakan kredit.
- Prediksi mahasiswa berisiko tidak lulus tepat waktu.
- Klasifikasi kualitas produk.
- Prediksi pelanggan churn.
- Klasifikasi tingkat risiko penyakit berdasarkan data.
- Deteksi transaksi mencurigakan.
- Klasifikasi kualitas pangan berdasarkan karakteristik fisik atau kimia.

### B. Regression
Membangun model untuk memprediksi nilai numerik/kontinu.
*Contoh:*
- Prediksi harga rumah.
- Prediksi hasil produksi pertanian.
- Prediksi konsumsi energi.
- Prediksi nilai penjualan.
- Prediksi suhu atau parameter lingkungan.
- Prediksi kualitas produk berdasarkan parameter proses.

### C. Clustering
Mengelompokkan data berdasarkan kemiripan karakteristik tanpa label kelas.
*Contoh:*
- Segmentasi pelanggan.
- Pengelompokan pola konsumsi.
- Pengelompokan wilayah berdasarkan parameter lingkungan.
- Pengelompokan produk berdasarkan karakteristik.
- Pengelompokan mahasiswa berdasarkan pola akademik.

### D. Anomaly Detection
Mengidentifikasi data atau kondisi yang berbeda secara signifikan dari pola normal.
*Contoh:*
- Deteksi anomali sensor.
- Deteksi kerusakan mesin.
- Deteksi transaksi tidak normal.
- Deteksi kondisi produksi yang tidak normal.
- Deteksi penyimpangan kualitas produk.

### E. Time Series / Forecasting
Membangun model untuk melakukan prediksi berdasarkan data runtun waktu.
*Contoh:*
- Prediksi penjualan.
- Prediksi konsumsi listrik.
- Prediksi suhu.
- Prediksi jumlah produksi.
- Prediksi permintaan produk.

### F. Recommendation System
Membangun sistem yang dapat memberikan rekomendasi berdasarkan karakteristik pengguna atau data historis.
*Contoh:*
- Rekomendasi produk.
- Rekomendasi makanan.
- Rekomendasi film.
- Rekomendasi buku.
- Rekomendasi pilihan berdasarkan karakteristik pengguna.

### G. Topik Lain
Topik lain diperbolehkan selama:
- Menggunakan konsep Machine Learning.
- Memiliki dataset yang dapat dianalisis.
- Memiliki permasalahan yang jelas.
- Memiliki metode evaluasi yang terukur.
- Mendapatkan persetujuan dosen pengampu.

## 3. Pengajuan Tema Project

Pada saat mengajukan tema project, setiap kelompok wajib menyampaikan:
1. Judul project.
2. Latar belakang singkat.
3. Permasalahan yang ingin diselesaikan.
4. Tujuan project.
5. Dataset yang akan digunakan.
6. Sumber dataset.
7. Variabel/feature yang digunakan.
8. Target/output yang akan diprediksi atau dianalisis.
9. Algoritma Machine Learning yang direncanakan.
10. Minimal 5 artikel jurnal ilmiah yang relevan dengan project.

Artikel jurnal digunakan sebagai referensi dalam menentukan:
- Permasalahan penelitian.
- Dataset/variabel.
- Metode preprocessing.
- Algoritma Machine Learning.
- Metode evaluasi model.

Kelompok juga wajib membuat tabel studi literatur dengan format berikut:

| No. | Penulis & Tahun | Permasalahan | Dataset | Metode/Algoritma | Metrik Evaluasi | Hasil Utama | Perbedaan dengan Project |
|---|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... | ... | ... | ... |
| 5 | ... | ... | ... | ... | ... | ... | ... |

## 4. Dataset

Dataset dapat berasal dari:
- Kaggle.
- UCI Machine Learning Repository.
- Data pemerintah/Open Data.
- Dataset penelitian.
- Dataset hasil pengukuran sendiri.
- Dataset dari sensor/IoT.
- Dataset institusi yang diperbolehkan digunakan.
- Sumber dataset terbuka lainnya.

*Catatan: Dataset harus memiliki sumber yang jelas.*

**Kelompok wajib menjelaskan:**
- Jumlah data.
- Jumlah feature/variabel.
- Tipe data.
- Target/label apabila menggunakan supervised learning.
- Distribusi data.
- Missing value.
- Outlier.
- Ketidakseimbangan kelas apabila ditemukan.
- Proses pembersihan/preprocessing yang dilakukan.

*Dilarang menggunakan dataset tanpa memahami arti masing-masing variabel.*

## 5. Eksplorasi Data / Exploratory Data Analysis (EDA)

Sebelum membuat model, mahasiswa wajib melakukan analisis awal terhadap dataset. Minimal mencakup:
- Informasi dataset.
- Statistik deskriptif.
- Pemeriksaan missing value.
- Pemeriksaan data duplikat.
- Pemeriksaan outlier jika relevan.
- Distribusi variabel.
- Distribusi kelas/target.
- Korelasi antarvariabel apabila relevan.
- Visualisasi data yang mendukung analisis.

**Contoh visualisasi:**
- Histogram.
- Bar chart.
- Boxplot.
- Scatter plot.
- Correlation matrix/heatmap.
- Grafik distribusi kelas.

*Setiap visualisasi harus dijelaskan, bukan hanya ditampilkan.*

## 6. Preprocessing Data

Kelompok wajib menjelaskan preprocessing yang dilakukan. Preprocessing dapat meliputi:
- Data cleaning.
- Penanganan missing value.
- Penghapusan data duplikat.
- Penanganan outlier.
- Encoding data kategorikal.
- Normalization.
- Standardization.
- Feature selection.
- Feature engineering.
- Penanganan class imbalance.
- Pembagian data training dan testing.

*Tidak seluruh preprocessing harus digunakan. Gunakan preprocessing yang memang diperlukan oleh dataset dan algoritma yang dipilih.*

## 7. Pengembangan Model Machine Learning

Setiap kelompok wajib menggunakan minimal **3 algoritma/model** untuk dibandingkan. Pemilihan algoritma harus memiliki alasan yang jelas dan tidak hanya mencoba algoritma secara acak.

**Contoh algoritma:**

* **Classification:** Logistic Regression, K-Nearest Neighbors, Decision Tree, Random Forest, Support Vector Machine, Naive Bayes, Gradient Boosting, XGBoost atau algoritma lain yang relevan.
* **Regression:** Linear Regression, Polynomial Regression, Decision Tree Regression, Random Forest Regression, Support Vector Regression, Gradient Boosting Regression.
* **Clustering:** K-Means, Hierarchical Clustering, DBSCAN, Metode clustering lain yang relevan.

## 8. Training dan Testing

Dataset harus dibagi secara tepat menjadi data training dan testing. 
Contoh: `80% training : 20% testing` atau metode lain yang dapat dipertanggungjawabkan.

Apabila diperlukan, mahasiswa dapat menggunakan:
- Train-validation-test split.
- K-Fold Cross Validation.
- Stratified K-Fold.
- Grid Search.
- Randomized Search.
- Hyperparameter tuning lainnya.

*Mahasiswa wajib memastikan bahwa data testing tidak digunakan dalam proses training model.*

## 9. Evaluasi Model

Metrik evaluasi harus disesuaikan dengan jenis permasalahan.

- **Classification**
  - Minimal dapat menggunakan: Accuracy, Precision, Recall, F1-Score, Confusion Matrix.
  - Apabila relevan dapat ditambahkan: ROC Curve, AUC, Specificity.
- **Regression**
  - Minimal dapat menggunakan: MAE, MSE, RMSE, R².
- **Clustering**
  - Dapat menggunakan: Silhouette Score, Davies-Bouldin Index, Elbow Method, Evaluasi visual cluster.

Kelompok wajib membandingkan performa seluruh model yang digunakan. Contoh:

| Model | Accuracy | Precision | Recall | F1-Score |
|---|---|---|---|---|
| Model 1 | ... | ... | ... | ... |
| Model 2 | ... | ... | ... | ... |
| Model 3 | ... | ... | ... | ... |

*Kelompok harus menjelaskan mengapa satu model dipilih untuk diimplementasikan pada aplikasi berdasarkan hasil evaluasi.*

## 10. Analisis Model

Kelompok tidak diperbolehkan hanya menyampaikan nilai accuracy atau metrik evaluasi. Wajib terdapat pembahasan mengenai:
- Model dengan performa terbaik.
- Model dengan performa terendah.
- Kemungkinan penyebab perbedaan performa.
- Apakah terjadi overfitting atau underfitting.
- Kesalahan prediksi model.
- Faktor/feature yang berpengaruh apabila dapat dianalisis.
- Keterbatasan model.
- Potensi pengembangan model selanjutnya.

## 11. Output Project

Output utama project adalah aplikasi berbasis Machine Learning yang dapat digunakan oleh pengguna.

Aplikasi dapat berupa:
- Web application.
- Desktop application.
- Mobile application.
- Dashboard interaktif.

Contoh teknologi yang dapat digunakan: *Streamlit, Gradio, Flask, FastAPI, Django, atau teknologi lain yang sesuai.*

**Aplikasi minimal mempunyai:**
- **Input:** Pengguna dapat memasukkan data yang diperlukan model (Angka, Data kategorikal, File CSV, Data sensor, dll).
- **Process:** Aplikasi menjalankan model Machine Learning yang telah dibuat.
- **Output:** Aplikasi menampilkan hasil analisis/prediksi secara jelas (Kelas hasil prediksi, Nilai prediksi, Probabilitas, Cluster, Status anomaly, Grafik, dll).

*Alur Contoh: Input Data → Preprocessing → Machine Learning Model → Prediction → Result*

## 12. Source Code

Source code project harus tersusun dengan baik dan dapat dijalankan kembali. Minimal terdiri atas:
- Proses loading dataset.
- EDA.
- Data preprocessing.
- Training model.
- Evaluasi model.
- Perbandingan model.
- Penyimpanan model.
- Implementasi aplikasi.

Source code dapat dibuat menggunakan: Jupyter Notebook, Google Colab, Python script, atau GitHub Repository. *Kode harus diberikan komentar seperlunya sehingga mudah dipahami.*

## 13. Video Demo Aplikasi

Setiap kelompok wajib membuat video demo dengan durasi maksimal **≤ 7 menit**.

Isi video minimal:
1. Perkenalan anggota kelompok.
2. Judul project.
3. Latar belakang masalah.
4. Dataset yang digunakan.
5. Tahapan preprocessing.
6. Algoritma Machine Learning yang digunakan.
7. Perbandingan performa model.
8. Model terbaik yang dipilih.
9. Demonstrasi aplikasi.
10. Kesimpulan.

*Video harus memperlihatkan aplikasi benar-benar dijalankan, bukan hanya menjelaskan screenshot aplikasi.*

## 14. Laporan Project

Laporan project dibuat dalam bentuk PPT yang digunakan untuk presentasi/video demo project. PPT minimal memuat:

- **A. Judul Project:** Judul, Nama anggota, NIM, Kelas.
- **B. Latar Belakang & Masalah:** Kondisi/permasalahan, alasan, dan pentingnya permasalahan diselesaikan.
- **C. Tujuan Project:** Target yang ingin dicapai.
- **D. Studi Literatur:** Ringkasan minimal 5 jurnal terkait.
- **E. Dataset:** Sumber, jumlah data, feature, target, karakteristik dataset.
- **F. Exploratory Data Analysis:** Analisis dan visualisasi data yang relevan.
- **G. Preprocessing:** Tahapan preprocessing data.
- **H. Pengembangan Model:** Algoritma, pembagian training/testing, parameter model, proses training.
- **I. Evaluasi dan Perbandingan Model:** Hasil evaluasi setiap algoritma.
- **J. Pemilihan Model Terbaik:** Alasan pemilihan model yang digunakan pada aplikasi.
- **K. Implementasi Aplikasi:** Arsitektur aplikasi, teknologi yang digunakan, Input, Proses, Output.
- **L. Demo Project:** Demonstrasi penggunaan aplikasi.
- **M. Kesimpulan:** Hasil utama project.
- **N. Keterbatasan dan Pengembangan:** Keterbatasan dataset, model, aplikasi, dan pengembangan selanjutnya.
- **O. Pembagian Tugas:**

*Contoh format pembagian tugas:*

| Anggota | Tugas |
|---|---|
| Mahasiswa 1 | Dataset, EDA, preprocessing |
| Mahasiswa 2 | Modeling dan evaluasi |
| Mahasiswa 3 | Implementasi aplikasi dan deployment |

*(Pembagian tersebut hanya contoh. Seluruh mahasiswa tetap wajib memahami keseluruhan project.)*

## 15. Penilaian Project

Penilaian mempertimbangkan beberapa komponen berikut:

| Komponen | Bobot |
|---|---|
| Identifikasi masalah & studi literatur | 10% |
| Dataset, EDA & preprocessing | 15% |
| Pengembangan model Machine Learning | 20% |
| Evaluasi & analisis model | 20% |
| Implementasi aplikasi | 15% |
| PPT & video demo | 10% |
| Originalitas/inovasi project | 5% |
| Pembagian tugas & kualitas dokumentasi | 5% |
| **TOTAL** | **100%** |

Selain penilaian kelompok, dilakukan tanya jawab individu untuk memastikan setiap mahasiswa memahami project yang dikerjakan. Nilai individu dapat mempertimbangkan:
- Pemahaman konsep Machine Learning.
- Pemahaman dataset.
- Pemahaman preprocessing.
- Pemahaman algoritma.
- Kemampuan membaca hasil evaluasi.
- Kemampuan menjelaskan kode.
- Kemampuan menjelaskan aplikasi.

## 16. Ketentuan Penting

1. Dataset dan sumber dataset harus dicantumkan dengan jelas.
2. Dilarang menggunakan project milik kelompok lain.
3. Project tidak boleh hanya mengunduh source code dari internet dan menjalankannya tanpa memahami prosesnya.
4. Penggunaan AI/generative AI diperbolehkan sebagai alat bantu pembelajaran dan debugging, tetapi mahasiswa tetap bertanggung jawab memahami seluruh kode dan analisis yang digunakan.
5. Setiap kelompok harus mampu menjalankan kembali project pada saat demonstrasi.
6. Seluruh hasil evaluasi harus berasal dari pengujian model yang benar-benar dilakukan.
7. Hasil project harus dapat dipertanggungjawabkan dalam sesi tanya jawab.
8. Mahasiswa wajib dapat menjelaskan alasan penggunaan setiap preprocessing, algoritma, serta metrik evaluasi.
9. Model dengan accuracy tertinggi tidak otomatis menjadi model terbaik; pemilihan model harus mempertimbangkan karakteristik permasalahan dan metrik yang sesuai.
10. Apabila aplikasi/model tidak dapat dijalankan saat presentasi, kelompok tetap wajib menjelaskan penyebab serta menunjukkan source code dan dokumentasi pengujian.

## 17. File yang Dikumpulkan

Setiap kelompok wajib mengumpulkan:
- PPT laporan project
- Source code / link repository
- Dataset atau link dataset
- Model hasil training apabila diperlukan
- Video demo maksimal 7 menit
- Daftar 5 jurnal referensi
- Tabel studi literatur
- Link aplikasi/deployment, jika tersedia

**Format nama folder:** `ML2026_Kelas_NamaKelompok_JudulProject`