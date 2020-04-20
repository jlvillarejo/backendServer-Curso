// Requires
var express = require("express");
var mongoose = require("mongoose");

// Inicializar variables
var app = express();

// Conexión a la BD
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;

    console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");
  }
);

// Rutas
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Petición realizada correctamente",
  });
});

// Activar servidor y escuchar en un puerto
app.listen(3015, () => {
  console.log("Servidor Express puerto 3015: \x1b[32m%s\x1b[0m", "online");
});
