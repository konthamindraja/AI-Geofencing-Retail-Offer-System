import pandas as pd
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def load_stores():
    return pd.read_csv(os.path.join(DATA_DIR, "stores.csv"))

def load_customers():
    return pd.read_csv(os.path.join(DATA_DIR, "customers.csv"))

def load_purchases():
    return pd.read_csv(os.path.join(DATA_DIR, "purchases.csv"))
