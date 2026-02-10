
import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://www.bestbottles.com';
const MAIN_URL = 'https://www.bestbottles.com/all-bottles/Perfume-vials-glass-bottles/roll-on-roller-bottles-frosted-black-silver-gold-white-caps.php';

// Browserless Fetcher
async function getHTML(url) {
    const token = process.env.BROWSERLESS_TOKEN;
    const endpoint = `https://production-sfo.browserless.io/scrape?token=${token}`;

    const payload = {
        url,
        elements: [{ selector: "html" }],
        gotoOptions: { waitUntil: "networkidle2", timeout: 60000 }
    };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
            return null;
        }

        const json = await res.json();
        return json?.data?.[0]?.results?.[0]?.html || null;
    } catch (err) {
        console.error(`Exception fetching ${url}:`, err);
        return null;
    }
}


async function scrapeDetails() {
    console.log(`Starting scrape of Roll-ons from ${MAIN_URL}`);

    // 1. Get Main Page to find subcategories
    const mainHtml = await getHTML(MAIN_URL);
    if (!mainHtml) {
        console.error("Failed to load main page.");
        return;
    }

    const $ = cheerio.load(mainHtml);
    const subcatLinks = new Set();

    // Convert relative URLs to absolute
    const resolveUrl = (link) => link.startsWith('http') ? link : (link.startsWith('/') ? `${BASE_URL}${link}` : `${MAIN_URL}/../${link}`); // Simple resolving, might need better path handling if relative is tricky, but usually bestbottles links are relative to root or absolute.
    // bestbottles links often look like product/... or all-bottles/...
    // Let's assume standard relative handling.

    const relevantSubcats = ['67', '68', '69', '70', '79', '80', '82', '83'];

    // Find subcategory links (usually in the content area). 
    $('a[href*="subcat="]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            // Check if it matches relevant IDs
            const match = href.match(/subcat=(\d+)/);
            if (match && relevantSubcats.includes(match[1])) {
                let absoluteUrl = href;
                if (!href.startsWith('http')) {
                    if (href.startsWith('/')) {
                        absoluteUrl = BASE_URL + href;
                    } else {
                        if (href.startsWith('?')) {
                            absoluteUrl = MAIN_URL + href;
                        } else {
                            absoluteUrl = BASE_URL + '/' + href;
                        }
                    }
                }
                subcatLinks.add(absoluteUrl);
            }
        }
    });

    console.log(`Found ${subcatLinks.size} subcategory links.`);

    const productLinks = new Set();

    // Function to extract products from a page
    const extractProductsFromPage = (html, pageUrl) => {
        const $p = cheerio.load(html);
        $p('a[href*="/product/"], a[href*="prod="]').each((i, el) => {
            let href = $p(el).attr('href');
            if (href) {
                // Determine absolute URL
                if (!href.startsWith('http')) {
                    if (href.startsWith('/')) {
                        href = BASE_URL + href;
                    } else {
                        href = BASE_URL + '/' + href; // Naive, but works for most structure
                    }
                }
                productLinks.add(href);
            }
        });
    };

    // Extract items from Main Page too (sometimes they are listed directly)
    extractProductsFromPage(mainHtml, MAIN_URL);

    // 2. Visit Subcategories
    for (const subLink of subcatLinks) {
        console.log(`Visiting subcategory: ${subLink}`);
        const subHtml = await getHTML(subLink);
        if (subHtml) {
            extractProductsFromPage(subHtml, subLink);
        }
    }

    console.log(`Found ${productLinks.size} unique product links.`);

    // 3. Visit Products and Scrape Details
    const products = [];
    let count = 0;

    for (const prodLink of productLinks) {
        count++;
        console.log(`[${count}/${productLinks.size}] Scraping Product: ${prodLink}`);
        const pHtml = await getHTML(prodLink);
        if (!pHtml) continue;

        const $p = cheerio.load(pHtml);

        // Extract Data
        // Based on CSV, we expect SKU, Desc, etc.
        // On the page, we usually look for specific labels.

        // Helper to find text by label
        const findByLabel = (label) => {
            // Try to find a b or strong tag with the label, then get next sibling or parent text
            // Or look for text containing label
            // This is a heuristic.

            // "Item Name: SKU123"
            const regex = new RegExp(label, 'i');
            const el = $p('*').filter((i, el) => regex.test($p(el).text()) && $p(el).children().length === 0).first();
            if (el.length) {
                // Try to get clean text. Often "Item Name: Value" is in one element.
                const text = el.parent().text(); // get parent text to include value?
                // Or maybe just the node text itself?
                // Let's assume the label and value are close.
                // Inspecting typical structure: <b>Item Name:</b> GBCyl5<br>
                const parent = el.parent();
                return parent.text().replace(regex, '').trim();
            }
            return "";
        };

        const sku = findByLabel('Item Name:').split('\n')[0].trim();
        const description = findByLabel('Item Description:').trim();
        const capacity = findByLabel('Item Capacity:').trim();
        const heightWithCap = findByLabel('Item Height with Cap:').trim();
        const diameter = findByLabel('Item Diameter:').trim();
        const neckFinish = findByLabel('Neck Thread Size:').trim();

        // Price hard to catch with generic label usually.
        // Look for price selector. Often .price or text "$..."
        let price = "";
        const priceMatch = $p('body').text().match(/\$(\d+\.\d{2})\/pc/); // "$0.60/pc"
        if (priceMatch) price = priceMatch[1];

        // Image
        let imageUrl = "";
        // Look for main image. Often largest or first inside a gallery div.
        const img = $p('img[src*="/enlarged_pics/"], img[src*="/caps/"]').first();
        if (img.length) {
            imageUrl = img.attr('src');
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = BASE_URL + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
            }
        }

        // Title
        // Often h1 or first bold text in content
        // "Item Name" might be SKU. "Item Type" might be category.
        const itemType = findByLabel('Item Type:').trim();

        // Roller Type detection
        let rollerType = "Unknown";
        const fullText = (description + " " + itemType + " " + $p('body').text()).toLowerCase();
        if (fullText.includes('steel roller') || fullText.includes('metal roller') || fullText.includes('stainless')) {
            rollerType = "Steel";
        } else if (fullText.includes('plastic roller')) {
            rollerType = "Plastic";
        } else if (prodLink.includes('subcat=80') || prodLink.includes('subcat=79') || prodLink.includes('subcat=82') || prodLink.includes('subcat=83')) {
            // Heuristic from subcat IDs if we knew them map perfectly
            rollerType = "Steel";
        }

        if (sku) {
            products.push({
                sku,
                name: sku, // Often name equals SKU in this dataset, or construct it
                description,
                category: "Roll-ons",
                itemType,
                rollerType,
                capacity,
                dimensions: {
                    heightWithCap,
                    diameter,
                    neckFinish
                },
                price,
                imageUrl,
                url: prodLink
            });
        }
    }

    console.log(`Scraped ${products.length} products.`);
    fs.writeFileSync('roll_ons_scraped.json', JSON.stringify(products, null, 2));
    console.log("Saved to roll_ons_scraped.json");
}

scrapeDetails();
