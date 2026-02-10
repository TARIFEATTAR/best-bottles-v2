import "dotenv/config";
import fetch from "node-fetch";

const TOKEN = process.env.BROWSERLESS_TOKEN;

if (!TOKEN) {
  console.error("❌ Missing BROWSERLESS_TOKEN in .env");
  process.exit(1);
}

const SCRAPE_ENDPOINT = `https://production-sfo.browserless.io/scrape?token=${TOKEN}`;

const body = {
  url: "https://www.bestbottles.com/",
  elements: [{ selector: "html" }],
  gotoOptions: {
    timeout: 30000,
    waitUntil: "networkidle2"
  }
};

console.log("🔎 Sending request to Browserless...");

const res = await fetch(SCRAPE_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
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
  process.exit(1);
}

if (!res.ok) {
  const errorText = await res.text();
  console.error(`❌ HTTP ${res.status}: ${errorText.substring(0, 500)}`);
  process.exit(1);
}

const json = await res.json();

console.log("\n🧩 RAW BROWSERLESS RESPONSE:\n");
console.log(JSON.stringify(json, null, 2));
