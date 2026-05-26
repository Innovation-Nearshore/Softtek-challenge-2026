const { body, param, query, validationResult } = require('express-validator');

/**
 * Validación para crear una nueva solicitud
 * Acepta campos de texto plano para tipo y area
 */
const validateCreateSolicitud = [
  body('tipo')
    .trim()
    .notEmpty()
    .withMessage('tipo es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('tipo debe tener entre 2 y 200 caracteres'),

  body('urgencia')
    .isIn(['Alta', 'Media', 'Baja'])
    .withMessage('urgencia debe ser: Alta, Media o Baja'),

  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('descripcion es requerida')
    .isLength({ min: 10, max: 2000 })
    .withMessage('descripcion debe tener entre 10 y 2000 caracteres'),

  body('solicitante')
    .trim()
    .notEmpty()
    .withMessage('solicitante es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('solicitante debe tener entre 3 y 100 caracteres'),

  body('area')
    .trim()
    .notEmpty()
    .withMessage('area es requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('area debe tener entre 2 y 100 caracteres'),
];

/**
 * Validación para actualizar estado de solicitud
 */
const validateUpdateStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero válido'),

  body('estado_nuevo')
    .isIn(['Recibida', 'En revisión', 'Resuelta'])
    .withMessage('estado_nuevo debe ser: Recibida, En revisión o Resuelta'),

  body('usuario')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('usuario no puede exceder 100 caracteres'),

  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('comentario no puede exceder 500 caracteres'),
];

/**
 * Validación para obtener solicitud por ID
 */
const validateGetById = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero válido'),
];

/**
 * Validación para obtener historial
 */
const validateGetHistorial = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero válido'),
];

/**
 * Validación para filtros en lista
 */
const validateListFilters = [
  query('tipo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('tipo debe tener máximo 100 caracteres'),

  query('urgencia')
    .optional()
    .isIn(['Alta', 'Media', 'Baja'])
    .withMessage('urgencia debe ser: Alta, Media o Baja'),

  query('estado')
    .optional()
    .isIn(['Recibida', 'En revisión', 'Resuelta'])
    .withMessage('estado debe ser: Recibida, En revisión o Resuelta'),

  query('area_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('area_id debe ser un número entero válido'),
];

/**
 * Middleware para manejar errores de validación — responde 422 si hay errores
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Errores de validación',
      details: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

module.exports = {
  validateCreateSolicitud,
  validateUpdateStatus,
  validateGetById,
  validateGetHistorial,
  validateListFilters,
  handleValidationErrors,
};
