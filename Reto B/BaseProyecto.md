# Web App de Métricas

## 1. Componentes principales

### Frontend
- **Tecnologías:** HTML, CSS, JavaScript.
- **Librería de visualización:** Chart.js.
- **Funciones:**
  - Formulario de ingreso manual de métricas.
  - Panel de filtros multidimensionales (fecha, categoría, equipo).
  - Visualización de métricas en gráficas de barras y líneas.
  - Tarjetas de resumen (total, promedio, variación).
  - Soporte de temas (light, dark, alto contraste).
  - Anotaciones interactivas en gráficos.

### Backend
- **Tecnología:** Node.js (Express.js recomendado).
- **Funciones:**
  - Endpoints REST para:
    - Cargar datos desde formulario o CSV.
    - Consultar métricas filtradas.
    - Guardar y compartir presets de dashboard.
    - Gestionar anotaciones.
    - Proveer datos para panel de explicabilidad AI.
  - Validación de entradas y seguridad básica.
  - Conexión a PostgreSQL.

### Base de Datos
- **Motor:** PostgreSQL.
- Tablas: `reto_b.categorias_metricas`, `reto_b.metricas_mensuales` y `reto_b.periodos`

- Scripts de creación:
Para `reto_b.categorias_metricas`:
CREATE TABLE IF NOT EXISTS reto_b.categorias_metricas
(
    id integer NOT NULL DEFAULT nextval('reto_b.categorias_metricas_id_seq'::regclass),
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    color_hex character varying(7) COLLATE pg_catalog."default" DEFAULT '#091FFD'::character varying,
    CONSTRAINT categorias_metricas_pkey PRIMARY KEY (id),
    CONSTRAINT categorias_metricas_nombre_key UNIQUE (nombre)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS reto_b.categorias_metricas
    OWNER to postgres;

COMMENT ON TABLE reto_b.categorias_metricas
    IS 'Categorías de métricas: Ventas, Operaciones, Calidad, RRHH, Financiero';

Para `reto_b.metricas_mensuales`:
CREATE TABLE IF NOT EXISTS reto_b.metricas_mensuales
(
    id integer NOT NULL DEFAULT nextval('reto_b.metricas_mensuales_id_seq'::regclass),
    periodo_id integer NOT NULL,
    categoria_id integer NOT NULL,
    nombre_metrica character varying(150) COLLATE pg_catalog."default" NOT NULL,
    valor_actual numeric(15,2) NOT NULL,
    valor_objetivo numeric(15,2),
    unidad character varying(50) COLLATE pg_catalog."default" DEFAULT 'unidades'::character varying,
    notas text COLLATE pg_catalog."default",
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metricas_mensuales_pkey PRIMARY KEY (id),
    CONSTRAINT metricas_mensuales_periodo_id_categoria_id_nombre_metrica_key UNIQUE (periodo_id, categoria_id, nombre_metrica),
    CONSTRAINT metricas_mensuales_categoria_id_fkey FOREIGN KEY (categoria_id)
        REFERENCES reto_b.categorias_metricas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT metricas_mensuales_periodo_id_fkey FOREIGN KEY (periodo_id)
        REFERENCES reto_b.periodos (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS reto_b.metricas_mensuales
    OWNER to postgres;

COMMENT ON TABLE reto_b.metricas_mensuales
    IS 'Métricas mensuales con valores actuales vs objetivos';
-- Index: idx_metricas_categoria

-- DROP INDEX IF EXISTS reto_b.idx_metricas_categoria;

CREATE INDEX IF NOT EXISTS idx_metricas_categoria
    ON reto_b.metricas_mensuales USING btree
    (categoria_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_metricas_periodo

-- DROP INDEX IF EXISTS reto_b.idx_metricas_periodo;

CREATE INDEX IF NOT EXISTS idx_metricas_periodo
    ON reto_b.metricas_mensuales USING btree
    (periodo_id ASC NULLS LAST)
    TABLESPACE pg_default;

Para `reto_b.periodos`:
CREATE TABLE IF NOT EXISTS reto_b.periodos
(
    id integer NOT NULL DEFAULT nextval('reto_b.periodos_id_seq'::regclass),
    anio integer NOT NULL,
    mes integer NOT NULL,
    nombre_mes character varying(20) COLLATE pg_catalog."default" NOT NULL,
    trimestre integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    CONSTRAINT periodos_pkey PRIMARY KEY (id),
    CONSTRAINT periodos_anio_mes_key UNIQUE (anio, mes),
    CONSTRAINT periodos_mes_check CHECK (mes >= 1 AND mes <= 12),
    CONSTRAINT periodos_trimestre_check CHECK (trimestre >= 1 AND trimestre <= 4)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS reto_b.periodos
    OWNER to postgres;

COMMENT ON TABLE reto_b.periodos
    IS 'Catálogo de períodos mensuales para organizar métricas';
-- Index: idx_periodos_fecha

-- DROP INDEX IF EXISTS reto_b.idx_periodos_fecha;

CREATE INDEX IF NOT EXISTS idx_periodos_fecha
    ON reto_b.periodos USING btree
    (fecha_inicio ASC NULLS LAST, fecha_fin ASC NULLS LAST)
    TABLESPACE pg_default;

---

## 2. Flujo de datos

1. **Ingreso de datos**
   - Usuario carga CSV o completa formulario.
   - Backend valida y guarda en `reto_b.metricas_mensuales`.

2. **Persistencia**
   - Datos se almacenan en PostgreSQL.
   - Mockup inicial ya disponible para visualización inmediata.

3. **Consulta y visualización**
   - Frontend solicita datos vía API.
   - Backend aplica filtros y devuelve JSON.
   - Chart.js renderiza gráficas dinámicas.
   - Tarjetas resumen calculan métricas clave.

4. **Colaboración y accesibilidad**
   - Presets de dashboard guardados y compartidos.
   - Anotaciones en visualizaciones con notificaciones.
   - Temas accesibles adaptados a preferencias del usuario.

---

## 3. Diagrama lógico (texto)

[Usuario]
↓ (HTML/JS UI con Chart.js)
[Frontend]
↓ REST API (JSON)
[Backend]
↓ (Node.js)
[DB]
↓ (PostgreSQL )

---

## 4. Requisitos no funcionales
- **Accesibilidad:** cumplimiento WCAG en filtros, temas y anotaciones.
- **Performance:** filtros aplicados en tiempo real.
- **Seguridad:** control de acceso en presets y anotaciones.
- **Escalabilidad:** posibilidad de añadir nuevas métricas y equipos.

---

## 5. Especificación Funcional


# 5.1 Módulo 1 — Carga de datos: 
Upload de CSV o ingreso manual de métricas con un formulario estructurado por período.

# 5.2 Módulo 2 — Visualización: 
Gráficas de barras y líneas con los datos cargados. Tarjetas de resumen con métricas principales (total, promedio, variación).
