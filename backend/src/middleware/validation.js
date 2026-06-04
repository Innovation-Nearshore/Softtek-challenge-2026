const VALID_STATES = ['Pendiente', 'En curso', 'Completado'];
const VALID_PRIORITIES = ['Alta', 'Media', 'Baja'];

/**
 * Validate all fields for CREATING a new initiative.
 * Enforces that fecha_limite is not in the past.
 */
function validateInitiative(req, res, next) {
  const errors = {};
  const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (!nombre || nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio.';
  }

  if (!responsable || responsable.trim() === '') {
    errors.responsable = 'El responsable es obligatorio.';
  }

  if (!estado || estado.trim() === '') {
    errors.estado = 'El estado es obligatorio.';
  } else if (!VALID_STATES.includes(estado.trim())) {
    errors.estado = `El estado debe ser uno de: ${VALID_STATES.join(', ')}.`;
  }

  if (!fecha_limite || fecha_limite.toString().trim() === '') {
    errors.fecha_limite = 'La fecha límite es obligatoria.';
  } else {
    const deadline = new Date(fecha_limite);
    if (isNaN(deadline.getTime())) {
      errors.fecha_limite = 'La fecha límite no es válida.';
    } else if (!isUpdate) {
      // For new records, enforce the date must be today or future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        errors.fecha_limite = 'La fecha límite no puede ser anterior a hoy.';
      }
    }
    // For updates (PUT), we allow past dates since the record may have been
    // created with a valid date that has since passed.
  }

  if (!prioridad || prioridad.trim() === '') {
    errors.prioridad = 'La prioridad es obligatoria.';
  } else if (!VALID_PRIORITIES.includes(prioridad.trim())) {
    errors.prioridad = `La prioridad debe ser una de: ${VALID_PRIORITIES.join(', ')}.`;
  }

  if (!descripcion || descripcion.trim() === '') {
    errors.descripcion = 'La descripción es obligatoria.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

/**
 * Validate only the status field for PATCH status updates.
 */
function validateStatus(req, res, next) {
  const errors = {};
  const { estado } = req.body;

  if (!estado || estado.trim() === '') {
    errors.estado = 'El estado es obligatorio.';
  } else if (!VALID_STATES.includes(estado.trim())) {
    errors.estado = `El estado debe ser uno de: ${VALID_STATES.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = { validateInitiative, validateStatus };
