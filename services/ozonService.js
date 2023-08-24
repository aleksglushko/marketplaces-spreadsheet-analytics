const { response } = require('express');
const ozonApi = require('../api/ozon');

const productCache = {};

function sort_by_name(array, index=1){
  let header = array.shift();
  let total = array.shift()

  array.sort((a, b) => {
      return a[index].localeCompare(b[index]);
  });

  array.unshift(total)
  array.unshift(header);
  return array
}

async function getProductData(productIds) {
    const RETRY_DELAY_MS = 1000; 
    var productData = [['prod_id', 'offer_id', 'name', 'reserved stock', 'present stock', 
    'selling?', 'price', 'fbs direct flow trans max amount', 
    'fbs deliv to customer amount']];
    var promises = productIds.map(async (productId) => {
        let retries = 5
        while (retries > 0){
            try {
                let cachedData = productCache[productId];
                if (cachedData && cachedData.updatedAt && (Date.now() - cachedData.updatedAt) < 120000) {
                        // If cached data exists and is less than a 2 minutes old, use it
                    productData.push(cachedData.data);
                    return;
                }
                const productInfo = await ozonApi.fetchProductInfo(productId);
                const productPrices = await ozonApi.fetchProductPrices(productId);
                const data = [
                    productInfo.id,
                    productInfo.offer_id,
                    productInfo.name,
                    productInfo.stocks.reserved,
                    productInfo.stocks.present,
                    productInfo.status.state_name,
                    Math.round(parseInt(productInfo.price)).toFixed(0),
                    productPrices.fbs_direct_flow_trans_max_amount,
                    productPrices.fbs_deliv_to_customer_amount,
                ];
                productData.push(data);
                productCache[productId] = { data, updatedAt: Date.now() }; // Update the cache with new data
                break;
            } catch (err) {
                console.log(`Failed to fetch data for product ${productId}: ${err.message}`);
                retries--;
                if (retries == 0) {
                    console.log(`Exceeded maximum number of retries for product ${productId}`);
                } else {
                    console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                }
            }
        }
    });
    await Promise.all(promises)
    console.log(productData)
    console.log("Fetched product Data")
    return productData;
  }

async function getOzonFinances(month){
    var productFinances = [[ 
                    "product_name",
                    "price",
                    "comission percent",
                    "price sale", 
                    "sale qty", 
                    "sale amount", 
                    "discount",
                    "sale comission",
                    "sale price seller", 
                    "reutrn sale",
                    "return qty",
                    "return amount",
                    "return discount",
                    "return comission",
                    "return price seller"]]
    try {
        const response = await ozonApi.fetchFinances(month)
        console.log(response)
        for (var i = 0; i < response.result.rows.length; i++) {
            var row = response.result.rows[i]
            productFinances.push([
                row.product_name,
                row.price,
                row.commission_percent,
                row.price_sale,
                row.sale_qty,
                row.sale_amount,
                row.sale_discount,
                row.sale_commission,
                row.sale_price_seller,
                row.return_sale,
                row.return_qty,
                row.return_amount,
                row.return_discount,
                row.return_commission,
                row.return_price_seller
            ])  
            }

    } catch (err) {
        console.log(`Failed to fetch finances`);
    }
    return sort_by_name(productFinances, index=0)
}

async function getProductAnalytics(dates) {
    var productAnalytics = [['product_id', 
                        "product_name",
                        "total_views",
                        "search/catalog views",
                        "product card views", 
                        "product card to bin", 
                        "ordered_units", 
                        "revenue", 
                        "total conv to cart"]]
    try {
        const response = await ozonApi.fetchProductAnalytics(dates)
        productAnalytics.push(["total", " ", response.result.totals].flat(1))
        console.log(response)
        for (var i = 1; i < response.result.data.length; i++) {
            var curr_data = response.result.data[i]
            productAnalytics.push([
                curr_data.dimensions[0].id,
                curr_data.dimensions[0].name,
                ...curr_data.metrics
            ])  
            }

    } catch (err) {
        console.log(`Failed to fetch data analytics for product`);
    }
    return sort_by_name(productAnalytics)
}

async function updateOzonPrices(data) {
    const RETRY_DELAY_MS = 1000; 
    var promises = data.map(async (product) => {
        let retries = 3
        while (retries > 0) {
            try {
                const productId = product[0]; 
                const newPrice = product[1]; 
                await ozonApi.updatePrices(productId, newPrice);
                break
            } catch (err) {
                console.log(`Failed to update price for product ${product[0]}: ${err.message}`);
                retries--;
                if (retries == 0) {
                    console.log(`Exceeded maximum number of retries for product ${product[0]}`);
                } else {
                    console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                }
            }
        } 
    });
    const response = await Promise.all(promises);
    console.log(response);
    return response;
}

async function updateOzonStocks(data) {
    const RETRY_DELAY_MS = 1000; 
    var promises = data.map(async (product) => {
        let retries = 3
        while (retries > 0) {
            try {
                const productId = product[0]; 
                const newStockValue = product[1]; 
                await ozonApi.updateStocks(productId, newStockValue);
                break
            } catch (err) {
                console.log(`Failed to update stock for product ${product[0]}: ${err.message}`);
                retries--;
                if (retries == 0) {
                    console.log(`Exceeded maximum number of retries for product ${product[0]}`);
                } else {
                    console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                }
            }
        } 
    });
    const response = await Promise.all(promises);
    console.log(response);
    return response;
}

module.exports = {
    // ... (existing exports)
    getProductData,
    getProductAnalytics,
    updateOzonPrices,
    updateOzonStocks,
    getOzonFinances
};