-- ================================================================
-- SEED DATA: reto_c
-- Run this after schema.sql to populate reference tables
-- ================================================================

-- ----------------------------------------------------------------
-- Áreas organizacionales
-- ----------------------------------------------------------------
INSERT INTO reto_c.areas (nombre, descripcion, email_contacto) VALUES
    ('Tecnología',        'Área de sistemas, infraestructura y desarrollo', 'tecnologia@empresa.com'),
    ('Recursos Humanos',  'Gestión de personal, capacitación y bienestar',  'rrhh@empresa.com'),
    ('Finanzas',          'Contabilidad, tesorería y presupuesto',           'finanzas@empresa.com'),
    ('Legal',             'Área jurídica y cumplimiento normativo',          'legal@empresa.com'),
    ('Operaciones',       'Logística, procesos y cadena de suministro',      'operaciones@empresa.com'),
    ('Marketing',         'Comunicación, branding y campañas',               'marketing@empresa.com'),
    ('Ventas',            'Comercial y atención al cliente',                  'ventas@empresa.com'),
    ('Dirección',         'Alta dirección y gerencia general',                'direccion@empresa.com')
ON CONFLICT (nombre) DO NOTHING;

-- ----------------------------------------------------------------
-- Tipos de solicitud
-- ----------------------------------------------------------------
INSERT INTO reto_c.tipos_solicitud (codigo, nombre, descripcion, sla_horas, requiere_aprobacion) VALUES
    ('SOPORTE',   'Soporte Técnico',       'Solicitudes de asistencia técnica y resolución de incidentes',          24,  FALSE),
    ('APROBACION','Aprobación',            'Solicitudes que requieren aprobación formal de un superior',             48,  TRUE),
    ('ACCESO',    'Acceso a Sistemas',     'Solicitudes de permisos, credenciales o acceso a plataformas',          48,  TRUE),
    ('COMPRA',    'Compra / Adquisición',  'Solicitudes de adquisición de equipos, software o servicios',           72,  TRUE),
    ('RRHH',      'Solicitud RRHH',        'Vacaciones, licencias, certificados laborales y trámites de personal',  48,  FALSE),
    ('REPORTE',   'Reporte / Informe',     'Solicitudes de generación de reportes o acceso a datos',                24,  FALSE),
    ('CAPACIT',   'Capacitación',          'Solicitudes de formación, cursos o talleres',                           72,  FALSE),
    ('OTRO',      'Otro',                  'Solicitudes que no encajan en las categorías anteriores',               48,  FALSE)
ON CONFLICT (codigo) DO NOTHING;
