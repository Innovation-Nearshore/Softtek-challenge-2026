-- ================================================================
-- RETO C: Gestor de Solicitudes Internas - DB SETUP SCRIPT
-- Run this against your PostgreSQL instance before starting the app
-- ================================================================

-- Create schema
DROP SCHEMA IF EXISTS reto_c CASCADE;
CREATE SCHEMA reto_c;

SET search_path TO reto_c;

-- ─── ÁREAS ──────────────────────────────────────────────────────
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    email_contacto VARCHAR(255)
);

-- ─── TIPOS DE SOLICITUD ─────────────────────────────────────────
CREATE TABLE tipos_solicitud (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    sla_horas INTEGER DEFAULT 48,
    requiere_aprobacion BOOLEAN DEFAULT FALSE
);

-- ─── SOLICITUDES ────────────────────────────────────────────────
CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    numero_ticket VARCHAR(20) NOT NULL UNIQUE,
    tipo_solicitud_id INTEGER NOT NULL REFERENCES tipos_solicitud(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    urgencia VARCHAR(10) NOT NULL CHECK (urgencia IN ('Alta', 'Media', 'Baja')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Recibida'
        CHECK (estado IN ('Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada')),
    solicitante VARCHAR(100) NOT NULL,
    email_solicitante VARCHAR(255) NOT NULL,
    area_solicitante_id INTEGER NOT NULL REFERENCES areas(id),
    area_asignada_id INTEGER REFERENCES areas(id),
    asignado_a VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    solucion TEXT,
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
    comentario_calificacion TEXT
);

-- ─── HISTORIAL ──────────────────────────────────────────────────
CREATE TABLE historial_solicitudes (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEXES ────────────────────────────────────────────────────
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_urgencia ON solicitudes(urgencia);
CREATE INDEX idx_solicitudes_tipo ON solicitudes(tipo_solicitud_id);
CREATE INDEX idx_solicitudes_area_solicitante ON solicitudes(area_solicitante_id);
CREATE INDEX idx_solicitudes_fecha ON solicitudes(fecha_creacion);
CREATE INDEX idx_historial_solicitud ON historial_solicitudes(solicitud_id);

-- ================================================================
-- SEED DATA
-- ================================================================

-- Áreas
INSERT INTO areas (nombre, descripcion, email_contacto) VALUES
('Administración', 'Servicios generales y gestión administrativa', 'admin@empresa.com'),
('Compras', 'Adquisiciones y gestión de proveedores', 'compras@empresa.com'),
('Finanzas', 'Contabilidad, tesorería y control financiero', 'finanzas@empresa.com'),
('Legal', 'Contratos, cumplimiento y gestión legal', 'legal@empresa.com'),
('Marketing', 'Comunicación, marca y estrategia comercial', 'marketing@empresa.com'),
('Operaciones', 'Logística, producción y cadena de suministro', 'operaciones@empresa.com'),
('Recursos Humanos', 'Gestión de talento, nómina y bienestar', 'rrhh@empresa.com'),
('Tecnología', 'Infraestructura, desarrollo y soporte técnico', 'ti@empresa.com');

-- Tipos de solicitud
INSERT INTO tipos_solicitud (codigo, nombre, descripcion, sla_horas, requiere_aprobacion) VALUES
('AD-ESP', 'Reserva de espacio', 'Sala de reuniones o auditorio', 12, FALSE),
('AD-SUM', 'Solicitud de suministros', 'Materiales de oficina o consumibles', 48, FALSE),
('CM-COM', 'Solicitud de compra', 'Compra de bienes o servicios', 120, TRUE),
('FN-REE', 'Reembolso de gastos', 'Solicitud de reembolso por gastos realizados', 72, TRUE),
('MK-MAT', 'Material promocional', 'Diseño o producción de material', 96, FALSE),
('RH-CER', 'Certificación laboral', 'Carta laboral o certificado de trabajo', 48, FALSE),
('RH-PER', 'Solicitud de permiso', 'Permiso por motivos personales', 12, TRUE),
('RH-VAC', 'Solicitud de vacaciones', 'Solicitud de días de vacaciones', 24, TRUE),
('TI-ACC', 'Acceso a sistemas', 'Solicitud de acceso a aplicaciones o sistemas', 24, TRUE),
('TI-SOP', 'Soporte técnico', 'Incidente o problema técnico', 4, FALSE);

-- Sample solicitudes (Recibidas)
INSERT INTO solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, fecha_creacion, fecha_vencimiento
) VALUES
('TK2605-001', (SELECT id FROM tipos_solicitud WHERE codigo='TI-SOP'),
 'No puedo imprimir desde mi computador', 'Al intentar imprimir sale error de spooler', 'Media', 'Recibida',
 'Mónica Rivera', 'monica.rivera@empresa.com', (SELECT id FROM areas WHERE nombre='Operaciones'),
 '2026-05-22 16:00:00', '2026-05-22 20:00:00'),

('TK2605-002', (SELECT id FROM tipos_solicitud WHERE codigo='AD-SUM'),
 'Papel higiénico y toallas baño piso 3', 'Baños del tercer piso sin insumos', 'Baja', 'Recibida',
 'Jaime Rueda', 'jaime.rueda@empresa.com', (SELECT id FROM areas WHERE nombre='Operaciones'),
 '2026-05-22 16:15:00', '2026-05-24 16:15:00'),

('TK2605-003', (SELECT id FROM tipos_solicitud WHERE codigo='RH-CER'),
 'Certificado de ingresos para crédito', 'Necesito certificación para solicitud de préstamo hipotecario', 'Media', 'Recibida',
 'Karina Escobar', 'karina.escobar@empresa.com', (SELECT id FROM areas WHERE nombre='Marketing'),
 '2026-05-22 16:30:00', '2026-05-24 16:30:00'),

('TK2605-004', (SELECT id FROM tipos_solicitud WHERE codigo='AD-ESP'),
 'Parqueadero visitante para mañana', 'Cliente extranjero viene mañana 10am', 'Alta', 'Recibida',
 'Fabián Ochoa', 'fabian.ochoa@empresa.com', (SELECT id FROM areas WHERE nombre='Marketing'),
 '2026-05-22 16:45:00', '2026-05-22 16:45:00');

-- Sample solicitudes (En revisión)
INSERT INTO solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
    asignado_a, fecha_creacion, fecha_vencimiento
) VALUES
('TK2605-005', (SELECT id FROM tipos_solicitud WHERE codigo='CM-COM'),
 'Compra servidores para expansión', 'Requerimos 3 servidores Dell PowerEdge para nuevo datacenter', 'Alta', 'En revisión',
 'Cristina Osorio', 'cristina.osorio@empresa.com',
 (SELECT id FROM areas WHERE nombre='Tecnología'),
 (SELECT id FROM areas WHERE nombre='Compras'),
 'Elena Mora', '2026-05-16 09:30:00', '2026-05-21 09:30:00'),

('TK2605-006', (SELECT id FROM tipos_solicitud WHERE codigo='FN-REE'),
 'Reembolso gastos viaje internacional', 'Viáticos y gastos de viaje a Miami por $1,850', 'Alta', 'En revisión',
 'Andrea Beltrán', 'andrea.beltran@empresa.com',
 (SELECT id FROM areas WHERE nombre='Marketing'),
 (SELECT id FROM areas WHERE nombre='Finanzas'),
 'Carmen Díaz', '2026-05-20 13:30:00', '2026-05-23 13:30:00'),

('TK2605-007', (SELECT id FROM tipos_solicitud WHERE codigo='RH-VAC'),
 'Vacaciones junio 10-24', 'Dos semanas de vacaciones en junio', 'Media', 'En revisión',
 'Pablo Quintero', 'pablo.quintero@empresa.com',
 (SELECT id FROM areas WHERE nombre='Operaciones'),
 (SELECT id FROM areas WHERE nombre='Recursos Humanos'),
 'Ana Rodríguez', '2026-05-21 14:00:00', '2026-05-22 14:00:00');

-- Sample solicitudes (Resuelta)
INSERT INTO solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
    asignado_a, fecha_creacion, fecha_vencimiento, fecha_resolucion, solucion,
    calificacion
) VALUES
('TK2601-001', (SELECT id FROM tipos_solicitud WHERE codigo='RH-PER'),
 'Permiso médico urgente', 'Solicito permiso para cita médica especializada', 'Alta', 'Resuelta',
 'Carlos Méndez', 'carlos.mendez@empresa.com',
 (SELECT id FROM areas WHERE nombre='Operaciones'),
 (SELECT id FROM areas WHERE nombre='Recursos Humanos'),
 'Ana Rodríguez', '2026-01-15 09:30:00', '2026-01-15 21:30:00', '2026-01-15 11:20:00',
 'Permiso aprobado. Registrado en sistema de nómina.', 5),

('TK2601-002', (SELECT id FROM tipos_solicitud WHERE codigo='TI-SOP'),
 'Problema con acceso a VPN', 'No puedo conectarme a la VPN desde casa', 'Media', 'Resuelta',
 'Laura Gómez', 'laura.gomez@empresa.com',
 (SELECT id FROM areas WHERE nombre='Finanzas'),
 (SELECT id FROM areas WHERE nombre='Tecnología'),
 'Pedro Silva', '2026-01-16 08:15:00', '2026-01-16 12:15:00', '2026-01-16 10:45:00',
 'Se reconfiguró el cliente VPN y se actualizaron credenciales.', 4),

('TK2601-003', (SELECT id FROM tipos_solicitud WHERE codigo='RH-CER'),
 'Certificado laboral para banco', 'Requiero certificación de ingresos para trámite bancario', 'Media', 'Resuelta',
 'Valentina Herrera', 'valentina.herrera@empresa.com',
 (SELECT id FROM areas WHERE nombre='Tecnología'),
 (SELECT id FROM areas WHERE nombre='Recursos Humanos'),
 'Ana Rodríguez', '2026-02-05 10:15:00', '2026-02-07 10:15:00', '2026-02-06 14:20:00',
 'Certificado emitido y enviado al correo del solicitante.', 5);

-- ─── HISTORIAL SEED ─────────────────────────────────────────────

-- Historial for Recibidas (initial record)
INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, NULL, 'Recibida', solicitante, 'Solicitud creada', fecha_creacion
FROM solicitudes WHERE estado = 'Recibida';

-- Historial for En revisión
INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, NULL, 'Recibida', solicitante, 'Solicitud creada', fecha_creacion
FROM solicitudes WHERE estado = 'En revisión';

INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'Recibida', 'En revisión', COALESCE(asignado_a, 'Sistema'), 'Solicitud tomada en revisión', fecha_creacion + INTERVAL '30 minutes'
FROM solicitudes WHERE estado = 'En revisión';

-- Historial for Resueltas
INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, NULL, 'Recibida', solicitante, 'Solicitud creada', fecha_creacion
FROM solicitudes WHERE estado = 'Resuelta';

INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'Recibida', 'En revisión', COALESCE(asignado_a, 'Sistema'), 'Solicitud tomada en revisión', fecha_creacion + INTERVAL '30 minutes'
FROM solicitudes WHERE estado = 'Resuelta';

INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'En revisión', 'Resuelta', COALESCE(asignado_a, 'Sistema'), solucion, fecha_resolucion
FROM solicitudes WHERE estado = 'Resuelta';
