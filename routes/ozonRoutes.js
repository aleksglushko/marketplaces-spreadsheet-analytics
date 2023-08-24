const express = require('express');
const ozonApi = require('../api/ozon');
const ozonService = require('../services/ozonService');

const router = express.Router();

router.get('/get-ozon-state', async (req, res) => {
  try {
    const productList = await ozonApi.fetchProductList();
    const productIds = productList.result.items.map((item) => item.product_id);
    const productData = await ozonService.getProductData(productIds);
    // console.log(productData)
    // console.log("Fetched product Data")
    res.json(productData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Ozon state' });
  }
});

router.post('/get-ozon-analytics', async (req, res) => {
  const reqOpts = req.body.data
  try {
    const productAnalytics = await ozonService.getProductAnalytics(reqOpts);
    res.json(productAnalytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get products Analytics' });
  }
});

router.post('/get-ozon-finances', async (req, res) => {
  const month = req.body.data
  try {
    const finances = await ozonService.getOzonFinances(month);
    res.json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get finances' });
  }
});

router.post('/update-prices-ozon', async (req, res) => {
  const newPrices = req.body.data
  console.log('Received data:', newPrices);
  try {
    const updatePrices = await ozonService.updateOzonPrices(newPrices)
    console.log(updatePrices)
    res.status(200).json({ message: 'Prices updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Ozon state' });
  }
});

router.post('/update-stocks-ozon', async (req, res) => {
  const newStocks = req.body.data
  console.log('Received data:', newStocks);
  try {
    const updatePrices = await ozonService.updateOzonStocks(newStocks)
    console.log(updatePrices)
    res.status(200).json({ message: 'Stocks updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Ozon state' });
  }
});

module.exports = router;