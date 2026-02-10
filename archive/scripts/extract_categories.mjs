import "dotenv/config";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const TOKEN = process.env.BROWSERLESS_TOKEN;
const endpoint = `https://chrome.browserless.io/scrape?token=${TOKEN}`;

async function run() {
  console.log("🚀 Scraping Best Bottles homepage for links...");

  const body = {
    url: "https://www.bestbottles.com/",
    elements: [
      { selector: "html" }
    ],
    gotoOptions: { waitUntil: "networkidle2", timeout: 60000 }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  const html = json?.data?.[0]?.results?.[0]?.html ?? "";

  console.log(`📄 HTML LENGTH: ${html.length}`);
  if (!html.length) return console.log("❌ No HTML returned — cannot continue.");

  const dom = new JSDOM(html);
  const doc = dom.window.document;

  console.log("🔍 Extracting all <a> links...");

  const links = [...doc.querySelectorAll("a")]
    .map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }))
    .filter(a => a.href.includes("bestbottles.com"));

  console.log(`🔗 Found internal links: ${links.length}`);

  const KEYWORDS = [
    "Perfume",
    "Bottles",
    "Roll",
    "Small",
    "Large",
    "Apothecary",
    "Dropper",
    "Atomizer",
    "Accessories",
    "Cream",
    "Jar",
    "Lotion"
  ];

  const categories = links.filter(link => {
    return KEYWORDS.some(k =>
      link.text.includes(k) ||
      link.href.toLowerCase().includes(k.toLowerCase())
    );
  });

  console.log("\n📦 EXTRACTED CATEGORIES:");
  console.log(categories);

  const fs = await import("fs");
  fs.writeFileSync("./categories.json", JSON.stringify(categories, null, 2));

  console.log("\n💾 Saved categories.json");
}

run();
