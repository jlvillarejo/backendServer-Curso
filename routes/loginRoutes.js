var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// *********************************************
// Atenticación de Goolge
// *********************************************
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  // console.log(payload);
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.given_name,
    apellidos: payload.family_name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

// Login con validación Google

app.post('/google', async (req, res) => {
  var token = req.body.token;
  var googleUsr = await verify(token).catch((e) => {
    res.status(403).json({
      ok: false,
      mensaje: 'Token no válido',
    });
  });

  Usuario.findOne({ email: googleUsr.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al recuperar el usuario',
        errors: err,
      });
    }

    if (usuarioDB) {
      console.log('Usuario existe en BD');
      if (!usuarioDB.google) {
        console.log('No es usuario Google');
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe utilizar su autenticación normal',
        });
      } else {
        console.log('No es usuario Google');
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400,
        }); // expira en 4 horas

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
        });
      }
    } else {
      // El usuario no existe y tenemos que crearlo
      console.log('Usuario NO existe en BD');
      var usuario = new Usuario();

      usuario.nombre = googleUsr.nombre;
      usuario.apellidos = googleUsr.apellidos;
      usuario.email = googleUsr.email;
      usuario.img = googleUsr.img;
      usuario.google = true;
      usuario.password = ':-)';

      usuario.save((err, usuarioNew) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al grabar el usuario en BD',
            errors: err,
          });
        }

        var token = jwt.sign({ usuario: usuarioNew }, SEED, {
          expiresIn: 14400,
        }); // expira en 4 horas

        res.status(200).json({
          ok: true,
          usuario: usuarioNew,
          token: token,
          id: usuarioNew._id,
        });
      });
    }
  });
});

// *********************************************
// Autenticación de la Aplicación
// *********************************************
app.post('/', (req, res) => {
  var body = req.body;

  // Verificamos que el usuario existe
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al recuperar el usuario',
        errors: err,
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: err,
      });
    }

    // verificamos la contraseña
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - contraseña',
        errors: err,
      });
    }

    // Crear un Token
    usuarioDB.password = '**************';

    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // expira en 4 horas

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
    });
  });
});

module.exports = app;
