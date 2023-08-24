require('dotenv').config();

const express = require('express');
const ozonRoutes = require('./routes/ozonRoutes');

const app = express();

app.use(express.json());

app.use('/api/ozon', ozonRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});