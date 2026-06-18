# Gestor de Solicitudes Internas — Softtek Challenge 2026

Sistema web para la gestión de solicitudes internas con flujo de estados (FSM), bandeja de entrada con filtros, auditoría completa, indicadores de riesgo y panel de métricas en tiempo real.

---

## Tabla de contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Dependencias](#dependencias)
3. [Variables de entorno](#variables-de-entorno)
4. [Configuración de la base de datos](#configuración-de-la-base-de-datos)
5. [Ejecutar la aplicación](#ejecutar-la-aplicación)
6. [Pruebas y cobertura](#pruebas-y-cobertura)
7. [Estructura del proyecto](#estructura-del-proyecto)

---

## Prerrequisitos

| Herramienta   | Versión mínima | Notas |
|---------------|---------------|-------|
| **Node.js**   | 18.x (LTS)    | Probado con Node 18 y 20 |
| **npm**       | 9.x            | Incluido con Node.js 18+ |
| **PostgreSQL**| 14.x           | Probado con PG 14 y 15 |

Comprueba las versiones instaladas:

```bash
node -v
npm -v
psql --version
```

---

## Dependencias

Instala las dependencias de **backend** y **frontend** por separado:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

O desde la raíz del repositorio:

```bash
cd backend && npm install && cd ../frontend && npm install
```

### Dependencias principales

**Backend** (`backend/package.json`)

| Paquete    | Uso |
|------------|-----|
| express    | Framework HTTP |
| pg         | Cliente PostgreSQL |
| cors       | Habilitar CORS para el frontend |
| dotenv     | Leer variables de entorno desde `.env` |
| nodemon    | Auto-restart en desarrollo |

**Frontend** (`frontend/package.json`)

| Paquete            | Uso |
|--------------------|-----|
| react / react-dom  | UI reactiva |
| react-router-dom   | Navegación SPA |
| axios              | Cliente HTTP |
| vite               | Bundler y dev server |
| vitest             | Framework de tests |
| @testing-library/* | Utilidades de testing para React |

---

## Variables de entorno

El backend requiere un archivo `.env` en `backend/`. Copia la plantilla y rellena los valores:

```bash
cp backend/.env.example backend/.env
```

### Variables requeridas

| Variable      | Descripción | Ejemplo |
|---------------|-------------|---------|
| `DB_HOST`     | Host de PostgreSQL | `localhost` |
| `DB_PORT`     | Puerto de PostgreSQL | `5432` |
| `DB_NAME`     | Nombre de la base de datos | `softtek_db` |
| `DB_USER`     | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña del usuario | `Admin123` |
| `DB_SCHEMA`   | Schema a utilizar | `reto_c` |
| `PORT`        | Puerto del servidor backend | `3001` |

Contenido de ejemplo (`backend/.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=softtek_db
DB_USER=postgres
DB_PASSWORD=Admin123
DB_SCHEMA=reto_c
PORT=3001
```

> **Nota:** El archivo `.env` real **nunca** debe subirse al repositorio (está en `.gitignore`).

---

## Configuración de la base de datos

### 1. Crear la base de datos y el schema

Conéctate a PostgreSQL como superusuario y ejecuta:

```sql
CREATE DATABASE softtek_db;
\c softtek_db
CREATE SCHEMA reto_c;
```

### 2. Ejecutar el DDL (tablas y constraints)

```bash
psql -U postgres -d softtek_db -f backend/src/db-setup.sql
```

Este script crea las tablas:

| Tabla | Descripción |
|-------|-------------|
| `reto_c.tipos_solicitud` | Catálogo de tipos de solicitud |
| `reto_c.areas` | Catálogo de áreas organizativas |
| `reto_c.solicitudes` | Solicitudes con FSM de estados |
| `reto_c.historial_solicitudes` | Auditoría de cambios de estado |

### 3. Cargar datos maestros (seed)

```bash
node backend/src/db-init.js
```

Esto inserta los tipos de solicitud y áreas de ejemplo necesarios para usar la aplicación.

### 4. Verificar la conexión

```bash
node backend/src/db-verify.js
```

---

## Ejecutar la aplicación

Abre **dos terminales** en paralelo:

### Terminal 1 — Backend (puerto 3001)

```bash
cd backend
npm run dev
```

Salida esperada:
```
Backend running on port 3001
```

### Terminal 2 — Frontend (puerto 5173)

```bash
cd frontend
npm run dev
```

Salida esperada:
```
  VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Rutas disponibles en el frontend

| Ruta | Pantalla |
|------|----------|
| `/` | Formulario de nueva solicitud |
| `/inbox` | Bandeja de entrada con filtros y transiciones FSM |
| `/audit` | Log de auditoría completo con filtros |
| `/metrics` | Panel de métricas KPI |

### Endpoints del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tipos-solicitud` | Lista de tipos de solicitud |
| GET | `/api/areas` | Lista de áreas |
| POST | `/api/solicitudes` | Crear nueva solicitud |
| GET | `/api/solicitudes` | Listar solicitudes (con filtros) |
| PATCH | `/api/solicitudes/:id/estado` | Avanzar estado FSM |
| GET | `/api/solicitudes/:id/historial` | Historial de una solicitud |
| GET | `/api/historial` | Log de auditoría global (con filtros) |
| GET | `/api/metrics` | Métricas agregadas por estado y urgencia |

---

## Pruebas y cobertura

### Ejecutar todos los tests

```bash
# Backend (Jest)
cd backend
npm test

# Frontend (Vitest)
cd frontend
npm test
```

### Ver el reporte de cobertura en HTML

Después de correr `npm test`, los reportes HTML se generan en:

- **Backend:** `backend/coverage/index.html`
- **Frontend:** `frontend/coverage/index.html`

Abre el archivo en tu navegador para ver el reporte detallado.

### Umbral de cobertura

Ambos proyectos están configurados con un mínimo de **50%** en statements, branches, functions y lines.

| Proyecto | Statements | Branches | Functions | Lines |
|----------|-----------|----------|-----------|-------|
| Backend  | ~82%      | ~85%     | ~86%      | ~82% |
| Frontend | ~63%      | ~59%     | ~51%      | ~67% |

### Detalle de los tests

**Backend** (`backend/src/__tests__/`)

- `solicitudes.test.js` — Validación de campos, formato de ticket `TK{YY}{MM}-{SEQ:03}`, lógica FSM (transiciones válidas, skip, revert), endpoints POST y PATCH
- `routes.test.js` — Endpoints GET para areas, tipos, historial y métricas (incluyendo valores por defecto y manejo de errores)

**Frontend** (`frontend/src/test/`)

- `components.test.jsx` — RequestForm (validación, submit, ticket display), Inbox (FSM buttons, stale badge, transición modal), MetricsDashboard (KPI cards, refresh)

---

## Estructura del proyecto

```
Softtek-challenge-2026/
│
├── README.md                    ← Este archivo
├── REQUIREMENTS.md              ← Especificación del reto
│
├── backend/                     ← Servidor Express + PostgreSQL
│   ├── .env.example             ← Plantilla de variables de entorno
│   ├── package.json
│   └── src/
│       ├── index.js             ← Entry point: app Express, rutas, CORS
│       ├── db.js                ← Pool de conexión PostgreSQL (pg)
│       ├── db-setup.sql         ← DDL: creación de tablas y constraints
│       ├── db-init.js           ← Seed de datos maestros
│       ├── db-verify.js         ← Script de verificación de conexión
│       └── routes/
│           ├── areas.js         ← GET /api/areas
│           ├── tipos.js         ← GET /api/tipos-solicitud
│           ├── solicitudes.js   ← POST/GET /api/solicitudes, PATCH estado, GET historial
│           ├── historial.js     ← GET /api/historial (auditoría global)
│           └── metrics.js       ← GET /api/metrics (agregados SQL)
│
├── frontend/                    ← SPA React + Vite
│   ├── package.json
│   ├── vite.config.js           ← Config Vite + Vitest
│   └── src/
│       ├── main.jsx             ← Entry point React
│       ├── App.jsx              ← Router + Navbar
│       ├── api.js               ← Axios instance + helpers de API
│       ├── App.css              ← Estilos globales
│       ├── components/
│       │   ├── RequestForm.jsx     ← Pantalla: nueva solicitud
│       │   ├── Inbox.jsx           ← Pantalla: bandeja + FSM + historial popup
│       │   ├── AuditLog.jsx        ← Pantalla: log de auditoría
│       │   └── MetricsDashboard.jsx ← Pantalla: panel de métricas KPI
│       └── test/
│           ├── setup.js            ← Setup Vitest + jest-dom
│           └── components.test.jsx ← Tests de componentes React
│
└── backend/src/__tests__/       ← Tests Jest del backend
    ├── solicitudes.test.js
    └── routes.test.js
```
