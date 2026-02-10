#!/usr/bin/env python3
"""
Scrape All Sub-Categories from BestBottles.com
Extracts the full category hierarchy including sub-categories
"""

import requests
from bs4 import BeautifulSoup
import json
import os
from dotenv import load_dotenv

load_dotenv()

def scrape_all_categories():
    """Scrape all main categories and their sub-categories"""
    
    base_url = "https://www.bestbottles.com"
    
    # Start from main page or category listing
    main_url = "https://www.bestbottles.com/all-bottles/"
    
    print("🔍 Scraping Category Structure")
    print("=" * 70)
    
    try:
        response = requests.get(main_url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        categories = []
        
        # Look for category navigation/menu
        # Check for main category links
        category_links = soup.find_all('a', href=True)
        
        # Filter for category links (usually contain "purchase.php" or category paths)
        category_patterns = [
            r'/all-bottles/.*purchase\.php',
            r'/all-bottles/[^/]+/[^/]+',
            r'category',
            r'purchase\.php'
        ]
        
        found_categories = set()
        
        for link in category_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Check if it's a category link
            if any(pattern in href for pattern in category_patterns):
                full_url = href if href.startswith('http') else f"{base_url}{href.lstrip('/')}"
                
                # Avoid duplicates
                if full_url not in found_categories and text:
                    found_categories.add(full_url)
                    
                    # Try to determine if it's main or sub-category
                    is_sub = 'purchase.php' in href or len([c for c in href.split('/') if c]) > 4
                    
                    categories.append({
                        'url': full_url,
                        'text': text,
                        'is_subcategory': is_sub
                    })
        
        print(f"Found {len(categories)} category links")
        
        # Also check the navigation structure from the images you showed
        # Main categories from your images:
        main_categories = [
            {
                'text': 'Perfume vials, Bottles, Roll on bottles and Decorative glass Bottles',
                'url': 'https://www.bestbottles.com/all-bottles/Perfume-vials-glass-bottles/Perfume-glas-bottle-vials-purchase.php',
                'subcategories': []
            },
            {
                'text': 'Perfume Atomizers, Sprayers, Aluminum Bottles & Cans',
                'url': 'https://www.bestbottles.com/all-bottles/Perfume-atomizer-aluminum-bottle-cans/Perfume-atomizer-Aluminum-bottle-cans-purchase.php',
                'subcategories': [
                    'Metal Shell Perfume Atomizers',
                    'Glass Bottles with Fine Mist Sprayers',
                    'Brushed Aluminum Bottles, Sprayers And Cans',
                    'Plastic Bottles With Fine Mist Sprayers',
                    'Classic Perfume Spray Bottles',
                    'Antique Style Bulb Spray Bottles'
                ]
            },
            {
                'text': 'Perfume Accessories and Packaging',
                'url': 'https://www.bestbottles.com/all-bottles/accessories/velvet-bags-organza-gusseted-bags-gift-box-purchase.php',
                'subcategories': []
            },
            {
                'text': 'Cream Jars and Lotion Bottles',
                'url': 'https://www.bestbottles.com/all-bottles/lotion-pump-cream-jars/lotion-pumps-bottles-cream-jars-purchase.php',
                'subcategories': []
            }
        ]
        
        # Try to find sub-category URLs by visiting main category pages
        print("\n🔍 Extracting sub-categories from main category pages...")
        
        for main_cat in main_categories:
            try:
                cat_response = requests.get(main_cat['url'], timeout=10)
                cat_soup = BeautifulSoup(cat_response.text, 'html.parser')
                
                # Look for sub-category links in the page
                sub_links = cat_soup.find_all('a', href=True)
                
                for link in sub_links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    
                    # Check if text matches known sub-categories
                    for known_sub in main_cat['subcategories']:
                        if known_sub.lower() in text.lower() or text.lower() in known_sub.lower():
                            full_url = href if href.startswith('http') else f"{base_url}{href.lstrip('/')}"
                            
                            # Add to subcategories if not already there
                            if full_url not in [s.get('url') for s in main_cat.get('subcategories', []) if isinstance(s, dict)]:
                                if not any(isinstance(s, dict) and s.get('url') == full_url for s in main_cat.get('subcategories', [])):
                                    if isinstance(main_cat['subcategories'], list):
                                        # Convert string to dict if needed
                                        sub_index = main_cat['subcategories'].index(known_sub) if known_sub in main_cat['subcategories'] else -1
                                        if sub_index >= 0:
                                            main_cat['subcategories'][sub_index] = {
                                                'text': known_sub,
                                                'url': full_url
                                            }
                                        else:
                                            main_cat['subcategories'].append({
                                                'text': known_sub,
                                                'url': full_url
                                            })
                
                print(f"  ✅ {main_cat['text'][:50]}...")
                
            except Exception as e:
                print(f"  ⚠️  Error scraping {main_cat['text']}: {e}")
        
        # Save category structure
        output = {
            'main_categories': main_categories,
            'scraped_links': categories
        }
        
        with open('category_structure.json', 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\n✅ Saved category structure to category_structure.json")
        print(f"   Found {len(main_categories)} main categories")
        print(f"   Found {sum(len(cat.get('subcategories', [])) for cat in main_categories)} sub-categories")
        
        return output
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


if __name__ == '__main__':
    scrape_all_categories()

