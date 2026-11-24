import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

def create_price_gauge(price, lower, upper):
    """
    Membuat gauge chart interaktif untuk posisi harga pasar dan rentang wajar.
    """
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=price / 1e6,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Estimasi Harga Pasar (Juta Rp)", 'font': {'size': 18, 'color': '#2C3E50'}},
        number={'suffix': " Jt", 'valueformat': ",.1f", 'font': {'size': 32, 'color': '#1E88E5'}},
        gauge={
            'axis': {'range': [lower * 0.75 / 1e6, upper * 1.25 / 1e6], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': "#1E88E5", 'thickness': 0.3},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [lower * 0.75 / 1e6, lower / 1e6], 'color': '#E8F5E9'},
                {'range': [lower / 1e6, upper / 1e6], 'color': '#FFF9C4'},
                {'range': [upper / 1e6, upper * 1.25 / 1e6], 'color': '#FFEBEE'}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': price / 1e6
            }
        }
    ))
    fig.update_layout(height=280, margin=dict(l=20, r=20, t=50, b=20))
    return fig

def create_feature_importance_plot(top_features_list):
    """
    Membuat bar chart interaktif untuk tingkat kepentingan fitur.
    """
    df_fi = pd.DataFrame(top_features_list)
    df_fi['Feature_Clean'] = df_fi['Feature'].str.replace('Merek_Clean_', 'Merek: ')\
                                             .str.replace('Transmisi_Clean_', 'Transmisi: ')\
                                             .str.replace('Bahan_Bakar_Clean_', 'BBM: ')\
                                             .str.replace('Wilayah_', 'Wilayah: ')\
                                             .str.replace('Tahun_Num', 'Tahun Produksi')\
                                             .str.replace('KM_Clean', 'Jarak Tempuh (KM)')\
                                             .str.replace('Usia_Mobil', 'Usia Kendaraan')
    
    df_fi['Importance_Pct'] = df_fi['XGBoost Importance'] * 100
    df_fi = df_fi.sort_values(by='Importance_Pct', ascending=True)
    
    fig = px.bar(
        df_fi,
        x='Importance_Pct',
        y='Feature_Clean',
        orientation='h',
        text=df_fi['Importance_Pct'].apply(lambda x: f"{x:.1f}%"),
        labels={'Importance_Pct': 'Tingkat Pengaruh Relatif (%)', 'Feature_Clean': 'Faktor / Variabel'},
        color='Importance_Pct',
        color_continuous_scale='Viridis'
    )
    
    fig.update_layout(
        title="<b>Faktor Paling Berpengaruh dalam Penentuan Harga Mobil</b>",
        height=450,
        margin=dict(l=20, r=40, t=50, b=30),
        xaxis=dict(range=[0, df_fi['Importance_Pct'].max() * 1.15])
    )
    return fig
