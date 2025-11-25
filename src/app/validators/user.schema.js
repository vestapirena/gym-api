// src/app/validators/user.schema.js
const Joi = require('joi');

// Letras (acentos/ñ), números y espacios, 1–30
const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,30}$', 'u');

const nameMx1to30 = Joi.string().trim().pattern(nameRegex).messages({
  'string.pattern.base': 'Debe contener letras (acentos), números y espacios (1 a 30 caracteres)',
  'string.empty':        'El campo no puede estar vacío',
});

const phoneOptional = Joi.string()
  .pattern(/^[0-9 -]{0,20}$/)
  .allow('', null)
  .messages({
    'string.pattern.base': 'El teléfono solo puede contener dígitos, espacios y guiones (máx. 20 caracteres)',
  });

// Permite TLDs no IANA (p.ej. .mxa)
const emailStrict = Joi.string()
  .email({ tlds: { allow: false } })
  .messages({
    'string.email': 'El correo electrónico no tiene un formato válido',
    'string.empty': 'El correo electrónico es obligatorio',
  });

// Password 8–16, mínimo 1 letra y 1 número (símbolos permitidos)
const passwordStrict = Joi.string()
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]{8,16}$/)
  .messages({
    'string.pattern.base': 'La contraseña debe tener entre 8 y 16 caracteres, con al menos una letra y un número',
    'string.empty':        'La contraseña es obligatoria',
  });

const createUserSchema = Joi.object({
  first_name: nameMx1to30.required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre es obligatorio',
  }),
  last_name: nameMx1to30.required().messages({
    'any.required': 'El apellido es obligatorio',
    'string.empty': 'El apellido es obligatorio',
  }),
  email: emailStrict.required().messages({
    'any.required': 'El correo electrónico es obligatorio',
    'string.empty': 'El correo electrónico es obligatorio',
  }),
  password: passwordStrict.required(),
  phone: phoneOptional,
  role_id: Joi.number().integer().optional().messages({
    'number.base':    'El rol debe ser un número válido',
    'number.integer': 'El rol debe ser un número válido',
  }),
  gym_id: Joi.number().integer().allow(null).optional().messages({
    'number.base':    'El gimnasio debe ser un número válido',
    'number.integer': 'El gimnasio debe ser un número válido',
  }),
});

const updateUserSchema = Joi.object({
  first_name: nameMx1to30.optional().messages({
    'string.empty': 'El nombre no puede estar vacío',
  }),
  last_name: nameMx1to30.optional().messages({
    'string.empty': 'El apellido no puede estar vacío',
  }),
  // email NO se debe poder cambiar; tu middleware lo elimina si viene:
  email: emailStrict.optional(),
  // password: si viene vacío, tu middleware lo quita; si viene con valor, aplica reglas:
  password: passwordStrict.optional(),
  phone: phoneOptional,
  role_id: Joi.number().integer().optional().messages({
    'number.base':    'El rol debe ser un número válido',
    'number.integer': 'El rol debe ser un número válido',
  }),
  gym_id: Joi.number().integer().allow(null).optional().messages({
    'number.base':    'El gimnasio debe ser un número válido',
    'number.integer': 'El gimnasio debe ser un número válido',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createUserSchema, updateUserSchema };
