const request = require('supertest');

// Mock de la base de datos ANTES de importar la app
jest.mock('../config/database', () => ({
  pool: {
    connect: jest.fn(() =>
      Promise.resolve({
        query: jest.fn((sql) => {
          if (
            sql.includes('BEGIN') ||
            sql.includes('COMMIT') ||
            sql.includes('ROLLBACK') ||
            sql.includes('SET search_path')
          ) {
            return Promise.resolve({});
          }
          if (sql.includes('SELECT estado FROM solicitudes')) {
            return Promise.resolve({ rows: [{ estado: 'Recibida' }] });
          }
          if (sql.includes('UPDATE solicitudes')) {
            return Promise.resolve({
              rows: [
                {
                  id: 1,
                  titulo: 'Test',
                  descripcion: 'Desc',
                  urgencia: 'Alta',
                  status: 'En revisión',
                  estado: 'En revisión',
                  solicitante: 'Juan',
                  created_at: new Date().toISOString(),
                },
              ],
            });
          }
          if (sql.includes('INSERT INTO historial')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        }),
        release: jest.fn(),
      })
    ),
  },
  query: jest.fn((sql, params) => {
    // GET all solicitudes
    if (sql.includes('FROM solicitudes s') && sql.includes('WHERE 1=1')) {
      return Promise.resolve({
        rows: [
          {
            id: 1,
            titulo: 'Solicitud Test',
            descripcion: 'Descripcion larga para test',
            urgencia: 'Alta',
            status: 'Recibida',
            estado: 'Recibida',
            solicitante: 'Juan Perez',
            area: 'TI',
            tipo: 'Soporte Técnico',
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            titulo: 'Solicitud 2',
            descripcion: 'Otra descripcion de prueba',
            urgencia: 'Media',
            status: 'En revisión',
            estado: 'En revisión',
            solicitante: 'Ana López',
            area: 'Finanzas',
            tipo: 'Consulta',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }
    // GET by ID — params[0] es string porque viene del req.params de Express
    if (sql.includes('WHERE s.id = $1')) {
      if (params && Number(params[0]) === 999) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({
        rows: [
          {
            id: Number(params?.[0]) || 1,
            titulo: 'Solicitud Test',
            descripcion: 'Descripcion larga para test',
            urgencia: 'Alta',
            status: 'Recibida',
            estado: 'Recibida',
            solicitante: 'Juan Perez',
            area: 'TI',
            tipo: 'Soporte Técnico',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }
    // Resolver tipo_solicitud_id
    if (sql.includes('FROM tipos_solicitud WHERE nombre ILIKE')) {
      return Promise.resolve({ rows: [{ id: 1 }] });
    }
    if (sql.includes('FROM tipos_solicitud LIMIT 1')) {
      return Promise.resolve({ rows: [{ id: 1 }] });
    }
    // Resolver area_id
    if (sql.includes('FROM areas WHERE nombre ILIKE')) {
      return Promise.resolve({ rows: [{ id: 1 }] });
    }
    if (sql.includes('FROM areas LIMIT 1')) {
      return Promise.resolve({ rows: [{ id: 1 }] });
    }
    // INSERT solicitud
    if (sql.includes('INSERT INTO solicitudes')) {
      return Promise.resolve({
        rows: [
          {
            id: 3,
            titulo: 'Nueva solicitud',
            descripcion: 'Descripcion nueva para prueba',
            urgencia: 'Baja',
            status: 'Recibida',
            estado: 'Recibida',
            solicitante: 'Pedro Nuevo',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }
    // INSERT historial
    if (sql.includes('INSERT INTO historial_solicitudes')) {
      return Promise.resolve({ rows: [] });
    }
    // GET historial
    if (sql.includes('FROM historial_solicitudes')) {
      return Promise.resolve({
        rows: [
          {
            id: 1,
            solicitud_id: 1,
            old_status: null,
            new_status: 'Recibida',
            usuario: 'Sistema',
            comentario: 'Creada',
            changed_at: new Date().toISOString(),
          },
        ],
      });
    }
    // Métricas
    if (sql.includes('COUNT(*)')) {
      return Promise.resolve({
        rows: [
          {
            total: '20',
            recibidas: '4',
            en_revision: '6',
            resueltas: '10',
            alta: '5',
            media: '8',
            baja: '7',
          },
        ],
      });
    }
    // Tipos y áreas para referencias
    if (sql.includes('FROM tipos_solicitud ORDER BY')) {
      return Promise.resolve({
        rows: [{ id: 1, codigo: 'TI-SOP', nombre: 'Soporte Técnico' }],
      });
    }
    if (sql.includes('FROM areas ORDER BY')) {
      return Promise.resolve({ rows: [{ id: 1, nombre: 'TI' }] });
    }
    return Promise.resolve({ rows: [] });
  }),
}));

const { app } = require('../app');

describe('API /api/solicitudes', () => {

  // ── GET /api/solicitudes ─────────────────────────────────────────
  describe('GET /api/solicitudes', () => {
    it('retorna array de solicitudes con status 200', async () => {
      const res = await request(app).get('/api/solicitudes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('las solicitudes tienen los campos requeridos', async () => {
      const res = await request(app).get('/api/solicitudes');
      const s = res.body[0];
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('urgencia');
      expect(s).toHaveProperty('solicitante');
    });

    it('acepta filtro de urgencia válido', async () => {
      const res = await request(app).get('/api/solicitudes?urgencia=Alta');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('rechaza filtro de urgencia inválido con 422', async () => {
      const res = await request(app).get('/api/solicitudes?urgencia=Extreme');
      expect(res.status).toBe(422);
    });

    it('acepta filtro de estado válido', async () => {
      const res = await request(app).get('/api/solicitudes?estado=Recibida');
      expect(res.status).toBe(200);
    });

    it('rechaza filtro de estado inválido con 422', async () => {
      const res = await request(app).get('/api/solicitudes?estado=Desconocido');
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/solicitudes/:id ─────────────────────────────────────
  describe('GET /api/solicitudes/:id', () => {
    it('retorna una solicitud por ID válido', async () => {
      const res = await request(app).get('/api/solicitudes/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/solicitudes/999');
      expect(res.status).toBe(404);
    });

    it('retorna 422 para ID no numérico', async () => {
      const res = await request(app).get('/api/solicitudes/abc');
      expect(res.status).toBe(422);
    });

    it('retorna 422 para ID negativo', async () => {
      const res = await request(app).get('/api/solicitudes/-1');
      expect(res.status).toBe(422);
    });
  });

  // ── POST /api/solicitudes ────────────────────────────────────────
  describe('POST /api/solicitudes', () => {
    const validPayload = {
      tipo: 'Soporte Técnico',
      urgencia: 'Baja',
      descripcion: 'Descripcion valida con suficientes caracteres para pasar validacion',
      solicitante: 'Pedro Nuevo',
      area: 'TI',
    };

    it('crea una solicitud con datos válidos y retorna 201', async () => {
      const res = await request(app).post('/api/solicitudes').send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('retorna 422 si falta el campo tipo', async () => {
      const { tipo, ...sin_tipo } = validPayload;
      const res = await request(app).post('/api/solicitudes').send(sin_tipo);
      expect(res.status).toBe(422);
    });

    it('retorna 422 si urgencia es inválida', async () => {
      const res = await request(app)
        .post('/api/solicitudes')
        .send({ ...validPayload, urgencia: 'Extrema' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 si descripcion es muy corta', async () => {
      const res = await request(app)
        .post('/api/solicitudes')
        .send({ ...validPayload, descripcion: 'Corta' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 si solicitante es muy corto', async () => {
      const res = await request(app)
        .post('/api/solicitudes')
        .send({ ...validPayload, solicitante: 'AB' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 si faltan campos requeridos', async () => {
      const res = await request(app).post('/api/solicitudes').send({});
      expect(res.status).toBe(422);
      expect(res.body.details).toBeDefined();
    });

    it('el body de respuesta exitosa tiene mensaje de confirmación', async () => {
      const res = await request(app).post('/api/solicitudes').send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.message).toBeDefined();
    });
  });

  // ── PATCH /api/solicitudes/:id/status ───────────────────────────
  describe('PATCH /api/solicitudes/:id/status', () => {
    it('actualiza el estado correctamente', async () => {
      const res = await request(app)
        .patch('/api/solicitudes/1/status')
        .send({ estado_nuevo: 'En revisión' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('actualiza a estado Resuelta', async () => {
      const res = await request(app)
        .patch('/api/solicitudes/1/status')
        .send({ estado_nuevo: 'Resuelta' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('retorna 422 si estado_nuevo es inválido', async () => {
      const res = await request(app)
        .patch('/api/solicitudes/1/status')
        .send({ estado_nuevo: 'Invalido' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 si ID no es numérico', async () => {
      const res = await request(app)
        .patch('/api/solicitudes/abc/status')
        .send({ estado_nuevo: 'Resuelta' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 si falta estado_nuevo', async () => {
      const res = await request(app)
        .patch('/api/solicitudes/1/status')
        .send({});
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/solicitudes/:id/historial ──────────────────────────
  describe('GET /api/solicitudes/:id/historial', () => {
    it('retorna historial como array', async () => {
      const res = await request(app).get('/api/solicitudes/1/historial');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('historial tiene campos old_status, new_status, changed_at', async () => {
      const res = await request(app).get('/api/solicitudes/1/historial');
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('new_status');
        expect(res.body[0]).toHaveProperty('changed_at');
      }
    });

    it('retorna 422 para ID no numérico en historial', async () => {
      const res = await request(app).get('/api/solicitudes/abc/historial');
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/solicitudes/metricas/dashboard ──────────────────────
  describe('GET /api/solicitudes/metricas/dashboard', () => {
    it('retorna métricas del dashboard', async () => {
      const res = await request(app).get('/api/solicitudes/metricas/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
    });

    it('métricas incluyen conteos por urgencia', async () => {
      const res = await request(app).get('/api/solicitudes/metricas/dashboard');
      expect(res.body.data).toHaveProperty('alta');
      expect(res.body.data).toHaveProperty('media');
      expect(res.body.data).toHaveProperty('baja');
    });
  });

  // ── GET /api/solicitudes/referencias/tipos ───────────────────────
  describe('GET /api/solicitudes/referencias/tipos', () => {
    it('retorna lista de tipos de solicitud', async () => {
      const res = await request(app).get('/api/solicitudes/referencias/tipos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /api/solicitudes/referencias/areas ───────────────────────
  describe('GET /api/solicitudes/referencias/areas', () => {
    it('retorna lista de áreas', async () => {
      const res = await request(app).get('/api/solicitudes/referencias/areas');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── Health Check ─────────────────────────────────────────────────
  describe('GET /health', () => {
    it('retorna status OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });

    it('health incluye timestamp', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ── 404 handler ──────────────────────────────────────────────────
  describe('Ruta inexistente', () => {
    it('retorna 404 para rutas no definidas', async () => {
      const res = await request(app).get('/api/ruta-que-no-existe');
      expect(res.status).toBe(404);
    });
  });
});
