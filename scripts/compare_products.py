
import pandas as pd
import json
import re

def clean_sku(sku):
    if not isinstance(sku, str):
        return str(sku)
    
    # "Any sku that has a zero that pops up in the middle of it like the example"
    # Example: GBBstn01ozBlkDrpShnGlTrim -> GBBstn1ozBlkDrpShnGlTrim
    # Specific pattern: 0 followed by a digit, specifically in a size context like 01oz -> 1oz
    # We will target '0[1-9]oz' and '0[1-9]ml' just in case, or generally 0[1-9] if it seems safe.
    # Looking at the example, it's 01oz.
    
    # Regex for 0 followed by digit followed by oz/ml
    # Ignoring case
    
    # Pattern 1: 0(\d)oz -> $1oz
    new_sku = re.sub(r'0(\d)oz', r'\1oz', sku, flags=re.IGNORECASE)
    
    # Pattern 2: 0(\d)ml -> $1ml (checking if this exists)
    new_sku = re.sub(r'0(\d)ml', r'\1ml', new_sku, flags=re.IGNORECASE)
    
    return new_sku

def parse_price(price_str):
    if isinstance(price_str, (int, float)):
        return float(price_str)
    if isinstance(price_str, str):
        # Remove $, trim
        clean = price_str.replace('$', '').strip()
        try:
            return float(clean)
        except:
            return None
    return None

def main():
    print("Loading ODS file...")
    try:
        df_ods = pd.read_excel('BB_MasterList_ZD_V1.ods', engine='calamine')
    except Exception as e:
        print(f"Error loading ODS: {e}")
        return

    print(f"Loaded {len(df_ods)} rows from ODS.")

    print("Loading Inventory JSON...")
    try:
        with open('inventory.json', 'r') as f:
            scrape_data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return
        
    print(f"Loaded {len(scrape_data)} items from Inventory.")
    
    # Index scrape data by SKU
    scrape_map = {item['sku']: item for item in scrape_data}
    
    report_rows = []
    
    # Track cleaned DataFrame
    df_cleaned = df_ods.copy()
    
    for index, row in df_ods.iterrows():
        original_sku = row.get('SKU_Name')
        if pd.isna(original_sku):
            continue
            
        original_sku = str(original_sku)
        cleaned_sku = clean_sku(original_sku)
        
        # Update cleaned dataframe
        df_cleaned.at[index, 'SKU_Name'] = cleaned_sku
        
        is_modified = original_sku != cleaned_sku
        
        match = scrape_map.get(cleaned_sku)
        
        report_row = {
            'Original_SKU': original_sku,
            'Cleaned_SKU': cleaned_sku,
            'Is_SKU_Modified': is_modified,
            'Match_Found_In_Scrape': match is not None,
            'ODS_Inventory_ID': row.get('Inventory_ID'),
            'ODS_Price': row.get('Price_Tier1'),
            'Scrape_Price': match['price'] if match else None,
            'ODS_Capacity_OZ': row.get('Capacity_OZ'),
            'ODS_Capacity_ML': row.get('Capacity_ML'),
            'Scrape_Capacity': match['capacity'] if match else None,
            'ODS_Description': row.get('Description'),
            'Scrape_Description': match['description'] if match else None
        }
        
        # Price comparison
        p1 = parse_price(report_row['ODS_Price'])
        p2 = parse_price(report_row['Scrape_Price'])
        
        if p1 is not None and p2 is not None:
            # Allow small float diff
            report_row['Price_Diff'] = abs(p1 - p2)
            report_row['Price_Match'] = report_row['Price_Diff'] < 0.01
        else:
            report_row['Price_Diff'] = None
            report_row['Price_Match'] = None
            
        report_rows.append(report_row)
        
    # Create report DF
    report_df = pd.DataFrame(report_rows)
    
    # Save Report
    report_df.to_csv('sku_comparison_report.csv', index=False)
    print("Report saved to sku_comparison_report.csv")
    
    # Save Cleaned ODS to Excel
    df_cleaned.to_excel('BB_MasterList_ZD_V1_CLEANED.xlsx', index=False)
    print("Cleaned data saved to BB_MasterList_ZD_V1_CLEANED.xlsx")
    
    # Summary
    print("\nSummary:")
    print(f"Total ODS Rows: {len(df_ods)}")
    print(f"SKUs Modified: {report_df['Is_SKU_Modified'].sum()}")
    print(f"Matches Found (using cleaned SKU): {report_df['Match_Found_In_Scrape'].sum()}")
    print(f"Price Matches: {report_df['Price_Match'].sum()}")
    
    if report_df['Is_SKU_Modified'].sum() > 0:
        print("\nSample Modified SKUs:")
        print(report_df[report_df['Is_SKU_Modified']][['Original_SKU', 'Cleaned_SKU']].head().to_string(index=False))

if __name__ == "__main__":
    main()
