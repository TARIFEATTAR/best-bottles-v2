
const shop = 'bestbottles-1581.myshopify.com';
const accessToken = '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';

async function testToken() {
    const url = `https://${shop}/admin/api/2024-01/products.json?limit=1`;
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

testToken();
