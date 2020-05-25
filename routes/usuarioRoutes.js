var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// *********************************************
// Obtener todos los Usuarios
// *********************************************

app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'id nombre apellidos email img rol')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la carga de usuarios',
          errors: err,
        });
      }

      Usuario.count({}, (err, nReg) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al contar usuarios',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          nreg: nReg,
          usuarios: usuarios,
        });
      });
    });
});

// *********************************************
// Modificar usuario
// *********************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var ID = req.params.id;
  var body = req.body;

  Usuario.findById(ID, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al recuperar el usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe usuario con ese ID' },
      });
    }

    usuario.nombre = body.nombre;
    usuario.apellidos = body.apellidos;
    usuario.email = body.email;
    usuario.rol = body.rol;

    usuario.save((err, userSaved) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al modificar el usuario: ' + ID,
          errors: err,
        });
      }

      userSaved.password = '************';
      res.status(200).json({
        ok: true,
        usuario: userSaved,
      });
    });
  });
});

// *********************************************
// Crear un nuevo usuario
// *********************************************

app.post('/', (req, res, next) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    apellidos: body.apellidos,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    rol: body.rol,
  });

  usuario.save((err, userSaved) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al grabar el usuario en BD',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      usuario: userSaved,
    });
  });
});

// *********************************************
// Eliminación de usuario mediante el id
// *********************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var ID = req.params.id;

  Usuario.findByIdAndRemove(ID, (err, usrBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el usuario en BD',
        errors: err,
      });
    }

    if (!usrBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario de id: ' + ID + ' no existe en la Base de Datos',
        errors: { message: 'No existe usuario con ese ID' },
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usrBorrado,
    });
  });
});

module.exports = app;
