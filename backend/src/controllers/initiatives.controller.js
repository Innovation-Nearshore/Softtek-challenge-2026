const pool = require('../db/pool');
const {
  GET_ALL_INITIATIVES,
  GET_INITIATIVES_FILTERED,
  CREATE_INITIATIVE,
  UPDATE_INITIATIVE_ESTADO,
} = require('../queries/initiatives.queries');

// GET /api/initiatives?estado=...&prioridad=...
const getInitiatives = async (req, res) => {
  try {
    const { estado, prioridad } = req.query;
    const estadoParam = estado || null;
    const prioridadParam = prioridad || null;

    let result;
    if (estadoParam || prioridadParam) {
      result = await pool.query(GET_INITIATIVES_FILTERED, [estadoParam, prioridadParam]);
    } else {
      result = await pool.query(GET_ALL_INITIATIVES);
    }

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Controller] getInitiatives error:', err.message);
    return res.status(500).json({ success: false, message: 'Error al obtener iniciativas.' });
  }
};

// POST /api/initiatives
const createInitiative = async (req, res) => {
  try {
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;

    if (!nombre || !responsable || !estado || !fecha_limite || !prioridad) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, responsable, estado, fecha_limite y prioridad son obligatorios.',
      });
    }

    const validEstados = ['Pendiente', 'En curso', 'Completado'];
    const validPrioridades = ['Alta', 'Media', 'Baja'];

    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${validEstados.join(', ')}`,
      });
    }

    if (!validPrioridades.includes(prioridad)) {
      return res.status(400).json({
        success: false,
        message: `Prioridad inválida. Valores permitidos: ${validPrioridades.join(', ')}`,
      });
    }

    const result = await pool.query(CREATE_INITIATIVE, [
      nombre,
      responsable,
      estado,
      fecha_limite,
      prioridad,
      descripcion || null,
    ]);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[Controller] createInitiative error:', err.message);
    return res.status(500).json({ success: false, message: 'Error al crear la iniciativa.' });
  }
};

// PATCH /api/initiatives/:id/estado
const updateInitiativeEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const validEstados = ['Pendiente', 'En curso', 'Completado'];

    if (!estado || !validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${validEstados.join(', ')}`,
      });
    }

    const result = await pool.query(UPDATE_INITIATIVE_ESTADO, [estado, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[Controller] updateInitiativeEstado error:', err.message);
    return res.status(500).json({ success: false, message: 'Error al actualizar el estado.' });
  }
};

// PATCH /api/initiatives/:id  — inline field update (nombre, responsable, prioridad)
const updateInitiativeFields = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, responsable, prioridad } = req.body;

    const validPrioridades = ['Alta', 'Media', 'Baja'];

    // Build dynamic SET clause with only provided fields
    const setClauses = [];
    const values = [];
    let paramIdx = 1;

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ success: false, message: 'El campo nombre no puede estar vacío.' });
      }
      setClauses.push(`nombre = $${paramIdx++}`);
      values.push(String(nombre).trim());
    }

    if (responsable !== undefined) {
      if (!String(responsable).trim()) {
        return res.status(400).json({ success: false, message: 'El campo responsable no puede estar vacío.' });
      }
      setClauses.push(`responsable = $${paramIdx++}`);
      values.push(String(responsable).trim());
    }

    if (prioridad !== undefined) {
      if (!validPrioridades.includes(prioridad)) {
        return res.status(400).json({
          success: false,
          message: `Prioridad inválida. Valores permitidos: ${validPrioridades.join(', ')}`,
        });
      }
      setClauses.push(`prioridad = $${paramIdx++}`);
      values.push(prioridad);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se debe proporcionar al menos un campo válido: nombre, responsable o prioridad.',
      });
    }

    // Append fecha_actualizacion and WHERE id
    setClauses.push(`fecha_actualizacion = NOW()`);
    values.push(id);

    const sql = `
      UPDATE iniciativas
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIdx}
      RETURNING *
    `;

    const result = await pool.query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[Controller] updateInitiativeFields error:', err.message);
    return res.status(500).json({ success: false, message: 'Error al actualizar los campos.' });
  }
};

module.exports = { getInitiatives, createInitiative, updateInitiativeEstado, updateInitiativeFields };
