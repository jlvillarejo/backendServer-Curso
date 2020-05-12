// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importar rutas
var appRoutes = require('./routes/appRoute');
var usuarioRoutes = require('./routes/usuarioRoutes');
var hospitalRoutes = require('./routes/hospitalRoutes');
var medicoRoutes = require('./routes/medicoRoutes');
var loginRoutes = require('./routes/loginRoutes');
var searchRoutes = require('./routes/searchRoutes');
var uploadRoutes = require('./routes/uploadRoutes');
var imgRoutes = require('./routes/imgRoutes');

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

// Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/user', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/login', loginRoutes);
app.use('/img', imgRoutes);
app.use('/', appRoutes);

// Activar servidor y escuchar en un puerto
app.listen(3015, () => {
  console.log('Servidor Express puerto 3015: \x1b[32m%s\x1b[0m', 'online');
});
