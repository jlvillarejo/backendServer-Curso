// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importar rutas
var appRoutes = require('./routes/appRoute');
var usuarioRoutes = require('./routes/usuarioRoutes');
var loginRoutes = require('./routes/loginRoutes');

// Inicializar variables
var app = express();

// Body-Parser
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la BD
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
  }
);

// Rutas
app.use('/user', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Activar servidor y escuchar en un puerto
app.listen(3015, () => {
  console.log('Servidor Express puerto 3015: \x1b[32m%s\x1b[0m', 'online');
});
