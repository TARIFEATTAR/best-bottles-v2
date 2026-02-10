/**
 * Scrape all products from bestbottles.com
 * Run with: node scripts/scrape_all_products.js
 */

const fs = require('fs');

// Product URLs from sitemap map - we'll use fetch to get product pages
const BASE_URL = 'https://www.bestbottles.com';

async function fetchProductPage(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        return html;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

function extractProductData(html, url) {
    if (!html) return null;

    // Extract SKU from title (usually in format "GBxxxxxx")
    const skuMatch = html.match(/<h1[^>]*>([A-Z]{2,3}[A-Za-z0-9]+)<\/h1>/);
    const sku = skuMatch ? skuMatch[1] : null;

    // Extract description from meta
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1] : '';

    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract image URL
    const imgMatch = html.match(/src="(https:\/\/www\.bestbottles\.com\/images\/store\/enlarged_pics\/[^"]+)"/);
    const imageUrl = imgMatch ? imgMatch[1] : '';

    // Extract pricing - look for price patterns like "$0.42"
    const priceMatches = html.match(/\$(\d+\.\d{2})/g) || [];
    const prices = priceMatches.map(p => p);

    // Extract capacity
    const capacityMatch = html.match(/(\d+)\s*ml\s*\(([^)]+)\)/i);
    const capacityMl = capacityMatch ? capacityMatch[1] : '';
    const capacityOz = capacityMatch ? capacityMatch[2] : '';

    // Extract dimensions
    const heightMatch = html.match(/Height with Cap:<\/b>\s*(\d+[^<]+)/i);
    const widthMatch = html.match(/Width:<\/b>\s*(\d+[^<]+)/i);

    // Extract neck thread
    const neckMatch = html.match(/Neck Thread Size:<\/b>\s*([^<]+)/i);
    const neckThread = neckMatch ? neckMatch[1].trim() : '';

    return {
        sku: sku || url.split('/').pop(),
        name: title.split('.')[0] || '',
        description,
        imageUrl,
        productUrl: url,
        capacityMl,
        capacityOz,
        prices,
        price1pc: prices[0] || '',
        neckThread,
        heightWithCap: heightMatch ? heightMatch[1].trim() : '',
        width: widthMatch ? widthMatch[1].trim() : ''
    };
}

async function main() {
    console.log('Starting product scrape...');

    // Read existing inventory to get URLs
    let urls = [];

    // Try to get URLs from the archive data
    try {
        const csvData = fs.readFileSync('archive/data/bestbottles_inventory_complete.csv', 'utf-8');
        const lines = csvData.split('\n').slice(1); // Skip header
        urls = lines
            .map(line => {
                const cols = line.split(',');
                return cols[cols.length - 1]?.replace(/"/g, '').trim();
            })
            .filter(url => url && url.startsWith('http'));

        // Dedupe
        urls = [...new Set(urls)];
        console.log(`Found ${urls.length} unique product URLs from archive`);
    } catch (e) {
        console.log('Could not read archive, will need to discover URLs');
    }

    if (urls.length === 0) {
        console.log('No URLs found. Please provide product URLs.');
        return;
    }

    const products = [];
    let count = 0;

    for (const url of urls) {
        count++;
        if (count % 50 === 0) {
            console.log(`Progress: ${count}/${urls.length}`);
        }

        const html = await fetchProductPage(url);
        const product = extractProductData(html, url);

        if (product && product.sku) {
            products.push(product);
        }

        // Small delay to be nice to the server
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\nScraped ${products.length} products`);

    // Save results
    fs.writeFileSync('data/scraped_products.json', JSON.stringify(products, null, 2));
    console.log('Saved to data/scraped_products.json');
}

main().catch(console.error);
