-- ================================================================
-- CREACIÓN DE SCHEMAS
-- ================================================================

-- Schema para Reto A: Tracker de Iniciativas
DROP SCHEMA IF EXISTS reto_a CASCADE;
CREATE SCHEMA reto_a;
COMMENT ON SCHEMA reto_a IS 'Reto A: Tracker de Iniciativas - 40 iniciativas con estados y prioridades';

-- Schema para Reto B: Portal de Reportes de Área
DROP SCHEMA IF EXISTS reto_b CASCADE;
CREATE SCHEMA reto_b;
COMMENT ON SCHEMA reto_b IS 'Reto B: Portal de Reportes de Área - Métricas mensuales por categoría';

-- Schema para Reto C: Gestor de Solicitudes Internas
DROP SCHEMA IF EXISTS reto_c CASCADE;
CREATE SCHEMA reto_c;
COMMENT ON SCHEMA reto_c IS 'Reto C: Gestor de Solicitudes Internas - Sistema de tickets con workflow';

-- ================================================================
-- RETO A: TRACKER DE INICIATIVAS
-- ================================================================

-- Crear tabla de iniciativas
CREATE TABLE reto_a.iniciativas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('Pendiente', 'En curso', 'Completado')),
    fecha_limite DATE NOT NULL,
    prioridad VARCHAR(10) NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento de filtros
CREATE INDEX idx_iniciativas_estado ON reto_a.iniciativas(estado);
CREATE INDEX idx_iniciativas_prioridad ON reto_a.iniciativas(prioridad);
CREATE INDEX idx_iniciativas_fecha_limite ON reto_a.iniciativas(fecha_limite);

-- Comentarios
COMMENT ON TABLE reto_a.iniciativas IS 'Tabla principal de iniciativas o proyectos del área';
COMMENT ON COLUMN reto_a.iniciativas.estado IS 'Estado actual: Pendiente, En curso, Completado';
COMMENT ON COLUMN reto_a.iniciativas.prioridad IS 'Nivel de prioridad: Alta, Media, Baja';

-- ================================================================
-- DATOS DE PRUEBA - RETO A
-- ================================================================

INSERT INTO reto_a.iniciativas (nombre, responsable, estado, fecha_limite, prioridad, descripcion) VALUES
-- Iniciativas completadas (12)
('Migración a arquitectura cloud', 'Ana García', 'Completado', '2025-02-15', 'Alta', 'Completar migración de servicios legacy a infraestructura cloud con AWS'),
('Implementación dashboard ejecutivo', 'Carlos Ruiz', 'Completado', '2025-01-30', 'Media', 'Dashboard con KPIs en tiempo real para gerencia general'),
('Automatización de reportes mensuales', 'María López', 'Completado', '2025-02-20', 'Media', 'Script automatizado para generación de reportes financieros mensuales'),
('Capacitación equipo en DevOps', 'Pedro Sánchez', 'Completado', '2025-01-15', 'Alta', 'Programa de certificación en prácticas DevOps para el equipo técnico'),
('Actualización framework frontend', 'Laura Díaz', 'Completado', '2025-02-28', 'Baja', 'Migración de React 16 a React 18 en aplicaciones principales'),
('Auditoría de seguridad Q1', 'Roberto Morales', 'Completado', '2025-03-10', 'Alta', 'Revisión completa de vulnerabilidades y pentesting de aplicaciones críticas'),
('Optimización base de datos', 'Sofia Mendoza', 'Completado', '2025-01-25', 'Media', 'Optimización de queries y reducción de tiempos de respuesta en 40%'),
('Documentación API v2', 'Javier Torres', 'Completado', '2025-02-05', 'Baja', 'Documentación completa con Swagger para nueva versión de API REST'),
('Implementación CI/CD pipeline', 'Carmen Vega', 'Completado', '2025-03-01', 'Alta', 'Pipeline completo con Jenkins para deployment automatizado'),
('Migración repositorios a Git', 'Diego Flores', 'Completado', '2025-01-20', 'Media', 'Migración de SVN a Git y configuración de GitFlow'),
('Renovación certificados SSL', 'Andrea Castro', 'Completado', '2025-02-10', 'Alta', 'Renovación y actualización de certificados SSL en todos los dominios'),
('Cleanup código legacy', 'Luis Herrera', 'Completado', '2025-03-05', 'Baja', 'Eliminación de código obsoleto y refactorización de módulos antiguos'),

-- Iniciativas en curso (18)
('Implementación microservicios', 'Ana García', 'En curso', '2026-06-30', 'Alta', 'Descomposición de monolito en arquitectura de microservicios'),
('Portal de autoservicio clientes', 'Carlos Ruiz', 'En curso', '2026-05-15', 'Alta', 'Portal web para que clientes gestionen sus servicios sin intervención de soporte'),
('Sistema de monitoreo en tiempo real', 'María López', 'En curso', '2026-07-20', 'Media', 'Implementación de Grafana y Prometheus para monitoreo de infraestructura'),
('App móvil Android e iOS', 'Pedro Sánchez', 'En curso', '2026-08-31', 'Alta', 'Aplicación móvil nativa para acceso a servicios principales'),
('Integración con proveedores externos', 'Laura Díaz', 'En curso', '2026-06-15', 'Media', 'APIs de integración con 5 proveedores principales de la industria'),
('Modernización UI/UX', 'Roberto Morales', 'En curso', '2026-07-10', 'Media', 'Rediseño completo de interfaz con nueva identidad visual'),
('Chatbot con IA para soporte', 'Sofia Mendoza', 'En curso', '2026-06-25', 'Alta', 'Implementación de chatbot con GPT-4 para primera línea de soporte'),
('Sistema de notificaciones push', 'Javier Torres', 'En curso', '2026-05-30', 'Baja', 'Sistema centralizado de notificaciones para web y móvil'),
('Migración a Kubernetes', 'Carmen Vega', 'En curso', '2026-08-15', 'Alta', 'Containerización y orquestación con Kubernetes en producción'),
('Dashboard de análisis predictivo', 'Diego Flores', 'En curso', '2026-07-05', 'Media', 'Modelos de ML para predicción de tendencias de negocio'),
('Implementación SSO corporativo', 'Andrea Castro', 'En curso', '2026-06-10', 'Alta', 'Single Sign-On con Active Directory y OAuth 2.0'),
('Sistema de respaldos automatizado', 'Luis Herrera', 'En curso', '2026-05-25', 'Media', 'Política de backups incrementales diarios y completos semanales'),
('Actualización stack de seguridad', 'Ana García', 'En curso', '2026-07-30', 'Alta', 'Implementación de WAF, IDS/IPS y SIEM'),
('Portal interno de innovación', 'Carlos Ruiz', 'En curso', '2026-06-20', 'Baja', 'Plataforma para captura y evaluación de ideas de empleados'),
('Optimización performance frontend', 'María López', 'En curso', '2026-05-28', 'Media', 'Lazy loading, code splitting y optimización de assets'),
('Integración sistema de pagos', 'Pedro Sánchez', 'En curso', '2026-08-10', 'Alta', 'Integración con pasarelas de pago y procesamiento PCI-DSS'),
('Implementación feature flags', 'Laura Díaz', 'En curso', '2026-06-05', 'Baja', 'Sistema de feature toggles para releases controlados'),
('Migración a PostgreSQL 16', 'Roberto Morales', 'En curso', '2026-07-15', 'Media', 'Upgrade mayor de base de datos con zero downtime'),

-- Iniciativas pendientes (10)
('Implementación blockchain trazabilidad', 'Sofia Mendoza', 'Pendiente', '2026-09-30', 'Media', 'POC de blockchain para trazabilidad de productos'),
('Sistema de recomendaciones ML', 'Javier Torres', 'Pendiente', '2026-10-15', 'Alta', 'Motor de recomendaciones basado en machine learning'),
('Migración a arquitectura serverless', 'Carmen Vega', 'Pendiente', '2026-11-20', 'Baja', 'Evaluación y migración de servicios a AWS Lambda'),
('Implementación GraphQL API', 'Diego Flores', 'Pendiente', '2026-09-10', 'Media', 'Nueva API GraphQL para aplicaciones móviles'),
('Sistema de caché distribuido', 'Andrea Castro', 'Pendiente', '2026-10-25', 'Alta', 'Implementación de Redis Cluster para alta disponibilidad'),
('Automatización pruebas E2E', 'Luis Herrera', 'Pendiente', '2026-09-15', 'Media', 'Suite completa de tests E2E con Playwright'),
('Portal de desarrollo interno', 'Ana García', 'Pendiente', '2026-11-30', 'Baja', 'Hub central para documentación y herramientas de desarrollo'),
('Implementación CDN global', 'Carlos Ruiz', 'Pendiente', '2026-10-05', 'Media', 'CDN con Cloudflare para distribución de contenido estático'),
('Sistema de gestión de releases', 'María López', 'Pendiente', '2026-09-20', 'Alta', 'Plataforma para planificación y tracking de releases'),
('Migración a TypeScript', 'Pedro Sánchez', 'Pendiente', '2026-12-15', 'Baja', 'Conversión gradual de codebase JavaScript a TypeScript');

-- ================================================================
-- RETO B: PORTAL DE REPORTES DE ÁREA
-- ================================================================

-- Tabla de períodos
CREATE TABLE reto_b.periodos (
    id SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    nombre_mes VARCHAR(20) NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    UNIQUE(anio, mes)
);

-- Tabla de categorías de métricas
CREATE TABLE reto_b.categorias_metricas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    color_hex VARCHAR(7) DEFAULT '#091FFD'
);

-- Tabla principal de métricas mensuales
CREATE TABLE reto_b.metricas_mensuales (
    id SERIAL PRIMARY KEY,
    periodo_id INTEGER NOT NULL REFERENCES reto_b.periodos(id),
    categoria_id INTEGER NOT NULL REFERENCES reto_b.categorias_metricas(id),
    nombre_metrica VARCHAR(150) NOT NULL,
    valor_actual DECIMAL(15,2) NOT NULL,
    valor_objetivo DECIMAL(15,2),
    unidad VARCHAR(50) DEFAULT 'unidades',
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(periodo_id, categoria_id, nombre_metrica)
);

-- Índices para optimizar consultas
CREATE INDEX idx_metricas_periodo ON reto_b.metricas_mensuales(periodo_id);
CREATE INDEX idx_metricas_categoria ON reto_b.metricas_mensuales(categoria_id);
CREATE INDEX idx_periodos_fecha ON reto_b.periodos(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE reto_b.periodos IS 'Catálogo de períodos mensuales para organizar métricas';
COMMENT ON TABLE reto_b.categorias_metricas IS 'Categorías de métricas: Ventas, Operaciones, Calidad, RRHH, Financiero';
COMMENT ON TABLE reto_b.metricas_mensuales IS 'Métricas mensuales con valores actuales vs objetivos';

-- ================================================================
-- DATOS DE PRUEBA - RETO B
-- ================================================================

-- Insertar períodos (últimos 12 meses)
INSERT INTO reto_b.periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin) VALUES
(2025, 1, 'Enero', 1, '2025-01-01', '2025-01-31'),
(2025, 2, 'Febrero', 1, '2025-02-01', '2025-02-28'),
(2025, 3, 'Marzo', 1, '2025-03-01', '2025-03-31'),
(2025, 4, 'Abril', 2, '2025-04-01', '2025-04-30'),
(2025, 5, 'Mayo', 2, '2025-05-01', '2025-05-31'),
(2025, 6, 'Junio', 2, '2025-06-01', '2025-06-30'),
(2025, 7, 'Julio', 3, '2025-07-01', '2025-07-31'),
(2025, 8, 'Agosto', 3, '2025-08-01', '2025-08-31'),
(2025, 9, 'Septiembre', 3, '2025-09-01', '2025-09-30'),
(2025, 10, 'Octubre', 4, '2025-10-01', '2025-10-31'),
(2025, 11, 'Noviembre', 4, '2025-11-01', '2025-11-30'),
(2025, 12, 'Diciembre', 4, '2025-12-01', '2025-12-31');

-- Insertar categorías de métricas
INSERT INTO reto_b.categorias_metricas (nombre, descripcion, color_hex) VALUES
('Ventas', 'Métricas relacionadas con ingresos y volumen de ventas', '#091FFD'),
('Operaciones', 'Indicadores de eficiencia operativa y productividad', '#7315FA'),
('Calidad', 'Métricas de satisfacción y calidad de servicio', '#1FDCF9'),
('Recursos Humanos', 'Indicadores de talento y gestión de personal', '#A4A2F2'),
('Financiero', 'Métricas de rentabilidad y gestión financiera', '#0796a8');

-- Métricas de VENTAS (12 meses - primeros 5 meses con datos completos)
INSERT INTO reto_b.metricas_mensuales (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas) VALUES
-- Enero 2025
(1, 1, 'Ingresos totales', 450000.00, 500000.00, 'USD', 'Temporada baja post-fiestas'),
(1, 1, 'Nuevos clientes', 85, 100, 'clientes', 'Campaña Q1 en progreso'),
(1, 1, 'Ticket promedio', 2800.00, 3000.00, 'USD', 'Ajuste por promociones'),
(1, 1, 'Tasa de conversión', 3.2, 4.0, '%', 'Optimización de funnel pendiente'),

-- Febrero 2025
(2, 1, 'Ingresos totales', 480000.00, 500000.00, 'USD', 'Recuperación gradual'),
(2, 1, 'Nuevos clientes', 92, 100, 'clientes', 'Mejora vs mes anterior'),
(2, 1, 'Ticket promedio', 2950.00, 3000.00, 'USD', 'Campaña de upselling activa'),
(2, 1, 'Tasa de conversión', 3.5, 4.0, '%', 'A/B testing en landing pages'),

-- Marzo 2025
(3, 1, 'Ingresos totales', 520000.00, 500000.00, 'USD', 'Meta superada - cierre Q1'),
(3, 1, 'Nuevos clientes', 108, 100, 'clientes', 'Efecto de campaña digital'),
(3, 1, 'Ticket promedio', 3100.00, 3000.00, 'USD', 'Impulso de nuevos productos'),
(3, 1, 'Tasa de conversión', 4.2, 4.0, '%', 'Optimizaciones implementadas'),

-- Abril 2025
(4, 1, 'Ingresos totales', 495000.00, 520000.00, 'USD', 'Normalización post-Q1'),
(4, 1, 'Nuevos clientes', 95, 105, 'clientes', 'Ajuste de expectativas'),
(4, 1, 'Ticket promedio', 3050.00, 3100.00, 'USD', 'Estabilidad en precios'),
(4, 1, 'Tasa de conversión', 3.9, 4.2, '%', 'Mantenimiento de optimizaciones'),

-- Mayo 2025
(5, 1, 'Ingresos totales', 540000.00, 520000.00, 'USD', 'Crecimiento sostenido'),
(5, 1, 'Nuevos clientes', 112, 105, 'clientes', 'Referidos en aumento'),
(5, 1, 'Ticket promedio', 3200.00, 3100.00, 'USD', 'Lanzamiento línea premium'),
(5, 1, 'Tasa de conversión', 4.5, 4.2, '%', 'Mejor mes del año'),

-- Junio a Diciembre (datos proyectados/reales - solo ingresos)
(6, 1, 'Ingresos totales', 525000.00, 530000.00, 'USD', 'Cierre Q2 sólido'),
(7, 1, 'Ingresos totales', 510000.00, 540000.00, 'USD', 'Temporada media'),
(8, 1, 'Ingresos totales', 505000.00, 540000.00, 'USD', 'Vacaciones afectan ventas'),
(9, 1, 'Ingresos totales', 580000.00, 550000.00, 'USD', 'Inicio temporada alta'),
(10, 1, 'Ingresos totales', 620000.00, 580000.00, 'USD', 'Pico pre-fin de año'),
(11, 1, 'Ingresos totales', 650000.00, 600000.00, 'USD', 'Black Friday impacto positivo'),
(12, 1, 'Ingresos totales', 720000.00, 650000.00, 'USD', 'Mejor mes del año - fiestas');

-- Métricas de OPERACIONES (primeros 5 meses)
INSERT INTO reto_b.metricas_mensuales (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas) VALUES
(1, 2, 'Tiempo respuesta promedio', 2.8, 2.0, 'horas', 'Sistema antiguo ralentiza'),
(2, 2, 'Tiempo respuesta promedio', 2.5, 2.0, 'horas', 'Mejora gradual'),
(3, 2, 'Tiempo respuesta promedio', 2.1, 2.0, 'horas', 'Casi en objetivo'),
(4, 2, 'Tiempo respuesta promedio', 1.9, 2.0, 'horas', 'Meta alcanzada'),
(5, 2, 'Tiempo respuesta promedio', 1.8, 2.0, 'horas', 'Superando expectativas'),

(1, 2, 'Eficiencia operativa', 78.5, 85.0, '%', 'Baseline del año'),
(2, 2, 'Eficiencia operativa', 80.2, 85.0, '%', 'Capacitaciones iniciadas'),
(3, 2, 'Eficiencia operativa', 83.1, 85.0, '%', 'Automatización ayudando'),
(4, 2, 'Eficiencia operativa', 85.8, 85.0, '%', 'Por encima del objetivo'),
(5, 2, 'Eficiencia operativa', 87.3, 85.0, '%', 'Nuevos procesos funcionando'),

(1, 2, 'Ordenes procesadas', 1850, 2000, 'ordenes', 'Capacidad en 92%'),
(2, 2, 'Ordenes procesadas', 1920, 2000, 'ordenes', 'Mejorando volumen'),
(3, 2, 'Ordenes procesadas', 2050, 2000, 'ordenes', 'Capacidad extra utilizada'),
(4, 2, 'Ordenes procesadas', 1980, 2100, 'ordenes', 'Normalización'),
(5, 2, 'Ordenes procesadas', 2150, 2100, 'ordenes', 'Récord mensual');

-- Métricas de CALIDAD (primeros 5 meses)
INSERT INTO reto_b.metricas_mensuales (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas) VALUES
(1, 3, 'Satisfacción del cliente', 4.2, 4.5, 'puntos', 'Escala 1-5 | Incidentes Q4 afectaron'),
(2, 3, 'Satisfacción del cliente', 4.3, 4.5, 'puntos', 'Recuperación iniciada'),
(3, 3, 'Satisfacción del cliente', 4.5, 4.5, 'puntos', 'Meta alcanzada'),
(4, 3, 'Satisfacción del cliente', 4.6, 4.5, 'puntos', 'Mejora continua'),
(5, 3, 'Satisfacción del cliente', 4.7, 4.5, 'puntos', 'Mejor score del año'),

(1, 3, 'NPS (Net Promoter Score)', 42, 50, 'puntos', 'Base de cálculo actualizada'),
(2, 3, 'NPS (Net Promoter Score)', 45, 50, 'puntos', 'Tendencia positiva'),
(3, 3, 'NPS (Net Promoter Score)', 51, 50, 'puntos', 'Promotores aumentaron'),
(4, 3, 'NPS (Net Promoter Score)', 53, 50, 'puntos', 'Consolidación'),
(5, 3, 'NPS (Net Promoter Score)', 56, 50, 'puntos', 'Lealtad en crecimiento'),

(1, 3, 'Tasa de defectos', 2.8, 2.0, '%', 'Control de calidad reforzado'),
(2, 3, 'Tasa de defectos', 2.5, 2.0, '%', 'Capacitación en efecto'),
(3, 3, 'Tasa de defectos', 2.1, 2.0, '%', 'Cerca del objetivo'),
(4, 3, 'Tasa de defectos', 1.9, 2.0, '%', 'Meta cumplida'),
(5, 3, 'Tasa de defectos', 1.6, 2.0, '%', 'Excelente desempeño');

-- Métricas de RECURSOS HUMANOS (primeros 5 meses)
INSERT INTO reto_b.metricas_mensuales (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas) VALUES
(1, 4, 'Satisfacción empleados', 7.8, 8.0, 'puntos', 'Escala 1-10 | Encuesta Q1'),
(2, 4, 'Satisfacción empleados', 8.1, 8.0, 'puntos', 'Mejoras implementadas'),
(3, 4, 'Satisfacción empleados', 8.3, 8.0, 'puntos', 'Tendencia positiva'),
(4, 4, 'Satisfacción empleados', 8.2, 8.0, 'puntos', 'Estabilidad'),
(5, 4, 'Satisfacción empleados', 8.5, 8.0, 'puntos', 'Mejor trimestre'),

(1, 4, 'Rotación de personal', 12.5, 10.0, '%', 'Anualizada | Por encima del objetivo'),
(2, 4, 'Rotación de personal', 11.8, 10.0, '%', 'Mejorando retención'),
(3, 4, 'Rotación de personal', 10.5, 10.0, '%', 'En rango aceptable'),
(4, 4, 'Rotación de personal', 9.8, 10.0, '%', 'Meta alcanzada'),
(5, 4, 'Rotación de personal', 9.2, 10.0, '%', 'Estabilidad laboral mejorada'),

(1, 4, 'Horas capacitación', 320, 400, 'horas', 'Programa Q1 en curso'),
(2, 4, 'Horas capacitación', 380, 400, 'horas', 'Workshops externos'),
(3, 4, 'Horas capacitación', 425, 400, 'horas', 'Meta superada'),
(4, 4, 'Horas capacitación', 410, 400, 'horas', 'Manteniendo ritmo'),
(5, 4, 'Horas capacitación', 450, 400, 'horas', 'Inversión en talento');

-- Métricas FINANCIERAS (primeros 5 meses)
INSERT INTO reto_b.metricas_mensuales (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas) VALUES
(1, 5, 'Margen operativo', 18.5, 22.0, '%', 'Costos Q4 afectaron'),
(2, 5, 'Margen operativo', 19.8, 22.0, '%', 'Optimización de gastos'),
(3, 5, 'Margen operativo', 22.3, 22.0, '%', 'Objetivo alcanzado'),
(4, 5, 'Margen operativo', 21.5, 22.0, '%', 'Leve variación'),
(5, 5, 'Margen operativo', 23.1, 22.0, '%', 'Excelente performance'),

(1, 5, 'ROI campañas marketing', 280, 300, '%', 'Canales digitales optimizando'),
(2, 5, 'ROI campañas marketing', 295, 300, '%', 'Mejora en segmentación'),
(3, 5, 'ROI campañas marketing', 315, 300, '%', 'Mejor trimestre'),
(4, 5, 'ROI campañas marketing', 305, 300, '%', 'Consistencia'),
(5, 5, 'ROI campañas marketing', 320, 300, '%', 'Estrategia refinada'),

(1, 5, 'Días cartera promedio', 45, 30, 'días', 'Gestión de cobranza intensificada'),
(2, 5, 'Días cartera promedio', 38, 30, 'días', 'Mejora significativa'),
(3, 5, 'Días cartera promedio', 32, 30, 'días', 'Cerca del objetivo'),
(4, 5, 'Días cartera promedio', 29, 30, 'días', 'Meta cumplida'),
(5, 5, 'Días cartera promedio', 27, 30, 'días', 'Excelente flujo de caja');

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