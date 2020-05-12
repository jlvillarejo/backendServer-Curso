var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// *********************************************
// Realiza una busqueda en la tabla especificada
// en el URL
// *********************************************
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
  var tabla = req.params.tabla;
  var busqueda = req.params.busqueda;

  var regex = new RegExp(busqueda, 'i');
  var queryDoc = { $text: { $search: busqueda } };

  var promesa;

  switch (tabla) {
    case 'usuarios':
      promesa = buscarUsuarios(regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(queryDoc);
      break;
    case 'hospitales':
      promesa = buscarHospitales(queryDoc);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          'Las colecciones de búsqueda validas son: usuarios, medicos y hospitales',
        error: { message: 'Colección no válida' },
      });
  }

  promesa.then((respuestas) => {
    res.status(200).json({
      ok: true,
      [tabla]: respuestas,
    });
  });
});

// *********************************************
// Realiza una busqueda en todas las tablas de la BD
// *********************************************
app.get('/todo/:busqueda', (req, res, next) => {
  var busqueda = req.params.busqueda;
  var rbusqueda = '/^' + busqueda + '$/';

  var regex = new RegExp(busqueda, 'i');
  var queryDoc = { $text: { $search: busqueda } };
  //   var queryDoc = { $text: { $search: rbusqueda } };

  Promise.all([
    buscarHospitales(queryDoc),
    buscarMedicos(queryDoc),
    buscarUsuarios(regex),
  ])
    .then((respuestas) => {
      res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuarios: respuestas[2],
      });
    })
    .catch((error) => {
      res.status(500).json({
        ok: false,
        error: error,
      });
    });
});

function buscarHospitales(busqueda) {
  return new Promise((resolve, reject) => {
    Hospital.find(busqueda)
      .populate('usuario', 'nombre apellidos email')
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda) {
  return new Promise((resolve, reject) => {
    Medico.find(busqueda)
      .populate('usuario', 'nombre apellidos email')
      .populate('hospital', 'nombre')
      .exec((err, medicos) => {
        if (err) {
          reject('Error al cargar médicos', err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(busqueda) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre apellidos email rol')
      .or([{ nombre: busqueda }, { apellidos: busqueda }, { email: busqueda }])
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
