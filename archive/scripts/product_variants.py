#!/usr/bin/env python3
"""
Product Variant Grouping System
Groups products by base design and shows available sizes/colors
"""

import json
import re
from typing import Dict, List, Optional
from collections import defaultdict

def load_inventory():
    """Load the inventory dump"""
    with open('inventory_dump.json', 'r') as f:
        return json.load(f)


def extract_base_product_key(product: Dict) -> tuple:
    """
    Extract a base key for grouping variants
    Returns: (base_sku, capacity_base)
    Examples:
    - GBCyl5SpryBlkMatt, GBCyl5SpryGold -> ("GBCyl5Spry", "GBCylSpry")
    - GBCyl10SpryBlk, GBCyl10SpryGold -> ("GBCyl10Spry", "GBCylSpry")
    """
    sku = product.get('sku', '')
    if not sku:
        return None, None
    
    # Remove common color/style suffixes (case-insensitive)
    color_suffixes = [
        r'Blk(Matt|Matt)?$', r'Gold$', r'Silver$', r'Wht$', r'Cl$',
        r'Copper$', r'Bronze$', r'Blue$', r'Red$', r'Green$',
        r'Black$', r'White$', r'Clear$', r'Matte?$', r'Matt$'
    ]
    
    base_sku = sku
    for suffix in color_suffixes:
        base_sku = re.sub(suffix, '', base_sku, flags=re.IGNORECASE)
    
    # Also try to extract capacity-independent base
    # GBCyl5Spry, GBCyl10Spry -> GBCylSpry
    # Pattern: Remove numbers before ml/oz
    capacity_base = re.sub(r'(\d+)(ml|oz)', r'\2', base_sku, flags=re.IGNORECASE)
    # Also remove standalone numbers
    capacity_base = re.sub(r'\d+', '', capacity_base)
    
    return base_sku, capacity_base


def group_product_variants(products: List[Dict]) -> Dict[str, Dict]:
    """
    Group products by base design
    Returns: {
        'base_sku': {
            'base_product': {...},
            'variants': [
                {'sku': '...', 'color': '...', 'capacity': '...', ...},
                ...
            ],
            'available_sizes': ['5ml', '10ml', '30ml'],
            'available_colors': ['black', 'gold', 'silver']
        }
    }
    """
    variant_groups = defaultdict(lambda: {
        'variants': [],
        'base_product': None,
        'available_sizes': set(),
        'available_colors': set(),
        'available_materials': set()
    })
    
    for product in products:
        sku = product.get('sku', '')
        if not sku:
            continue
        
        base_key, capacity_base = extract_base_product_key(product)
        if not base_key:
            continue
        
        # Add to variant group
        variant_data = {
            'sku': sku,
            'color': product.get('color', ''),
            'material': product.get('material', ''),
            'capacity': product.get('features', {}).get('Capacity', ''),
            'description': product.get('description', ''),
            'image_url': product.get('image_url'),
            'url': product.get('url'),
            'pricing_tiers': product.get('pricing_tiers', {}),
            'neck_size': product.get('features', {}).get('Neck_Finish', '')
        }
        
        variant_groups[base_key]['variants'].append(variant_data)
        
        # Track available options
        if variant_data['capacity']:
            variant_groups[base_key]['available_sizes'].add(variant_data['capacity'])
        if variant_data['color']:
            variant_groups[base_key]['available_colors'].add(variant_data['color'])
        if variant_data['material']:
            variant_groups[base_key]['available_materials'].add(variant_data['material'])
        
        # Set first variant as base product
        if not variant_groups[base_key]['base_product']:
            variant_groups[base_key]['base_product'] = variant_data
    
    # Convert sets to sorted lists
    for group in variant_groups.values():
        group['available_sizes'] = sorted(list(group['available_sizes']))
        group['available_colors'] = sorted(list(group['available_colors']))
        group['available_materials'] = sorted(list(group['available_materials']))
    
    # Remove duplicates (same SKU appearing multiple times)
    for group in variant_groups.values():
        seen_skus = set()
        unique_variants = []
        for variant in group['variants']:
            if variant['sku'] not in seen_skus:
                seen_skus.add(variant['sku'])
                unique_variants.append(variant)
        group['variants'] = unique_variants
    
    # Filter to groups with multiple variants
    return {k: v for k, v in variant_groups.items() if len(v['variants']) > 1}


def find_product_variants(product_sku: str, all_products: Optional[List[Dict]] = None) -> Dict:
    """
    Find all variants of a given product
    Returns: {
        'base_product': {...},
        'variants': [...],
        'available_sizes': [...],
        'available_colors': [...]
    }
    """
    if all_products is None:
        all_products = load_inventory()
    
    # Find the target product
    target_product = None
    for product in all_products:
        if product.get('sku') == product_sku:
            target_product = product
            break
    
    if not target_product:
        return {'error': f'Product {product_sku} not found'}
    
    # Group all products and find the group containing this product
    variant_groups = group_product_variants(all_products)
    
    # Find which group this product belongs to
    base_key, _ = extract_base_product_key(target_product)
    
    if base_key in variant_groups:
        group = variant_groups[base_key]
        return {
            'base_product': group['base_product'],
            'variants': group['variants'],
            'available_sizes': group['available_sizes'],
            'available_colors': group['available_colors'],
            'available_materials': group['available_materials']
        }
    else:
        # No variants found, return single product
        return {
            'base_product': target_product,
            'variants': [{
                'sku': target_product.get('sku'),
                'color': target_product.get('color', ''),
                'capacity': target_product.get('features', {}).get('Capacity', ''),
                'description': target_product.get('description', ''),
                'image_url': target_product.get('image_url'),
                'url': target_product.get('url'),
                'pricing_tiers': target_product.get('pricing_tiers', {})
            }],
            'available_sizes': [target_product.get('features', {}).get('Capacity', '')] if target_product.get('features', {}).get('Capacity') else [],
            'available_colors': [target_product.get('color', '')] if target_product.get('color') else [],
            'available_materials': [target_product.get('material', '')] if target_product.get('material') else []
        }


def get_product_with_variants(product_sku: str, all_products: Optional[List[Dict]] = None) -> Dict:
    """
    Get a product with all its variant information
    Perfect for chatbot responses like:
    "This bottle is available in 5ml, 10ml, 30ml sizes with black, gold, and silver cap options"
    """
    variants = find_product_variants(product_sku, all_products)
    
    if 'error' in variants:
        return variants
    
    base = variants['base_product']
    
    # Create a summary description
    summary_parts = []
    
    if variants['available_sizes']:
        sizes_str = ', '.join(variants['available_sizes'][:5])  # Limit to 5 sizes
        if len(variants['available_sizes']) > 5:
            sizes_str += f' and {len(variants["available_sizes"]) - 5} more'
        summary_parts.append(f"Available sizes: {sizes_str}")
    
    if variants['available_colors']:
        colors_str = ', '.join(variants['available_colors'][:5])
        if len(variants['available_colors']) > 5:
            colors_str += f' and {len(variants["available_colors"]) - 5} more'
        summary_parts.append(f"Available colors: {colors_str}")
    
    return {
        'base_product': base,
        'variants': variants['variants'],
        'summary': ' | '.join(summary_parts),
        'available_sizes': variants['available_sizes'],
        'available_colors': variants['available_colors'],
        'available_materials': variants['available_materials'],
        'variant_count': len(variants['variants'])
    }


if __name__ == '__main__':
    print('🔍 Product Variant Grouping System')
    print('=' * 70)
    
    products = load_inventory()
    print(f'Loaded {len(products)} products')
    
    # Group variants
    variant_groups = group_product_variants(products)
    print(f'\nFound {len(variant_groups)} product groups with variants')
    
    # Show examples
    print('\n📋 Example Product Variants:')
    for base_key, group in list(variant_groups.items())[:5]:
        print(f'\n  Base: {base_key} ({len(group["variants"])} variants)')
        print(f'    Sizes: {", ".join(group["available_sizes"][:5])}')
        print(f'    Colors: {", ".join(group["available_colors"][:5])}')
        print(f'    Sample SKUs: {", ".join([v["sku"] for v in group["variants"][:3]])}')

