const express = require('express');
const getAuthRouter = require('../api/getAuth');
const getCoverRouter = require('../api/getCover');
const getAudioStream = require("../api/getAudioStream");
const getTotalWords = require("../api/getTotalWords");


function getApp() {
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use(express.json());
  app.use(express.static('public'));

  app.use(getAuthRouter);
  app.use(getCoverRouter);
  app.use(getAudioStream);
  app.use(getTotalWords);

  return app;
}

module.exports = getApp;