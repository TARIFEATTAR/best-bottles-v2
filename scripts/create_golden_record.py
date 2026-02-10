
import re
import os
import pandas as pd

def clean_sku(sku):
    if not isinstance(sku, str):
        return str(sku)
    new_sku = re.sub(r'0(\d)oz', r'\1oz', sku, flags=re.IGNORECASE)
    new_sku = re.sub(r'0(\d)ml', r'\1ml', new_sku, flags=re.IGNORECASE)
    return new_sku

def main():
    print("Loading datasets...")
    # Load Verified Master List (Cleaner already applied cleaning, but let's be safe or just use it)
    master_path = 'data/BB_MasterList_ZD_V1_CLEANED.xlsx'
    if not os.path.exists(master_path):
        print(f"Error: {master_path} not found")
        return

    df_master = pd.read_excel(master_path)
    print(f"Master List: {len(df_master)} products")
    
    # Load Scrape Data
    scrape_path = 'archive/data/bestbottles_inventory_complete.csv'
    if not os.path.exists(scrape_path):
        print(f"Error: {scrape_path} not found")
        return
        
    df_scrape = pd.read_csv(scrape_path)
    print(f"Scrape Data: {len(df_scrape)} products")
    
    # Clean SKUs in Scrape to match Master
    df_scrape['SKU_Original'] = df_scrape['SKU']
    df_scrape['SKU'] = df_scrape['SKU'].astype(str).str.strip().apply(clean_sku)
    
    # Clean SKUs in Master (just in case)
    df_master['SKU_Name'] = df_master['SKU_Name'].astype(str).str.strip().apply(clean_sku)
    
    # Remove duplicates in Scrape (keep first)
    df_scrape = df_scrape.drop_duplicates(subset=['SKU'])
    print(f"Scrape Data after dedup: {len(df_scrape)} products")

    print("Merging...")
    # Merge left
    df_merged = pd.merge(
        df_master, 
        df_scrape, 
        left_on='SKU_Name', 
        right_on='SKU', 
        how='left',
        suffixes=('_Master', '_Scrape')
    )
    
    print(f"Merged count: {len(df_merged)}")
    
    matched = df_merged[df_merged['SKU'].notna()]
    missing = df_merged[df_merged['SKU'].isna()]
    
    print(f"Matches found: {len(matched)}")
    print(f"Missing in Scrape: {len(missing)}")
    
    if len(missing) > 0:
        print("Sample missing items:")
        print(missing[['SKU_Name']].head())

    # Create Golden Record
    golden = df_merged.copy()
    
    # Fill prices
    golden['Price_Tier1'] = golden['Price_1pc']
    golden['Price_Tier2'] = golden['Price_12pc']
    golden['Price_Tier3'] = golden['Price_144pc']
    golden['Price_Tier4'] = golden['Best_Bulk_Price'] # Use Bulk as Tier 4? Or logic
    
    # Update Description: prioritize Scrape > Master
    # Master col: 'Description' (from cleaned file which preserved original ODS cols?)
    # Let's check columns using .columns
    
    desc_master_col = 'Description' if 'Description' in df_master.columns else 'ODS_Description'
    if desc_master_col not in golden.columns:
        # It might be suffixed
        desc_master_col = 'Description_Master'
    
    # Scrape col: 'Description' -> 'Description_Scrape'
    
    if 'Description_Scrape' in golden.columns:
         golden['Description'] = golden['Description_Scrape'].combine_first(golden[desc_master_col])
    
    # Save Golden Record
    golden_path = 'data/Golden_Record_BestBottles.xlsx'
    golden.to_excel(golden_path, index=False)
    print(f"Saved Golden Record to {golden_path}")
    
    # Save Report
    # Select cols
    report_cols = ['SKU_Name', 'SKU', 'Price_Tier1', 'Description']
    # Check if they exist
    existing_cols = [c for c in report_cols if c in golden.columns]
    report = golden[existing_cols]
    report['Status'] = report['SKU'].apply(lambda x: 'Found' if pd.notna(x) else 'Missing')
    
    report.to_csv('data/golden_record_report.csv', index=False)
    print("Saved report to data/golden_record_report.csv")

if __name__ == "__main__":
    main()
