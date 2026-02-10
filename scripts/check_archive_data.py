
import json
import os
import csv
import sys

# Increase CSV field size limit
try:
    csv.field_size_limit(sys.maxsize)
except:
    pass

files = [
    'archive/data/inventory_dump_backup.json',
    'archive/data/inventory_dump.json',
    'archive/data/full_inventory.json',
    'archive/data/bestbottles_inventory_complete.csv'
]

for f in files:
    path = f
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
        
    print(f"Checking {path}...")
    try:
        if path.endswith('.json'):
            with open(path, 'r') as file:
                data = json.load(file)
                if isinstance(data, list):
                    print(f"  Item count: {len(data)}")
                    if len(data) > 0:
                        print(f"  Keys: {list(data[0].keys())}")
                else:
                    print("  Not a list")
        elif path.endswith('.csv'):
            with open(path, 'r') as file:
                reader = csv.reader(file)
                rows = list(reader)
                print(f"  Row count: {len(rows)}")
                if len(rows) > 0:
                    print(f"  Columns: {rows[0]}")
    except Exception as e:
        print(f"  Error: {e}")
