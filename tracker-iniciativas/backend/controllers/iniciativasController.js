const iniciativasService = require('../services/iniciativasService');

/**
 * GET /api/iniciativas
 * Supports optional query params: ?estado= and ?prioridad=
 */
const getAll = async (req, res, next) => {
  try {
    const { estado, prioridad } = req.query;
    let data;
    if (estado || prioridad) {
      data = await iniciativasService.fetchByFilters(estado, prioridad);
    } else {
      data = await iniciativasService.fetchAll();
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/iniciativas
 * Validates required fields and delegates to service
 */
const create = async (req, res, next) => {
  try {
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;

    const missingFields = [];
    if (!nombre) missingFields.push('nombre');
    if (!responsable) missingFields.push('responsable');
    if (!estado) missingFields.push('estado');
    if (!fecha_limite) missingFields.push('fecha_limite');
    if (!prioridad) missingFields.push('prioridad');
    if (!descripcion) missingFields.push('descripcion');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Campos obligatorios faltantes',
        campos: missingFields,
      });
    }

    // Validate enum values
    const estadosValidos = ['Pendiente', 'En curso', 'Completado'];
    const prioridadesValidas = ['Alta', 'Media', 'Baja'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`,
      });
    }

    if (!prioridadesValidas.includes(prioridad)) {
      return res.status(400).json({
        error: `Prioridad inválida. Valores permitidos: ${prioridadesValidas.join(', ')}`,
      });
    }

    const created = await iniciativasService.createOne({
      nombre,
      responsable,
      estado,
      fecha_limite,
      prioridad,
      descripcion,
    });

    res.status(201).json(Array.isArray(created) ? created[0] : created);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/iniciativas/:id
 * Updates an existing iniciativa by ID
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID de iniciativa requerido' });
    }

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const updated = await iniciativasService.updateOne(id, updates);
    res.json(Array.isArray(updated) ? updated[0] : updated);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/iniciativas/proximos-vencimientos
 * Returns iniciativas with fecha_limite within the next N days (default 7).
 * Excludes completed initiatives. Ordered by fecha_limite ASC.
 */
const getProximosVencimientos = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await iniciativasService.fetchProximosVencimientos(days);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
  update,
  getProximosVencimientos,
};
