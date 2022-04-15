require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
const sequelize = require('./db');
const models = require('./models/models');
const router = require('./routes/index');
const { DataTypes } = require('sequelize');
const fileUpload = require('express-fileupload');

const app = express();

app.use(cors());
app.use(fileUpload({}));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  next();
});

app.use('/api', router);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(process.env.PORT || 5000, () => console.log('Start server ' + process.env.PORT || 5000));
  } catch (e) {
    console.log(e);
  }
}
start();
