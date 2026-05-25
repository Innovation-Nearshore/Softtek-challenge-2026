# Sistema de Gestión de Incidentes — Reto D

SPA full-stack para registrar, filtrar y gestionar el ciclo de vida de incidentes operativos.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL |
| ORM / Driver | `pg` (Pool nativo) |

---

## Estructura del Proyecto

```
.
├── ai-challenge-back/          # API REST Express
│   ├── server.js               # Punto de entrada
│   ├── src/
│   │   ├── app.js              # Configuración Express (CORS, middleware, rutas)
│   │   ├── config/db.js        # Pool de conexiones PostgreSQL
│   │   ├── routes/
│   │   │   └── incidentsRoutes.js
│   │   └── controllers/
│   │       └── incidentController.js
│   └── .env                    # Variables de entorno (no incluido en git)
│
├── ai-challenge-front/         # SPA React
│   └── src/
│       ├── App.tsx             # Componente raíz
│       ├── components/
│       │   ├── IncidentForm.tsx    # Formulario controlado con validación
│       │   ├── IncidentFilters.tsx # Filtros por estado y severidad
│       │   └── IncidentTable.tsx   # Tabla con selector de estado inline
│       ├── hooks/
│       │   └── useIncidents.ts    # Hook de estado global + mutaciones
│       ├── services/
│       │   └── incidentsApi.ts    # Capa HTTP (fetch nativo)
│       └── types/
│           └── incident.ts        # Interfaces TypeScript
│
└── docs/
    ├── mockups_reto_d.sql      # Script original del reto (schema reto_d)
    └── schema_app.sql          # Script de aplicación (tablas en inglés, schema public)
```

---

## Requisitos Previos

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ≥ 9

---

## Configuración de la Base de Datos

### 1. Crear la base de datos

```sql
CREATE DATABASE incidents_db;
```

### 2. Inicializar tablas y datos de prueba

Conectarse a la base de datos y ejecutar el script de aplicación:

```bash
psql -U <usuario> -d incidents_db -f docs/schema_app.sql
```

Esto crea:
- Tabla `incidents` con 18 registros de prueba (distribución: 3 Crítica · 5 Alta · 6 Media · 4 Baja)
- Tabla `incident_log` con el historial inicial de cambios de estado
- Índices sobre `status`, `severity` y `area`

> **Nota sobre los scripts SQL**
> `docs/mockups_reto_d.sql` es el script original del reto con nombres en español y schema `reto_d`.
> `docs/schema_app.sql` es el equivalente compatible con el backend (columnas en inglés, schema `public`).

---

## Configuración del Backend

### 1. Instalar dependencias

```bash
cd ai-challenge-back
npm install
```

### 2. Crear el archivo `.env`

Crear `ai-challenge-back/.env` con las siguientes variables:

```env
# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=incidents_db
DB_PASSWORD=tu_password
DB_PORT=5432

# Express
PORT=5000

# CORS — URL del frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar el servidor

```bash
# Modo producción
npm start

# El servidor queda disponible en http://localhost:5000
```

---

## Configuración del Frontend

### 1. Instalar dependencias

```bash
cd ai-challenge-front
npm install
```

### 2. Crear el archivo `.env`

Crear `ai-challenge-front/.env` con:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev

# La aplicación queda disponible en http://localhost:5173
```

### 4. Build de producción

```bash
npm run build
```

---

## Endpoints de la API

### `GET /api/incidents`

Retorna todos los incidentes ordenados por fecha de creación descendente.

**Respuesta 200:**
```json
{
  "success": true,
  "data": [ /* array de Incident */ ],
  "count": 18
}
```

---

### `POST /api/incidents`

Crea un nuevo incidente con estado inicial `Abierto`.

**Body:**
```json
{
  "title": "string (requerido)",
  "category": "string (requerido)",
  "severity": "Crítica | Alta | Media | Baja (requerido)",
  "area": "string (requerido)",
  "reporter": "string (requerido)",
  "description": "string (opcional)"
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Incidente creado exitosamente",
  "data": { /* Incident insertado */ }
}
```

**Respuesta 400 (validación fallida):**
```json
{
  "success": false,
  "error": "Validación fallida",
  "details": ["El título es obligatorio", "..."]
}
```

---

### `PUT /api/incidents/:id/status`

Actualiza el estado de un incidente y registra el cambio en `incident_log` dentro de una transacción SQL (`BEGIN / COMMIT / ROLLBACK`).

**Body:**
```json
{
  "newStatus": "Abierto | En atención | Cerrado"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente",
  "data": { /* Incident actualizado */ }
}
```

---

### `GET /health`

Health check del servidor.

```json
{ "status": "ok", "timestamp": "2025-05-22T..." }
```

---

## Funcionalidades del Frontend

| Funcionalidad | Implementación |
|---|---|
| Carga inicial de datos | `useEffect` + fetch al montar `App` |
| Crear incidente | Formulario controlado con validación preventiva |
| Cambiar estado inline | `<select>` por fila con loading/error individual |
| Filtro por estado | `useMemo` — AND lógico en memoria, sin API calls |
| Filtro por severidad | `useMemo` — combinado con filtro de estado |
| Actualización sin reload | Estado React actualizado localmente tras cada mutación |

### Valores permitidos (CHECK constraints)

| Campo | Valores |
|---|---|
| `severity` | `Crítica`, `Alta`, `Media`, `Baja` |
| `status` | `Abierto`, `En atención`, `Cerrado` |

---

## Flujo de Datos

```
Usuario
  │
  ├── Carga → GET /api/incidents → PostgreSQL (SELECT * ORDER BY created_at DESC)
  │             └── useIncidents hook actualiza estado React
  │
  ├── Crear → IncidentForm → POST /api/incidents → INSERT incidents
  │             └── addIncident() hace prepend local (sin refetch)
  │
  └── Cambiar estado → IncidentTable (select inline) → PUT /api/incidents/:id/status
                        └── Transacción: UPDATE incidents + INSERT incident_log
                        └── changeStatus() reemplaza el incidente en el array local
```

---

## Variables de Entorno — Referencia Completa

### Backend (`ai-challenge-back/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_USER` | Usuario PostgreSQL | `postgres` |
| `DB_HOST` | Host de la BD | `localhost` |
| `DB_DATABASE` | Nombre de la BD | `incidents_db` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `mypassword` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `PORT` | Puerto del servidor Express | `5000` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` |

### Frontend (`ai-challenge-front/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:5000/api` |

---

## Comandos de Referencia

```bash
# Backend — instalar e iniciar
cd ai-challenge-back && npm install && npm start

# Frontend — instalar, dev y build
cd ai-challenge-front && npm install && npm run dev
cd ai-challenge-front && npm run build

# PostgreSQL — inicializar BD
psql -U postgres -d incidents_db -f docs/schema_app.sql
```
