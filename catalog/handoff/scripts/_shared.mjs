import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Same .env.local loader the existing drivers use. */
export function loadEnvLocal() {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    try {
        const raw = fs.readFileSync(envPath, "utf-8");
        for (const line of raw.split("\n")) {
            const t = line.trim();
            if (!t || t.startsWith("#")) continue;
            const i = t.indexOf("=");
            if (i < 0) continue;
            const k = t.slice(0, i).trim();
            let v = t.slice(i + 1).trim();
            if (v.includes("#")) v = v.slice(0, v.indexOf("#")).trim();
            v = v.replace(/^["']|["']$/g, "");
            if (!process.env[k]) process.env[k] = v;
        }
    } catch { /* .env.local is optional when CONVEX_URL is exported */ }
}

export function convexUrl() {
    const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
        console.error("Missing CONVEX_URL / NEXT_PUBLIC_CONVEX_URL");
        process.exit(1);
    }
    return url;
}

/**
 * Dry run is the default. Writing requires --apply, and writing to production
 * additionally requires --i-know-this-is-production, so a copied command line
 * cannot mutate the live catalog by accident.
 */
export function runMode(url) {
    const apply = process.argv.includes("--apply");
    const isProd = url.includes("precise-raccoon-123");
    if (apply && isProd && !process.argv.includes("--i-know-this-is-production")) {
        console.error(
            "\nRefusing to write to PRODUCTION Convex without an explicit acknowledgement.\n" +
            "Re-run with:  --apply --i-know-this-is-production\n",
        );
        process.exit(2);
    }
    return { apply, isProd, dryRun: !apply };
}

export function loadPayload(file) {
    const p = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) {
        console.error(
            `Payload not found: ${p}\n\n` +
            "Generate it from the best-bottles-v2 repo:\n" +
            "  npm run catalog:corrections -- \\\n" +
            "    --scrape <storefront>/docs/reviews/audit-2026-08-06/live-site-full-scrape.json \\\n" +
            "    --convex <storefront>/Nemat_Product_Catalog.csv \\\n" +
            "    --specs  <storefront>/data/grace_products_clean.json\n",
        );
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function banner({ url, dryRun, count, what }) {
    console.log(`Target:   ${url}`);
    console.log(`Mode:     ${dryRun ? "DRY RUN (no writes) — pass --apply to write" : "APPLY (writing)"}`);
    console.log(`Payload:  ${count} ${what}\n`);
}
