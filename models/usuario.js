var moongose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = moongose.Schema;

var rolesOK = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol permitido',
};

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'El email es obligatorio'],
  },
  password: { type: String, required: [true, 'La contraseña es obligatoria'] },
  img: { type: String, required: false },
  rol: { type: String, required: false, default: 'USER_ROLE', enum: rolesOK },
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = moongose.model('Usuario', usuarioSchema);
