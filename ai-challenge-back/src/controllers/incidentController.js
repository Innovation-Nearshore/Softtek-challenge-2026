const db = require('../config/db');

// Query base reutilizable — SELECT con JOIN para devolver category como nombre
const SELECT_FULL = `
    SELECT
        i.id,
        i.titulo              AS title,
        c.nombre              AS category,
        i.severidad           AS severity,
        i.descripcion         AS description,
        i.reportador          AS reporter,
        i.area_afectada       AS area,
        i.estado              AS status,
        i.fecha_creacion      AS created_at,
        i.fecha_actualizacion AS updated_at
    FROM reto_d.incidentes i
    JOIN reto_d.categorias c ON c.id = i.categoria_id
`;

// ═══════════════════════════════════════════════════════════
// GET /api/incidents — Obtener todos los incidentes
// ═══════════════════════════════════════════════════════════

exports.getAllIncidents = async (req, res) => {
    try {
        const result = await db.query(
            `${SELECT_FULL} ORDER BY i.fecha_creacion DESC`
        );

        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('❌ Error al obtener incidentes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener incidentes',
            message: error.message,
        });
    }
};

// ═══════════════════════════════════════════════════════════
// POST /api/incidents — Crear nuevo incidente
// ═══════════════════════════════════════════════════════════

exports.createIncident = async (req, res) => {
    try {
        const { title, category, severity, description, reporter, area } = req.body;

        // ─── VALIDACIÓN ───
        const errors = [];
        if (!title || title.trim() === '')    errors.push('El título es obligatorio');
        if (!severity || severity.trim() === '') errors.push('La severidad es obligatoria');
        if (!area || area.trim() === '')       errors.push('El área afectada es obligatoria');

        const validSeverities = ['Crítica', 'Alta', 'Media', 'Baja'];
        if (severity && !validSeverities.includes(severity)) {
            errors.push(`Severidad inválida. Valores permitidos: ${validSeverities.join(', ')}`);
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: 'Validación fallida', details: errors });
        }

        // ─── RESOLVER categoria_id ───
        const catName = category ? category.trim() : 'Sistema';
        const catResult = await db.query(
            'SELECT id FROM reto_d.categorias WHERE nombre = $1',
            [catName]
        );
        const categoriaId = catResult.rows.length > 0 ? catResult.rows[0].id : 1;

        // ─── INSERCIÓN ───
        const insertResult = await db.query(
            `INSERT INTO reto_d.incidentes
                (titulo, categoria_id, severidad, descripcion, reportador, area_afectada, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'Abierto')
             RETURNING id`,
            [
                title.trim(),
                categoriaId,
                severity.trim(),
                description ? description.trim() : null,
                reporter ? reporter.trim() : 'Sin reportador',
                area.trim(),
            ]
        );

        // ─── FETCH COMPLETO CON JOIN ───
        const fullResult = await db.query(
            `${SELECT_FULL} WHERE i.id = $1`,
            [insertResult.rows[0].id]
        );
        const newIncident = fullResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Incidente creado exitosamente',
            data: newIncident,
        });

        console.log(`✅ Incidente creado: ${newIncident.id} — ${newIncident.title}`);
    } catch (error) {
        console.error('❌ Error al crear incidente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear incidente',
            message: error.message,
        });
    }
};

// ═══════════════════════════════════════════════════════════
// PUT /api/incidents/:id/status — Actualizar estado (TRANSACCIÓN)
// ═══════════════════════════════════════════════════════════

exports.updateIncidentStatus = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        const validStatuses = ['Abierto', 'En atención', 'Cerrado'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido',
                details: `Valores permitidos: ${validStatuses.join(', ')}`,
            });
        }

        await client.query('BEGIN');

        // 1. Obtener estado actual
        const currentResult = await client.query(
            'SELECT estado FROM reto_d.incidentes WHERE id = $1',
            [id]
        );

        if (currentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Incidente no encontrado' });
        }

        const oldStatus = currentResult.rows[0].estado;

        // 2. Actualizar estado
        await client.query(
            `UPDATE reto_d.incidentes
             SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [newStatus, id]
        );

        // 3. Registrar en log
        await client.query(
            `INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note)
             VALUES ($1, $2, $3, $4)`,
            [id, oldStatus, newStatus, `Estado cambió de ${oldStatus} a ${newStatus}`]
        );

        await client.query('COMMIT');

        // 4. Fetch completo con JOIN (fuera de transacción)
        const fullResult = await db.query(
            `${SELECT_FULL} WHERE i.id = $1`,
            [id]
        );
        const updatedIncident = fullResult.rows[0];

        res.status(200).json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: updatedIncident,
        });

        console.log(`✅ Incidente ${id} actualizado: ${oldStatus} → ${newStatus}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar estado',
            message: error.message,
        });
    } finally {
        client.release();
    }
};

// ═══════════════════════════════════════════════════════════
// GET /api/incidents/categories — Catálogo de categorías
// ═══════════════════════════════════════════════════════════

exports.getCategories = async (_req, res) => {
    try {
        const result = await db.query(
            'SELECT id, nombre FROM reto_d.categorias ORDER BY nombre'
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener categorías',
            message: error.message,
        });
    }
};

// ═══════════════════════════════════════════════════════════
// GET /api/incidents/:id/log — Historial de cambios de estado
// ═══════════════════════════════════════════════════════════

exports.getIncidentLog = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT id, incident_id, old_status, new_status, note, changed_at
             FROM reto_d.incident_log
             WHERE incident_id = $1
             ORDER BY changed_at ASC`,
            [id]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial',
            message: error.message,
        });
    }
};
