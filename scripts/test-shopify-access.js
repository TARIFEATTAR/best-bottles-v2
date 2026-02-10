
const shop = 'bestbottles-1581.myshopify.com';
const accessToken = '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';

async function testAccess() {
    const url = `https://${shop}/admin/api/2024-01/shop.json`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

testAccess();
