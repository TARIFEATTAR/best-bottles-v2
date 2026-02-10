
const shop = 'bestbottles-1581.myshopify.com';
const accessToken = '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';

async function testScopes() {
    const url = `https://${shop}/admin/oauth/access_scopes.json`;
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

testScopes();
