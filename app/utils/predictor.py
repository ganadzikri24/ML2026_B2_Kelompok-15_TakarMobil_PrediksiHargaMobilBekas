import numpy as np
import pandas as pd

def predict_car_price(model, merek, tahun, km, transmisi, bahan_bakar, wilayah):
    """
    Menghitung prediksi harga pasar mobil bekas dan interval rentang wajar.
    """
    usia = 2025 - tahun
    
    input_df = pd.DataFrame([{
        'Tahun_Num': int(tahun),
        'Usia_Mobil': int(usia),
        'KM_Clean': float(km),
        'Merek_Clean': str(merek),
        'Transmisi_Clean': str(transmisi),
        'Bahan_Bakar_Clean': str(bahan_bakar),
        'Wilayah': str(wilayah)
    }])
    
    # Prediksi dalam skala logaritmik
    log_pred = model.predict(input_df)[0]
    
    # Transformasi balik ke Rupiah asli
    predicted_price = float(np.expm1(log_pred))
    
    # Menghitung Rentang Harga Wajar (Rentang toleransi pasar ±12.5% - 15%)
    lower_bound = predicted_price * 0.85
    upper_bound = predicted_price * 1.15
    
    return {
        'predicted_price': predicted_price,
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'usia': usia,
        'input_df': input_df
    }

def evaluate_deal(ad_price, market_price):
    """
    Mengevaluasi kewajaran harga iklan mobil bekas (Deal Checker).
    """
    diff_nominal = ad_price - market_price
    diff_pct = (diff_nominal / market_price) * 100
    
    if diff_pct < -20:
        verdict = "SANGAT MURAH (SUPER DEAL)"
        color = "green"
        emoji = "🔥"
        desc = "Harga iklan jauh di bawah estimasi pasar (>20% lebih hemat). Periksa kelengkapan surat kendaraan dan riwayat kondisi mesin/bebas banjir sebelum bertransaksi."
    elif diff_pct < -5:
        verdict = "MURAH (GOOD DEAL)"
        color = "green"
        emoji = "✅"
        desc = "Harga iklan menarik dan kompetitif (5% s/d 20% di bawah estimasi pasar). Penawaran yang menguntungkan bagi pembeli."
    elif diff_pct <= 5:
        verdict = "WAJAR (FAIR MARKET VALUE)"
        color = "blue"
        emoji = "⚖️"
        desc = "Harga iklan sangat selaras dengan nilai pasar rata-rata saat ini (toleransi ±5%). Harga yang adil untuk penjual dan pembeli."
    elif diff_pct <= 20:
        verdict = "AGAK MAHAL (SLIGHTLY OVERPRICED)"
        color = "orange"
        emoji = "⚠️"
        desc = "Harga iklan 5% s/d 20% lebih tinggi dari estimasi pasar wajar. Disarankan untuk melakukan negosiasi harga lebih lanjut."
    else:
        verdict = "SANGAT MAHAL (OVERPRICED)"
        color = "red"
        emoji = "⛔"
        desc = "Harga iklan melebihi 20% di atas nilai pasar wajar. Pastikan kendaraan memiliki keistimewaan khusus (misal: kilometer super antik, upgrade resmi) untuk membenarkan selisih harga ini."
        
    return {
        'verdict': verdict,
        'color': color,
        'emoji': emoji,
        'diff_nominal': diff_nominal,
        'diff_pct': diff_pct,
        'desc': desc
    }
