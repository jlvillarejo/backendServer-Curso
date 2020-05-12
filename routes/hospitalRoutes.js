var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// *********************************************
// Obtener todos los hospitales
// *********************************************
app.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la carga de hospitales',
          errors: err,
        });
      }

      Hospital.count({}, (err, nReg) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al contar los registros de hospitales',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          nreg: nReg,
          hospitales: hospitales,
        });
      });
    });
});

// *********************************************
// Crear nuevo hospital
// *********************************************
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospitalDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al grabar el hospital en BD',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalDB,
    });
  });
});

// *********************************************
// Modificación de un hospital
// *********************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  ID = req.params.id;
  body = req.body;

  Hospital.findById(ID, (err, hospitalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al recuperar el hospital',
        errors: err,
      });
    }

    if (!hospitalDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe hospital con ese ID' },
      });
    }

    hospitalDB.nombre = body.nombre;
    hospitalDB.usuario = req.usuario._id;

    hospitalDB.save((err, modHospital) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al modificar el hospital en BD',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        hospital: modHospital,
      });
    });
  });
});

// *********************************************
// Eliminación de hospital
// *********************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  ID = req.params.id;

  Hospital.findByIdAndRemove(ID, (err, hospitalDel) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el hospital en BD',
        errors: err,
      });
    }

    if (!hospitalDel) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe hospital con ese ID' },
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalDel,
    });
  });
});

module.exports = app;
