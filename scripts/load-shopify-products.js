
const shop = 'bestbottles-1581.myshopify.com';
const accessToken = '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';

const GLASS_VARIANTS = [
    "Clear (Metal Roller)", "Clear (Plastic Roller)",
    "Amber (Metal Roller)", "Amber (Plastic Roller)",
    "Frosted (Metal Roller)", "Frosted (Plastic Roller)",
    "Cobalt (Metal Roller)", "Cobalt (Plastic Roller)",
    "Swirl (Metal Roller)", "Swirl (Plastic Roller)"
];

const CAP_VARIANTS = [
    "Shiny Gold", "Matte Gold",
    "Shiny Silver", "Matte Silver",
    "White", "Shiny Black",
    "Copper Matte", "Black Dots",
    "Pink Dots", "Silver Dots"
];

async function shopifyFetch(endpoint, method = 'GET', data = null) {
    const url = `https://${shop}/admin/api/2024-01/${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    return response.json();
}

async function createBlueprintProduct() {
    console.log("Creating Blueprint Product via REST API...");

    // 1. Create the Product
    const productData = {
        product: {
            title: "9ml Cylinder Roll-on Bottle (Custom)",
            body_html: "Demo product for the Blueprint Builder. Configuration is handled via variants.",
            vendor: "Best Bottles",
            product_type: "Custom Bottle",
            status: "active",
            options: [
                { name: "Glass & Roller" },
                { name: "Cap Finish" }
            ]
        }
    };

    const productResponse = await shopifyFetch('products.json', 'POST', productData);
    if (productResponse.errors) {
        console.error("Error creating product:", JSON.stringify(productResponse.errors, null, 2));
        return;
    }

    const productId = productResponse.product.id;
    console.log(`Created Product: ${productId}`);

    // 2. Prepare Variants
    const variants = [];
    for (const glass of GLASS_VARIANTS) {
        for (const cap of CAP_VARIANTS) {
            variants.push({
                option1: glass,
                option2: cap,
                price: "0.75",
                sku: `BB-9ML-${glass.split(' ')[0].toUpperCase()}-${cap.toUpperCase().replace(/\s+/g, '-')}`,
                inventory_policy: "continue",
                inventory_management: null
            });
        }
    }

    // Shopify REST API allows adding variants via a separate endpoint or product update.
    // Standard REST products.json POST only supports up to some variants initially.
    // Let's add them in chunks to the product.

    console.log(`Adding ${variants.length} variants...`);

    // We can't bulk add variants easily in REST without multiple calls. 
    // Let's use the product update to add variants.

    // Actually, we can just send the variants in the product object if we want.
    // But wait, the default variant was already created.

    // Let's delete the default variant and add the 100 new ones.
    // Actually, simplest is to update the product with the full variants list.
    const updateData = {
        product: {
            id: productId,
            variants: variants
        }
    };

    const updateResponse = await shopifyFetch(`products/${productId}.json`, 'PUT', updateData);
    if (updateResponse.errors) {
        console.error("Error updating variants:", JSON.stringify(updateResponse.errors, null, 2));
    } else {
        console.log(`Successfully updated product with ${updateResponse.product.variants.length} variants.`);

        // Save mapping for Sanity
        const fs = await import('fs');
        fs.writeFileSync('scripts/shopify-variants-map.json', JSON.stringify(updateResponse.product.variants, null, 2));
    }
}

createBlueprintProduct();
