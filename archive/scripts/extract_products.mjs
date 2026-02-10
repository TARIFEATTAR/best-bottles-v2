import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// ----------------------------------------
// Browserless HTML fetcher (Production-safe)
// ----------------------------------------
async function getHTML(url) {
  const endpoint = `https://production-sfo.browserless.io/scrape?token=${process.env.BROWSERLESS_TOKEN}`;

  const payload = {
    url,
    elements: [
      {
        selector: "html"
      }
    ],
    gotoOptions: {
      waitUntil: "networkidle2",
      timeout: 60000
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // Check status code first
  if (res.status === 402) {
    const errorText = await res.text();
    console.error("\n❌ HTTP 402 - Payment Required");
    console.error("   This means your Browserless API token has run out of credits or your subscription has expired.");
    console.error("   Please check your Browserless account at https://www.browserless.io/");
    console.error(`   Error details: ${errorText.substring(0, 500)}`);
    console.error("\n   Solutions:");
    console.error("   1. Check your Browserless dashboard for remaining credits");
    console.error("   2. Upgrade your plan or add credits");
    console.error("   3. Verify your BROWSERLESS_TOKEN is correct in your .env file");
    return "";
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ HTTP ${res.status}: ${errorText.substring(0, 200)}`);
    return "";
  }

  // Try JSON
  let json;
  try {
    json = await res.json();
  } catch (err) {
    const text = await res.text();
    console.error("❌ Browserless returned NON-JSON error:\n", text);
    return "";
  }

  return json?.data?.[0]?.results?.[0]?.html || "";
}

// ----------------------------------------
// MAIN PRODUCT SCRAPER
// ----------------------------------------

async function extractProducts() {
  console.log("📦 Loading categories.json...");
  const categories = JSON.parse(fs.readFileSync("./categories.json", "utf-8"));

  let allProducts = [];

  for (const cat of categories) {
    console.log("\n🟦 CATEGORY:");
    console.log("🌐", cat.href);

    const html = await getHTML(cat.href);
    if (!html) {
      console.log("❌ No HTML — skipping.");
      continue;
    }

    // Extract product links
    const productRegex = /href="([^"]+\.php\?[^"]*prod[^"]*)"/gi;
    const matches = [...html.matchAll(productRegex)].map(m => m[1]);

    console.log(`📌 Found ${matches.length} product links.`);

    matches.forEach(href => {
      allProducts.push({
        category: cat.text.trim(),
        url: href.startsWith("http") ? href : `https://www.bestbottles.com/${href}`
      });
    });
  }

  console.log("\n💾 Saving products.json...");
  fs.writeFileSync("./products.json", JSON.stringify(allProducts, null, 2));

  console.log("✅ Done! Extracted product URLs saved to products.json.");
}

extractProducts();
