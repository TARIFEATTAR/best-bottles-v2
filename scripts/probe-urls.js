import https from 'https';

const skus = [
    "GBCylBlu9RollBlkDot",
    "GBCylBlu9MtlRollBlkDot",
    "GBCylSwrl9RollBlkDot",
    "GBCylSwrl9MtlRollBlkDot"
];

const checkUrl = (sku) => {
    const url = `https://www.bestbottles.com/images/store/enlarged_pics/${sku}.gif`;
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(`${sku}: ${res.statusCode} (${url})`);
        }).on('error', (e) => {
            resolve(`${sku}: Error (${url})`);
        });
    });
};

Promise.all(skus.map(checkUrl)).then((results) => {
    console.log(results.join('\n'));
});
