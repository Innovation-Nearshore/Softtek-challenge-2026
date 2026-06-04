import { validationResult, body, param } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const initiativeCreateRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be at most 255 characters')
    .escape(),
  body('responsible')
    .trim()
    .notEmpty().withMessage('Responsible is required')
    .isLength({ max: 255 }).withMessage('Responsible must be at most 255 characters')
    .escape(),
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['Pendiente', 'En curso', 'Completado']).withMessage('Invalid status value'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date (YYYY-MM-DD)'),
  body('priority')
    .trim()
    .notEmpty().withMessage('Priority is required')
    .isIn(['Alta', 'Media', 'Baja']).withMessage('Invalid priority value'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters')
    .escape(),
  handleValidationErrors,
];

export const initiativeUpdateRules = [...initiativeCreateRules];

export const idParamRule = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors,
];

/** @deprecated Use idParamRule — kept for backwards-compatibility during transition */
export const uuidParamRule = idParamRule;

export default { initiativeCreateRules, initiativeUpdateRules, idParamRule, uuidParamRule, handleValidationErrors };
