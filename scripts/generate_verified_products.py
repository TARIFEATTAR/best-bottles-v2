
import pandas as pd
import json
import os

def main():
    print("Loading Golden Record...")
    golden_path = 'data/Golden_Record_BestBottles.xlsx'
    
    if not os.path.exists(golden_path):
        print(f"Error: {golden_path} not found")
        return
    
    df = pd.read_excel(golden_path)
    print(f"Total products: {len(df)}")
    
    # Filter to verified only (those with a match from scrape)
    verified = df[df['SKU'].notna()].copy()
    print(f"Verified products: {len(verified)}")
    
    # Create clean output for Shopify/Sanity/Convex
    output_records = []
    
    for _, row in verified.iterrows():
        record = {
            'sku': row['SKU_Name'],
            'name': row.get('Description_Scrape', row.get('Description', '')),
            'family': row.get('Family_Name', ''),
            'parent': row.get('Parent_Name', ''),
            'type_code': row.get('Type_Code', ''),
            'type_name': row.get('Type_Full_Name', ''),
            'bottle_shape': row.get('Bottle_Shape', ''),
            'capacity_oz': row.get('Capacity_OZ', ''),
            'capacity_ml': row.get('Capacity_ML', ''),
            'applicator': row.get('Applicator', ''),
            'color': row.get('Color_Master', row.get('Color', '')),
            'cap_color': row.get('Cap_Color', ''),
            'neck_thread': row.get('Neck_Thread_Size', row.get('Neck_Finish', '')),
            'material': row.get('Material', ''),
            'use_case': row.get('Use_Case', row.get('Use_Cases', '')),
            'description': row.get('Description_Scrape', row.get('Description', '')),
            'price_1pc': row.get('Price_Tier1', row.get('Price_1pc', '')),
            'price_12pc': row.get('Price_Tier2', row.get('Price_12pc', '')),
            'price_144pc': row.get('Price_Tier3', row.get('Price_144pc', '')),
            'bulk_price': row.get('Price_Tier4', row.get('Best_Bulk_Price', '')),
            'min_order_qty': row.get('Min_Order_Qty', 1),
            'image_url': row.get('Image_URL', ''),
            'product_url': row.get('Product_URL', ''),
            'main_category': row.get('Main_Category', ''),
            'sub_category': row.get('Sub_Category', ''),
            'tags': row.get('Tags', ''),
            'inventory_id': row.get('Inventory_ID', ''),
            'source_sheet': row.get('Source_Sheet', ''),
            'verified': True
        }
        
        # Clean up NaN values
        for key in record:
            if pd.isna(record[key]):
                record[key] = '' if isinstance(record[key], str) else None
        
        output_records.append(record)
    
    # Save as JSON
    json_path = 'data/verified_products.json'
    with open(json_path, 'w') as f:
        json.dump(output_records, f, indent=2, default=str)
    print(f"Saved {len(output_records)} verified products to {json_path}")
    
    # Save as Excel
    verified_df = pd.DataFrame(output_records)
    excel_path = 'data/Verified_Products_BestBottles.xlsx'
    verified_df.to_excel(excel_path, index=False)
    print(f"Saved to {excel_path}")
    
    # Summary
    print("\n=== Summary ===")
    print(f"Total Master List: {len(df)}")
    print(f"Verified (with pricing): {len(verified)}")
    print(f"Pending verification: {len(df) - len(verified)}")
    
    # Save pending for reference
    pending = df[df['SKU'].isna()][['SKU_Name', 'Family_Name', 'Bottle_Shape', 'Capacity_OZ', 'Description']].copy()
    pending_path = 'data/pending_verification.csv'
    pending.to_csv(pending_path, index=False)
    print(f"Saved {len(pending)} pending items to {pending_path}")

if __name__ == "__main__":
    main()
