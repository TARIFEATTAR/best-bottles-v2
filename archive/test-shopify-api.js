const domain = 'bestbottles-1581.myshopify.com';
const token = '35f6aa3e6cf129509beff663e782b85e';

async function test() {
  const url = `https://${domain}/api/2024-01/graphql.json`;
  const query = `{
    shop {
      name
      description
    }
    products(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
