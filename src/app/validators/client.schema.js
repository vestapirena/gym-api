// /src/app/validators/client.schema.js
const Joi = require('joi');

// Nombre/apellido: letras con acentos, números y espacios (1–50)
const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,50}$', 'u');
const nameMx = Joi.string()
  .trim()
  .pattern(nameRegex)
  .messages({
    'string.pattern.base': 'Debe contener letras (acentos), números y espacios (1 a 50)',
    'string.empty': 'Campo obligatorio',
  });

const phoneOptional = Joi.string()
  .pattern(/^[0-9 -]{0,20}$/)
  .allow('', null)
  .messages({
    'string.pattern.base': 'Teléfono: solo dígitos, espacios y guiones, máx 20',
  });

const emailStrict = Joi.string().email().messages({
  'string.email': 'Correo inválido',
  'string.empty': 'Correo obligatorio',
});

const genderEnum = Joi.string().valid('Male', 'Female', 'Other').allow(null).optional();
const statusEnum = Joi.string().valid('Active', 'Inactive').messages({
  'any.only': 'Status inválido',
});

// *** code OBLIGATORIO (sin regex, como pediste) ***
const codeRequired = Joi.string().required().messages({
  'any.required': 'El código es obligatorio',
  'string.empty': 'El código es obligatorio',
});

// CREATE: code requerido
const createClientSchema = Joi.object({
  first_name: nameMx.required().messages({ 'any.required': 'El nombre es obligatorio' }),
  last_name:  nameMx.required().messages({ 'any.required': 'El apellido es obligatorio' }),
  email:      emailStrict.required().messages({ 'any.required': 'El correo es obligatorio' }),
  phone:      phoneOptional,
  birthdate:  Joi.date().iso().allow(null).optional(),
  gender:     genderEnum,
  status:     statusEnum.required(),
  gym_id:     Joi.number().integer().required().messages({ 'any.required': 'El gimnasio es obligatorio' }),
  code:       codeRequired, // ← requerido
});

// UPDATE: NO permitimos cambiar code ni email (se bloquea también en middleware)
const updateClientSchema = Joi.object({
  first_name: nameMx.optional(),
  last_name:  nameMx.optional(),
  phone:      phoneOptional,
  birthdate:  Joi.date().iso().allow(null).optional(),
  gender:     genderEnum,
  status:     statusEnum.optional(),
  gym_id:     Joi.number().integer().optional(),
  // NO incluir 'code' ni 'email' aquí
})
  .min(1)
  .messages({
    'object.min': 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createClientSchema, updateClientSchema };
