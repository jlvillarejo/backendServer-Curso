var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');

  // Verificamos que la imágen existe
  var pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (fs.existsSync(pathImg)) {
    res.sendFile(pathImg);
  } else {
    res.sendFile(pathNoImg);
  }
});

module.exports = app;
