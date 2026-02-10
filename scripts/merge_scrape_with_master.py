
import re
import os
import json
import pandas as pd

def clean_sku(sku):
    if not isinstance(sku, str):
        return str(sku)
    new_sku = re.sub(r'0(\d)oz', r'\1oz', sku, flags=re.IGNORECASE)
    new_sku = re.sub(r'0(\d)ml', r'\1ml', new_sku, flags=re.IGNORECASE)
    return new_sku

def main():
    print("Loading Master List...")
    master_path = 'data/BB_MasterList_ZD_V1_CLEANED.xlsx'
    df_master = pd.read_excel(master_path)
    print(f"Master List: {len(df_master)} products")
    
    print("Loading new scrape...")
    with open('data/scraped_products.json', 'r') as f:
        scraped = json.load(f)
    print(f"New scrape: {len(scraped)} products")
    
    # Convert scrape to DataFrame
    df_scrape = pd.DataFrame(scraped)
    
    # Clean SKUs
    df_scrape['sku_clean'] = df_scrape['sku'].astype(str).str.strip().apply(clean_sku)
    df_master['SKU_Name'] = df_master['SKU_Name'].astype(str).str.strip().apply(clean_sku)
    
    # Dedup scrape
    df_scrape = df_scrape.drop_duplicates(subset=['sku_clean'])
    print(f"After dedup: {len(df_scrape)} unique products")
    
    # Merge
    df_merged = pd.merge(
        df_master,
        df_scrape,
        left_on='SKU_Name',
        right_on='sku_clean',
        how='left',
        suffixes=('_Master', '_Scrape')
    )
    
    matched = df_merged[df_merged['sku'].notna()]
    missing = df_merged[df_merged['sku'].isna()]
    
    print(f"\n=== MERGE RESULTS ===")
    print(f"Total Master list: {len(df_master)}")
    print(f"Matched with scrape: {len(matched)}")
    print(f"Still missing: {len(missing)}")
    
    # Create final Golden Record
    golden = df_merged.copy()
    
    # Fill in prices from scrape
    golden['Price_1pc'] = golden['price1pc']
    
    # Save Complete Golden Record
    golden.to_excel('data/Complete_Golden_Record.xlsx', index=False)
    print(f"\nSaved Complete_Golden_Record.xlsx")
    
    # Create JSON output
    output = []
    for _, row in golden.iterrows():
        record = {
            'sku': row['SKU_Name'],
            'name': row.get('name', ''),
            'family': row.get('Family_Name', ''),
            'parent': row.get('Parent_Name', ''),
            'type_code': row.get('Type_Code', ''),
            'bottle_shape': row.get('Bottle_Shape', ''),
            'capacity_oz': row.get('Capacity_OZ', row.get('capacityOz', '')),
            'capacity_ml': row.get('Capacity_ML', row.get('capacityMl', '')),
            'applicator': row.get('Applicator', ''),
            'color': row.get('Color', ''),
            'cap_color': row.get('Cap_Color', ''),
            'neck_thread': row.get('Neck_Thread_Size', row.get('neckThread', '')),
            'use_case': row.get('Use_Case', ''),
            'description': row.get('description', row.get('Description', '')),
            'price_1pc': row.get('price1pc', ''),
            'prices': row.get('prices', []),
            'image_url': row.get('imageUrl', ''),
            'product_url': row.get('productUrl', ''),
            'inventory_id': row.get('Inventory_ID', ''),
            'source_sheet': row.get('Source_Sheet', ''),
            'has_scrape_data': pd.notna(row.get('sku'))
        }
        
        # Clean NaN
        for key in record:
            val = record[key]
            if isinstance(val, list):
                continue
            try:
                if pd.isna(val):
                    record[key] = '' if isinstance(val, str) else None
            except:
                pass
        
        output.append(record)
    
    with open('data/complete_products.json', 'w') as f:
        json.dump(output, f, indent=2, default=str)
    print(f"Saved complete_products.json ({len(output)} products)")
    
    # Save list of missing for future scrape
    missing[['SKU_Name', 'Description']].to_csv('data/still_missing_skus.csv', index=False)
    print(f"Saved still_missing_skus.csv ({len(missing)} items)")

if __name__ == "__main__":
    main()
