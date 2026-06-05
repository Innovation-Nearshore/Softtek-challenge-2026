'use strict';

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for creating or updating an initiative.
 * Follows OCP: new rules can be appended without changing existing ones.
 */
const initiativeRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 255 }).withMessage('El nombre no puede superar 255 caracteres.'),

  body('responsable')
    .trim()
    .notEmpty().withMessage('El responsable es obligatorio.')
    .isLength({ max: 100 }).withMessage('El responsable no puede superar 100 caracteres.'),

  body('estado')
    .trim()
    .notEmpty().withMessage('El estado es obligatorio.')
    .isIn(['Pendiente', 'En curso', 'Completado'])
    .withMessage("El estado debe ser 'Pendiente', 'En curso' o 'Completado'."),

  body('fecha_limite')
    .notEmpty().withMessage('La fecha límite es obligatoria.')
    .isISO8601().withMessage('La fecha límite debe tener formato YYYY-MM-DD.'),

  body('prioridad')
    .trim()
    .notEmpty().withMessage('La prioridad es obligatoria.')
    .isIn(['Alta', 'Media', 'Baja'])
    .withMessage("La prioridad debe ser 'Alta', 'Media' o 'Baja'."),

  body('descripcion')
    .optional({ nullable: true })
    .trim(),
];

/**
 * Middleware that reads express-validator results and, if there are errors,
 * responds with 422 Unprocessable Entity and the full error list.
 * Single responsibility: only handles validation result checking.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Datos de entrada inválidos.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { initiativeRules, handleValidationErrors };
