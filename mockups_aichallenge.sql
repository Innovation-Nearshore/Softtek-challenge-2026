-- Schema para Reto C: Gestor de Solicitudes Internas
DROP SCHEMA IF EXISTS reto_c CASCADE;
CREATE SCHEMA reto_c;
COMMENT ON SCHEMA reto_c IS 'Reto C: Gestor de Solicitudes Internas - Sistema de tickets con workflow';

-- ================================================================
-- RETO C: GESTOR DE SOLICITUDES INTERNAS
-- ================================================================

-- Nota: Por brevedad, incluyo estructura completa pero datos reducidos
-- El archivo individual tiene 60 solicitudes completas

-- Tabla de áreas de la organización
CREATE TABLE reto_c.areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    email_contacto VARCHAR(255)
);

-- Tabla de tipos de solicitud
CREATE TABLE reto_c.tipos_solicitud (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    sla_horas INTEGER DEFAULT 48,
    requiere_aprobacion BOOLEAN DEFAULT FALSE
);

-- Tabla principal de solicitudes
CREATE TABLE reto_c.solicitudes (
    id SERIAL PRIMARY KEY,
    numero_ticket VARCHAR(20) NOT NULL UNIQUE,
    tipo_solicitud_id INTEGER NOT NULL REFERENCES reto_c.tipos_solicitud(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    urgencia VARCHAR(10) NOT NULL CHECK (urgencia IN ('Alta', 'Media', 'Baja')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Recibida' 
        CHECK (estado IN ('Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada')),
    solicitante VARCHAR(100) NOT NULL,
    email_solicitante VARCHAR(255) NOT NULL,
    area_solicitante_id INTEGER NOT NULL REFERENCES reto_c.areas(id),
    area_asignada_id INTEGER REFERENCES reto_c.areas(id),
    asignado_a VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    solucion TEXT,
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
    comentario_calificacion TEXT
);

-- Tabla de historial de cambios de estado
CREATE TABLE reto_c.historial_solicitudes (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES reto_c.solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_solicitudes_estado ON reto_c.solicitudes(estado);
CREATE INDEX idx_solicitudes_urgencia ON reto_c.solicitudes(urgencia);
CREATE INDEX idx_solicitudes_tipo ON reto_c.solicitudes(tipo_solicitud_id);
CREATE INDEX idx_solicitudes_area_solicitante ON reto_c.solicitudes(area_solicitante_id);
CREATE INDEX idx_solicitudes_fecha ON reto_c.solicitudes(fecha_creacion);
CREATE INDEX idx_historial_solicitud ON reto_c.historial_solicitudes(solicitud_id);

-- Comentarios
COMMENT ON TABLE reto_c.areas IS 'Catálogo de áreas organizacionales';
COMMENT ON TABLE reto_c.tipos_solicitud IS 'Tipos de solicitudes disponibles con SLA definido';
COMMENT ON TABLE reto_c.solicitudes IS 'Tabla principal de solicitudes internas con workflow';
COMMENT ON TABLE reto_c.historial_solicitudes IS 'Historial de cambios de estado de cada solicitud';

-- ================================================================
-- DATOS DE PRUEBA - RETO C (versión reducida - 20 solicitudes)
-- ================================================================

-- Insertar áreas
INSERT INTO reto_c.areas (nombre, descripcion, email_contacto) VALUES
('Recursos Humanos', 'Gestión de talento, nómina y bienestar', 'rrhh@empresa.com'),
('Tecnología', 'Infraestructura, desarrollo y soporte técnico', 'ti@empresa.com'),
('Operaciones', 'Logística, producción y cadena de suministro', 'operaciones@empresa.com'),
('Finanzas', 'Contabilidad, tesorería y control financiero', 'finanzas@empresa.com'),
('Compras', 'Adquisiciones y gestión de proveedores', 'compras@empresa.com'),
('Marketing', 'Comunicación, marca y estrategia comercial', 'marketing@empresa.com'),
('Legal', 'Contratos, cumplimiento y gestión legal', 'legal@empresa.com'),
('Administración', 'Servicios generales y gestión administrativa', 'admin@empresa.com');

-- Insertar tipos de solicitud (versión reducida - 10 tipos)
INSERT INTO reto_c.tipos_solicitud (codigo, nombre, descripcion, sla_horas, requiere_aprobacion) VALUES
('RH-VAC', 'Solicitud de vacaciones', 'Solicitud de días de vacaciones', 24, TRUE),
('RH-PER', 'Solicitud de permiso', 'Permiso por motivos personales', 12, TRUE),
('RH-CER', 'Certificación laboral', 'Carta laboral o certificado de trabajo', 48, FALSE),
('TI-ACC', 'Acceso a sistemas', 'Solicitud de acceso a aplicaciones o sistemas', 24, TRUE),
('TI-SOP', 'Soporte técnico', 'Incidente o problema técnico', 4, FALSE),
('FN-REE', 'Reembolso de gastos', 'Solicitud de reembolso por gastos realizados', 72, TRUE),
('CM-COM', 'Solicitud de compra', 'Compra de bienes o servicios', 120, TRUE),
('MK-MAT', 'Material promocional', 'Diseño o producción de material', 96, FALSE),
('AD-SUM', 'Solicitud de suministros', 'Materiales de oficina o consumibles', 48, FALSE),
('AD-ESP', 'Reserva de espacio', 'Sala de reuniones o auditorio', 12, FALSE);

-- Insertar solicitudes (10 resueltas, 6 en revisión, 4 recibidas)
INSERT INTO reto_c.solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
    asignado_a, fecha_creacion, fecha_vencimiento, fecha_resolucion, solucion,
    calificacion, comentario_calificacion
) VALUES
-- RESUELTAS (10)
('TK-2501-001', 2, 'Permiso médico urgente', 'Solicito permiso para cita médica especializada mañana en la tarde', 'Alta', 'Resuelta', 
 'Carlos Méndez', 'carlos.mendez@empresa.com', 3, 1, 'Ana Rodríguez', 
 '2025-01-15 09:30:00', '2025-01-15 21:30:00', '2025-01-15 11:20:00',
 'Permiso aprobado. Registrado en sistema de nómina.', 5, 'Excelente atención y rapidez'),

('TK-2501-002', 5, 'Problema con acceso a VPN', 'No puedo conectarme a la VPN desde casa', 'Media', 'Resuelta',
 'Laura Gómez', 'laura.gomez@empresa.com', 4, 2, 'Pedro Silva',
 '2025-01-16 08:15:00', '2025-01-16 12:15:00', '2025-01-16 10:45:00',
 'Se reconfiguró el cliente VPN y se actualizaron credenciales. Problema resuelto.', 4, 'Buen soporte'),

('TK-2501-003', 9, 'Solicitud papel bond tamaño carta', 'Necesitamos 10 resmas de papel bond para el área', 'Baja', 'Resuelta',
 'Roberto Torres', 'roberto.torres@empresa.com', 6, 8, 'Sofía Vargas',
 '2025-01-18 14:20:00', '2025-01-20 14:20:00', '2025-01-19 16:30:00',
 'Material despachado y entregado al área solicitante.', 5, NULL),

('TK-2502-007', 5, 'No puedo acceder a correo corporativo', 'Desde esta mañana no cargo mensajes en Outlook', 'Alta', 'Resuelta',
 'Diego Flores', 'diego.flores@empresa.com', 5, 2, 'Pedro Silva',
 '2025-02-03 08:45:00', '2025-02-03 12:45:00', '2025-02-03 09:30:00',
 'Problema con certificado de seguridad. Se renovó y restauró servicio.', 5, NULL),

('TK-2502-008', 3, 'Certificado laboral para banco', 'Requiero certificación de ingresos para trámite bancario', 'Media', 'Resuelta',
 'Valentina Herrera', 'valentina.herrera@empresa.com', 2, 1, 'Ana Rodríguez',
 '2025-02-05 10:15:00', '2025-02-07 10:15:00', '2025-02-06 14:20:00',
 'Certificado emitido y enviado al correo del solicitante.', 5, 'Rápido y profesional'),

('TK-2502-010', 1, 'Vacaciones marzo 15-29', 'Solicito dos semanas de vacaciones en marzo', 'Media', 'Resuelta',
 'Gabriela Salinas', 'gabriela.salinas@empresa.com', 4, 1, 'Ana Rodríguez',
 '2025-02-12 09:00:00', '2025-02-13 09:00:00', '2025-02-12 16:30:00',
 'Vacaciones aprobadas. Confirmación enviada por email.', 5, 'Gracias por la agilidad'),

('TK-2502-011', 9, 'Tóner para impresora área contabilidad', 'Necesitamos 3 cartuchos de tóner negro', 'Baja', 'Resuelta',
 'Ricardo Ossa', 'ricardo.ossa@empresa.com', 4, 8, 'Sofía Vargas',
 '2025-02-15 11:00:00', '2025-02-17 11:00:00', '2025-02-16 10:15:00',
 'Tóner entregado. Tres unidades según solicitud.', 5, NULL),

('TK-2503-014', 6, 'Reembolso taxi a aeropuerto', 'Solicito reembolso de $45.00 por taxi a reunión cliente', 'Alta', 'Resuelta',
 'Sandra Mejía', 'sandra.mejia@empresa.com', 5, 4, 'Carmen Díaz',
 '2025-03-05 09:15:00', '2025-03-09 09:15:00', '2025-03-07 15:20:00',
 'Reembolso aprobado. Pago procesado en siguiente nómina.', 5, NULL),

('TK-2503-016', 4, 'Acceso a sistema CRM para nuevo vendedor', 'Incorporación de Juan Pérez requiere acceso urgente', 'Alta', 'Resuelta',
 'Claudia Ortiz', 'claudia.ortiz@empresa.com', 6, 2, 'Pedro Silva',
 '2025-03-12 07:45:00', '2025-03-13 07:45:00', '2025-03-12 10:30:00',
 'Usuario creado con perfil de vendedor. Credenciales enviadas.', 5, NULL),

('TK-2503-017', 10, 'Reserva parqueadero para visita cliente', 'Cliente importante visita el jueves, necesito dos espacios', 'Media', 'Resuelta',
 'Mauricio León', 'mauricio.leon@empresa.com', 6, 8, 'Sofía Vargas',
 '2025-03-15 13:00:00', '2025-03-15 13:00:00', '2025-03-15 14:15:00',
 'Espacios P1-05 y P1-06 reservados para jueves 9am-5pm.', 5, 'Perfecto timing');

-- EN REVISIÓN (6)
INSERT INTO reto_c.solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
    asignado_a, fecha_creacion, fecha_vencimiento
) VALUES
('TK-2505-026', 7, 'Compra servidores para expansión', 'Requerimos 3 servidores Dell PowerEdge para nuevo datacenter', 'Alta', 'En revisión',
 'Cristina Osorio', 'cristina.osorio@empresa.com', 2, 5, 'Elena Mora',
 '2025-05-16 09:30:00', '2025-05-21 09:30:00'),

('TK-2505-027', 6, 'Reembolso gastos viaje internacional', 'Viáticos y gastos de viaje a Miami por $1,850', 'Alta', 'En revisión',
 'Andrea Beltrán', 'andrea.beltran@empresa.com', 6, 4, 'Carmen Díaz',
 '2025-05-20 13:30:00', '2025-05-23 13:30:00'),

('TK-2505-028', 4, 'Acceso base de datos producción', 'Acceso temporal para auditoría externa', 'Alta', 'En revisión',
 'Silvia Moncada', 'silvia.moncada@empresa.com', 4, 2, NULL,
 '2025-05-21 11:00:00', '2025-05-22 11:00:00'),

('TK-2505-029', 1, 'Vacaciones junio 10-24', 'Dos semanas de vacaciones en junio', 'Media', 'En revisión',
 'Pablo Quintero', 'pablo.quintero@empresa.com', 5, 1, 'Ana Rodríguez',
 '2025-05-21 14:00:00', '2025-05-22 14:00:00'),

('TK-2505-030', 7, 'Compra mobiliario oficina nueva', 'Escritorios, sillas y archivadores para 20 puestos', 'Media', 'En revisión',
 'Marcela Caro', 'marcela.caro@empresa.com', 8, 5, NULL,
 '2025-05-21 15:30:00', '2025-05-26 15:30:00'),

('TK-2505-031', 8, 'Diseño catálogo productos 2026', 'Catálogo impreso y digital con nuevos productos', 'Media', 'En revisión',
 'Beatriz Mora', 'beatriz.mora@empresa.com', 6, 6, NULL,
 '2025-05-22 09:45:00', '2025-05-26 09:45:00');

-- RECIBIDAS (4)
INSERT INTO reto_c.solicitudes (
    numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
    solicitante, email_solicitante, area_solicitante_id, fecha_creacion, fecha_vencimiento
) VALUES
('TK-2505-046', 5, 'No puedo imprimir desde mi computador', 'Al intentar imprimir sale error de spooler', 'Media', 'Recibida',
 'Mónica Rivera', 'monica.rivera@empresa.com', 5,
 '2025-05-22 16:00:00', '2025-05-22 20:00:00'),

('TK-2505-047', 9, 'Papel higiénico y toallas baño piso 3', 'Baños del tercer piso sin insumos', 'Baja', 'Recibida',
 'Jaime Rueda', 'jaime.rueda@empresa.com', 3,
 '2025-05-22 16:15:00', '2025-05-24 16:15:00'),

('TK-2505-048', 3, 'Certificado de ingresos para crédito', 'Necesito certificación para solicitud de préstamo hipotecario', 'Media', 'Recibida',
 'Karina Escobar', 'karina.escobar@empresa.com', 6,
 '2025-05-22 16:30:00', '2025-05-24 16:30:00'),

('TK-2505-049', 10, 'Parqueadero visitante para mañana', 'Cliente extranjero viene mañana 10am', 'Alta', 'Recibida',
 'Fabián Ochoa', 'fabian.ochoa@empresa.com', 6,
 '2025-05-22 16:45:00', '2025-05-22 16:45:00');

-- Crear historial para solicitudes no recibidas
INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, NULL, 'Recibida', 'Sistema', 'Solicitud creada automáticamente', fecha_creacion
FROM reto_c.solicitudes WHERE estado IN ('Resuelta', 'En revisión');

INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'Recibida', 'En revisión', COALESCE(asignado_a, 'Sistema'), 'Solicitud tomada en revisión', fecha_creacion + INTERVAL '30 minutes'
FROM reto_c.solicitudes WHERE estado = 'Resuelta' AND asignado_a IS NOT NULL;

INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'En revisión', 'Resuelta', asignado_a, solucion, fecha_resolucion
FROM reto_c.solicitudes WHERE estado = 'Resuelta' AND asignado_a IS NOT NULL;

INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
SELECT id, 'Recibida', 'En revisión', 
       COALESCE(asignado_a, 'Sistema'), 
       'Solicitud en proceso de análisis',
       fecha_creacion + INTERVAL '15 minutes'
FROM reto_c.solicitudes WHERE estado = 'En revisión';