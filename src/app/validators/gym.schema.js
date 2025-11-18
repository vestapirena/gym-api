/**
 * Joi: Gimnasios — plan_id OBLIGATORIO en create
 */
const Joi = require('joi');
const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,50}$', 'u');

const nameMx1to50 = Joi.string().trim().pattern(nameRegex).messages({
  'string.pattern.base': 'Debe contener letras (acentos), números y espacios (1 a 50 caracteres)',
  'string.empty': 'Campo obligatorio',
});

const phoneOptional = Joi.string()
  .pattern(/^[0-9 -]{0,20}$/)
  .allow('', null)
  .messages({ 'string.pattern.base': 'Teléfono: solo dígitos, espacios y guiones, máx 20' });

const createGymSchema = Joi.object({
  name: nameMx1to50.required().messages({ 'any.required': 'El nombre es obligatorio' }),
  phone: phoneOptional,
  plan_id: Joi.number().integer().required().messages({
    'any.required': 'El plan es obligatorio',
    'number.base': 'El plan es obligatorio',
    'number.integer': 'El plan es obligatorio',
  }),
});

const updateGymSchema = Joi.object({
  name: nameMx1to50.optional(),
  phone: phoneOptional,
  plan_id: Joi.number().integer().required().messages({
  'any.required': 'El plan es obligatorio',
  'number.base': 'El plan es obligatorio',
  'number.integer': 'El plan es obligatorio',
}),

}).min(1).messages({ 'object.min': 'Debes enviar al menos un campo para actualizar' });

module.exports = { createGymSchema, updateGymSchema };
