var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// *********************************************
// Recuperar todos los médicos
// *********************************************
app.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la carga de médicos',
          errors: err,
        });
      }

      Medico.count({}, (err, nReg) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al contar los registros de médicos',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          nreg: nReg,
          medicos: medicos,
        });
      });
    });
});

// *********************************************
// Alta de nuevos registros
// *********************************************
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  medico.save((err, medicoDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al grabar el médico en BD',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoDB,
    });
  });
});

// *********************************************
// Modificación de un médico
// *********************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  ID = req.params.id;
  body = req.body;

  Medico.findById(ID, (err, medicoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al recuperar el médico',
        errors: err,
      });
    }

    if (!medicoDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El médico de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe médico con ese ID' },
      });
    }

    medicoDB.nombre = body.nombre;
    medicoDB.usuario = req.usuario._id;
    medicoDB.hospital = body.hospital;

    medicoDB.save((err, modMedico) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al modificar el médico en BD',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        medico: modMedico,
      });
    });
  });
});

// *********************************************
// Eliminación de médico
// *********************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  ID = req.params.id;

  Medico.findByIdAndRemove(ID, (err, medicoDel) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el médico en BD',
        errors: err,
      });
    }

    if (!medicoDel) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El médico de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe médico con ese ID' },
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoDel,
    });
  });
});

module.exports = app;
