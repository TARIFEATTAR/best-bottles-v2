
import pandas as pd
import json

try:
    df = pd.read_excel('BB_MasterList_ZD_V1.ods', engine='calamine')
    print("ODS Columns:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
    
    with open('inventory.json', 'r') as f:
        inv = json.load(f)
        if isinstance(inv, list) and len(inv) > 0:
             print("Inventory keys:", list(inv[0].keys()))
except Exception as e:
    print(e)
