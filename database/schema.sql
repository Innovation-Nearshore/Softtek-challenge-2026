-- ================================================================
-- RETO C: GESTOR DE SOLICITUDES INTERNAS
-- Schema: reto_c
-- ================================================================

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS reto_c;

-- ----------------------------------------------------------------
-- Tabla de áreas de la organización
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reto_c.areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    email_contacto VARCHAR(255)
);

-- ----------------------------------------------------------------
-- Tabla de tipos de solicitud
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reto_c.tipos_solicitud (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    sla_horas INTEGER DEFAULT 48,
    requiere_aprobacion BOOLEAN DEFAULT FALSE
);

-- ----------------------------------------------------------------
-- Tabla principal de solicitudes
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reto_c.solicitudes (
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

-- ----------------------------------------------------------------
-- Tabla de historial de cambios de estado
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reto_c.historial_solicitudes (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES reto_c.solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Índices para optimizar consultas
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON reto_c.solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_urgencia ON reto_c.solicitudes(urgencia);
CREATE INDEX IF NOT EXISTS idx_solicitudes_tipo ON reto_c.solicitudes(tipo_solicitud_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_area_solicitante ON reto_c.solicitudes(area_solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON reto_c.solicitudes(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_historial_solicitud ON reto_c.historial_solicitudes(solicitud_id);

-- ----------------------------------------------------------------
-- Comentarios
-- ----------------------------------------------------------------
COMMENT ON TABLE reto_c.areas IS 'Catálogo de áreas organizacionales';
COMMENT ON TABLE reto_c.tipos_solicitud IS 'Tipos de solicitudes disponibles con SLA definido';
COMMENT ON TABLE reto_c.solicitudes IS 'Tabla principal de solicitudes internas con workflow';
COMMENT ON TABLE reto_c.historial_solicitudes IS 'Historial de cambios de estado de cada solicitud';
