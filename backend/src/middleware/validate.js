'use strict';

const { body, validationResult } = require('express-validator');

const VALID_URGENCIAS = ['Alta', 'Media', 'Baja'];
const VALID_ESTADOS = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'];

/**
 * Middleware that checks validation results and short-circuits with 400 if any fail.
 */
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Validation chains ────────────────────────────────────────────────────────

const validateCreateSolicitud = [
  body('tipoSolicitudId')
    .notEmpty().withMessage('El tipo de solicitud es obligatorio.')
    .isInt({ min: 1 }).withMessage('El tipo de solicitud debe ser un número entero válido.'),

  body('titulo')
    .notEmpty().withMessage('El título es obligatorio.')
    .isString().trim()
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres.'),

  body('descripcion')
    .notEmpty().withMessage('La descripción es obligatoria.')
    .isString().trim()
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres.'),

  body('urgencia')
    .notEmpty().withMessage('La urgencia es obligatoria.')
    .isIn(VALID_URGENCIAS).withMessage(`La urgencia debe ser una de: ${VALID_URGENCIAS.join(', ')}.`),

  body('solicitante')
    .notEmpty().withMessage('El nombre del solicitante es obligatorio.')
    .isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage('El solicitante debe tener entre 2 y 100 caracteres.'),

  body('emailSolicitante')
    .notEmpty().withMessage('El email del solicitante es obligatorio.')
    .isEmail().withMessage('El email del solicitante no tiene un formato válido.')
    .normalizeEmail(),

  body('areaSolicitanteId')
    .notEmpty().withMessage('El área solicitante es obligatoria.')
    .isInt({ min: 1 }).withMessage('El área solicitante debe ser un número entero válido.'),

  checkValidation,
];

const validateChangeStatus = [
  body('estado')
    .notEmpty().withMessage('El estado es obligatorio.')
    .isIn(VALID_ESTADOS).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS.join(', ')}.`),

  body('usuario')
    .optional()
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('El usuario no puede estar vacío si se envía.'),

  body('comentario')
    .optional()
    .isString().trim(),

  body('asignadoA')
    .optional()
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('El responsable no puede estar vacío si se envía.'),

  checkValidation,
];

const validateAssignee = [
  body('asignadoA')
    .notEmpty().withMessage('El nombre del responsable es obligatorio.')
    .isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage('El responsable debe tener entre 2 y 100 caracteres.'),

  checkValidation,
];

module.exports = { validateCreateSolicitud, validateChangeStatus, validateAssignee };
