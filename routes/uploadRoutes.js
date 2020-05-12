var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Modelos de datos
var usuarioDB = require('../models/usuario');
var medicoDB = require('../models/medico');
var hospitalDB = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
  tipo = req.params.tipo;
  id = req.params.id;

  // Tipos de colección
  var tiposCol = ['usuarios', 'medicos', 'hospitales'];

  if (tiposCol.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección no válida',
      errors: {
        message:
          'Debe seleccionar un colección de tipo usuarios, medicos o hospitales',
      },
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No ha selecciónado ningún archivo',
      errors: { message: 'Debe seleccionar una imágen' },
    });
  }

  // obtener nombre dle archivo
  var nombreFile = req.files.imagen; //.imagen es el nombre que hemos definico en Postman
  var partesNombre = nombreFile.name.split('.'); // obtenemos un array con todas las partes del nombre separadas por '.'
  var extensionFile = partesNombre[partesNombre.length - 1];

  // Extensiones válidas
  var extensionesValidas = ['png', 'jpg', 'gif', 'bmp', 'jpeg', 'svg'];

  if (extensionesValidas.indexOf(extensionFile) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de archivo no válido',
      errors: {
        message:
          'Debe seleccionar un archivo de tipo png, jpg, gif, bmp, jpeg, svg',
      },
    });
  }

  // Nombre de archivo personalizado
  NumUnico = new Date().getMilliseconds();
  var nombreEndFile = `${id}-${NumUnico}.${extensionFile}`;

  // Mover el archivo desde el temporal a la carpeta de la aplicación
  var path = `./uploads/${tipo}/${nombreEndFile}`;

  nombreFile.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err,
      });
    }

    asignarRegistro(tipo, id, nombreEndFile, res);
  });
});

function asignarRegistro(tipo, id, img, res) {
  if (tipo === 'usuarios') {
    usuarioDB.findById(id, (err, usuario) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Usuario no encontrado',
          errors: { message: 'El usuario no existe en la BD' },
        });
      }

      if (usuario.img !== '') {
        var pathOld = './uploads/usuarios/' + usuario.img;

        eliminaImgOld(pathOld, res);
      }

      usuario.img = img;
      usuario.save((err, usuarioMod) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error en BD',
            errors: err,
          });
        }

        usuarioMod.password = '*********';
        return res.status(200).json({
          ok: true,
          mensaje: 'Usuario actualizado',
          usuario: usuarioMod,
        });
      });
    });
  }

  if (tipo === 'medicos') {
    medicoDB.findById(id, (err, medico) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Médico no encontrado',
          errors: { message: 'El medico no existe en la BD' },
        });
      }

      if (medico.img !== '') {
        var pathOld = './uploads/medicos/' + medico.img;

        eliminaImgOld(pathOld, res);
      }

      medico.img = img;
      medico.save((err, medicoMod) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error en BD',
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: 'Medico actualizado',
          medico: medicoMod,
        });
      });
    });
  }

  if (tipo === 'hospitales') {
    hospitalDB.findById(id, (err, hospital) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Hospital no encontrado',
          errors: { message: 'El hospital no existe en la BD' },
        });
      }

      if (hospital.img !== '') {
        var pathOld = './uploads/hospitales/' + hospital.img;

        eliminaImgOld(pathOld, res);
      }

      hospital.img = img;
      hospital.save((err, hospitalMod) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error en BD',
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: 'Hospital actualizado',
          hospital: hospitalMod,
        });
      });
    });
  }
}

function eliminaImgOld(nombreImg, res) {
  // Si existe, elimina la imágen anterior
  if (fs.existsSync(nombreImg)) {
    fs.unlink(nombreImg, (err) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al eliminar fichero del fs',
          error: err,
        });
      }

      return;
    });
  }

  return;
}

module.exports = app;
