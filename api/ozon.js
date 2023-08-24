const axios = require('axios');

var options = {
    method: 'POST',
    url: "",
    headers: {
      'Client-Id': '',
      'Api-Key': '',
      'Content-Type': 'application/json',
    },
    data: {},
  };

async function fetchProductInfo(productId) {
    options["url"] = "https://api-seller.ozon.ru/v2/product/info"
    options["data"] = {
        "product_id": parseInt(productId),
    }
    try {
        const response = await axios(options);
        return response.data.result;
    } catch (error) {
        throw error;
    }
}
  
async function fetchProductPrices(productId) {
    options["url"] = "https://api-seller.ozon.ru/v4/product/info/prices"
    options["data"] = {
        'filter': {
            "product_id": [parseInt(productId)] 
        },
        "last_id": "",
        "limit": 100
    }

    try {
        const response = await axios(options);
        return response.data.result.items[0].commissions;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

async function fetchFinances(month) {
    options["url"] = "https://api-seller.ozon.ru/v1/finance/realization"
    options["data"] = {
        "date": month
        }
    try {
        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

async function fetchProductAnalytics(dates) {
    options["url"] = "https://api-seller.ozon.ru/v1/analytics/data"
    options["data"] = {
        "date_from": dates[0],
        "date_to": dates[1],
        "metrics": [
            "hits_view",
            "hits_view_search",
            "hits_view_pdp", 
            "hits_tocart_pdp", 
            "ordered_units", 
            "revenue", 
            "conv_tocart"
        ],
        "dimension": [
            "sku",
        ],
        "filters": [ ],
        "sort": [
            {
                "key": "hits_view_search",
                "order": "DESC"
            }
        ],
        "limit": 1000,
        "offset": 0
        }
    try {
        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

async function fetchProductList() {
    options['data'] = {
        filter: {
            visibility: 'ALL',
        },
        last_id: "",
        limit: 1000,
        }
    options['url'] = 'https://api-seller.ozon.ru/v2/product/list'
    try {
        const response = await axios(options);
        return response.data;
    } catch (error) {
        return 'Error fetching product list:', error.response.status, error.response.data;
    }
}

async function updatePrices(productID, newPrice){
    options['url'] = "https://api-seller.ozon.ru/v1/product/import/prices"
    options['data'] = {
        "prices": [
          {
            "auto_action_enabled": "UNKNOWN",
            "currency_code": "RUB",
            "offer_id": "",
            "old_price": "0",
            "premium_price": "",
            "price": String(newPrice),
            "product_id": productID
          }
        ]
      }
    try {
        const response = await axios(options);
        console.log(response.data)
        return response
        // return response.data.result.items[0]['commissions'];
    } catch (error) {
        console.log(error)
        throw error;
    }
}

async function updateStocks(productID, newStockValue){
    options['url'] = "https://api-seller.ozon.ru/v2/products/stocks"
    options['data'] = {
        "stocks": [
          {
            "product_id": productID,
            "stock": newStockValue,
            "warehouse_id": 1020000360431000 //fbs_sku
          }
        ]
      }
    try {
        const response = await axios(options);
        console.log(response.data)
        return response
    } catch (error) {
        console.log(error)
        throw error;
    }
}

////////// test ozon endpoints here ///////////
// var res = updatePrices(478937523, 100)
// var res = fetchProductList()
// var res = updateStocks(462750014, 40)
// res.then(function(result) {
//     console.log(result) //
//  })

module.exports = {
    fetchProductInfo,
    fetchProductPrices,
    fetchProductList,
    fetchProductAnalytics,
    fetchFinances,
    updatePrices,
    updateStocks
};