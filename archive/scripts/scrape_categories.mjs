import "dotenv/config";
import fetch from "node-fetch";

const TOKEN = process.env.BROWSERLESS_TOKEN;

const endpoint = `https://chrome.browserless.io/scrape?token=${TOKEN}`;
// ^^^ This is the correct modern endpoint

async function run() {
  console.log("🚀 Fetching Best Bottles homepage...");

  const body = {
    url: "https://www.bestbottles.com/",
    elements: [
      {
        selector: "html",       // extract HTML
        // ❌ DO NOT add "type" (Browserless rejects it)
      }
    ],
    gotoOptions: {
      waitUntil: "networkidle2",
      timeout: 60000
    }
  };

  const res = await fetch(endpoint, {
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
    return;
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ HTTP ${res.status}: ${errorText.substring(0, 500)}`);
    return;
  }

  const json = await res.json();
  console.log("\nRAW RESPONSE:\n", JSON.stringify(json, null, 2));

  // Extract HTML safely
  const html = json?.data?.[0]?.results?.[0]?.html ?? "";
  console.log(`\n📄 HTML LENGTH: ${html.length}`);

  if (!html.length) {
    console.log("❌ No HTML returned — still blocked.");
    return;
  }

  console.log("✅ SUCCESS — HTML retrieved!");
}

run();
