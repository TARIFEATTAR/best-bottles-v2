
import pandas as pd

df = pd.read_csv('sku_comparison_report.csv')

print("Total rows:", len(df))
print("Rows with ODS_Price:", df['ODS_Price'].count())

# Check usage of other columns in the original ODS (using the raw load from main script would be better, but let's re-read just to be safe or use what we have)
# Actually, I can't check other columns in the CSV because I didn't save them.
# I'll rely on my deduction or write a new peek script.

# Check descriptions
matched = df[df['Match_Found_In_Scrape'] == True]
print(f"Matches found: {len(matched)}")
# Simple exact match check (likely low because of formatting)
desc_matches = matched[matched['ODS_Description'] == matched['Scrape_Description']]
print(f"Exact Description Matches: {len(desc_matches)}")

# Show sample diffs
if len(matched) > 0:
    print("\nSample Description comparison:")
    sample = matched.head(3)
    for i, row in sample.iterrows():
         print(f"SKU: {row['Cleaned_SKU']}")
         print(f"ODS: {str(row['ODS_Description'])[:50]}...")
         print(f"Scrape: {str(row['Scrape_Description'])[:50]}...")
         print("-" * 20)


