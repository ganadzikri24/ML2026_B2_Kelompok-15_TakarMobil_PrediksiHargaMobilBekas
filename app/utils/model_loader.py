import os
import json
import joblib
import streamlit as st

@st.cache_resource
def load_models_and_meta():
    """Memuat model Machine Learning dan metadata dengan caching Streamlit."""
    candidate_dirs = [
        "models",
        "../models",
        os.path.join(os.path.dirname(__file__), "..", "..", "models")
    ]
    
    models_dir = next((d for d in candidate_dirs if os.path.exists(d)), None)
    if models_dir is None:
        raise FileNotFoundError("Direktori models/ tidak ditemukan!")
    
    # 1. Load Model Terbaik (XGBoost)
    xgb_path = os.path.join(models_dir, 'xgboost_model.joblib')
    model_xgb = joblib.load(xgb_path)
    
    # 2. Load Model Random Forest
    rf_path = os.path.join(models_dir, 'random_forest_model.joblib')
    model_rf = joblib.load(rf_path)
    
    # 3. Load Metadata Fitur
    meta_path = os.path.join(models_dir, 'feature_metadata.json')
    with open(meta_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        
    # 4. Load Evaluation Summary jika ada
    eval_path = os.path.join(models_dir, 'evaluation_report.json')
    eval_report = {}
    if os.path.exists(eval_path):
        with open(eval_path, 'r', encoding='utf-8') as f:
            eval_report = json.load(f)
            
    return {
        'model_xgb': model_xgb,
        'model_rf': model_rf,
        'metadata': metadata,
        'eval_report': eval_report
    }
