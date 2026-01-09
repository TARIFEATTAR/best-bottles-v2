import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function getBellSlug() {
    const product = await client.fetch(`*[_type == "product" && sku == "GBBell10SpryBlkSh"][0]{
        title,
        sku,
        "slug": slug.current,
        "glass": glassOptions[]->{name, "url": layerImage.asset->url},
        "fitment": fitmentVariants[]->{name, "url": layerImage.asset->url},
        "caps": capOptions[]->{name, "url": layerImage.asset->url}
    }`);
    console.log(JSON.stringify(product, null, 2));
}

getBellSlug().catch(console.error);
