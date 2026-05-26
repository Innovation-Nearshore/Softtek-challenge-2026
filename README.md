# Gestor de Solicitudes — Softtek AI Challenge 2026

Aplicación web full-stack para el registro y gestión de solicitudes internas, construida con React, Express.js y PostgreSQL.

---

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Despliegue Local](#instalación-y-despliegue-local)
- [Ejecución de Tests y Cobertura](#ejecución-de-tests-y-cobertura)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Arquitectura](#arquitectura)
- [Puertos](#puertos)

---

## Requisitos Previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18 LTS          |
| npm         | 9+              |
| PostgreSQL  | 14+             |

Asegúrate de tener PostgreSQL corriendo con la base de datos `ai_challenge` creada y el schema `reto_c` inicializado con el script provisto.

---

## Variables de Entorno

Crea el archivo `backend/.env` copiando la plantilla:

```bash
cp backend/.env.example backend/.env
```

Contenido de `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_challenge
DB_USER=postgres
DB_PASSWORD=Admin123
DB_SCHEMA=reto_c
PORT=3001
NODE_ENV=development
```

> **Nota:** No modifiques estos valores si usas la configuración estándar del Kit de Inicio del challenge.

---

## Instalación y Despliegue Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Innovation-Nearshore/Softtek-challenge-2026.git
cd Softtek-challenge-2026
```

### 2. Cargar el esquema y datos de prueba en PostgreSQL

Ejecuta el script SQL provisto:

```bash
psql -U postgres -d ai_challenge -f mockups_aichallenge.sql
```

O ábrelo directamente en pgAdmin y ejecútalo sobre la base de datos `ai_challenge`.

### 3. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 4. Iniciar el Backend (puerto 3001)

```bash
npm run dev
```

Verifica que el servidor esté corriendo:

```
GET http://localhost:3001/health
→ { "status": "OK", "timestamp": "..." }
```

### 5. Instalar dependencias del Frontend (en otra terminal)

```bash
cd frontend
npm install
```

### 6. Iniciar el Frontend (puerto 3000)

```bash
npm start
```

Abre el navegador en **http://localhost:3000**

> Las 15 solicitudes precargadas deben ser visibles en la bandeja inmediatamente sin necesidad de registrar nada.

---

## Ejecución de Tests y Cobertura

Los tests de integración están en `backend/src/__tests__/solicitudes.test.js` y usan mocks de la base de datos (no requieren conexión real a PostgreSQL).

```bash
cd backend
npm test
```

Esto ejecuta Jest con cobertura y muestra el reporte en consola. El reporte de cobertura HTML se genera en `backend/coverage/lcov-report/index.html`.

**Cobertura objetivo:** ≥ 50% de líneas del código fuente backend.

---

## Funcionalidades Implementadas

### Obligatorias (70 pts)

| Funcionalidad | Descripción |
|---------------|-------------|
| ✅ Formulario completo | Campos: tipo, urgencia (Alta/Media/Baja), descripción, solicitante y área |
| ✅ Guardar en PostgreSQL | `POST /api/solicitudes` escribe en la tabla `solicitudes` del schema `reto_c` |
| ✅ Bandeja con datos precargados | Las 15 solicitudes mockup son visibles sin registrar nada nuevo |
| ✅ Persistencia real (F5) | Datos vienen de PostgreSQL, no de memoria del browser |
| ✅ Cambio de estado inline | Dropdown en bandeja: `Recibida → En revisión → Resuelta`, guardado en BD |
| ✅ Sin errores de consola | Zero excepciones JS ni errores de red en DevTools |

### Bonus

| Bonus | Descripción |
|-------|-------------|
| ✅ Filtro por tipo | Dropdown que filtra la bandeja por categoría de solicitud |
| ✅ Filtro por urgencia | Botones/dropdown que filtra por Alta / Media / Baja |
| ✅ Vista de detalle | Modal con todos los campos de la solicitud seleccionada |
| ✅ Historial con timestamp | Tabla `historial_solicitudes` con `changed_at` en cada cambio de estado |
| ✅ Tests automatizados ≥50% | Suite Jest + Supertest ejecutable con `npm test`, reporte de cobertura visible |
| ✅ Dashboard de métricas | Cards con conteos por estado y urgencia calculados desde PostgreSQL |
| ✅ README con instrucciones | Este archivo — despliegue verificable en menos de 5 minutos |

---

## Arquitectura

```
Softtek-challenge-2026/
├── backend/                    # API Express.js (puerto 3001)
│   ├── src/
│   │   ├── app.js              # Express app (CORS, Helmet, rate-limit, caché)
│   │   ├── server.js           # Entrada del servidor
│   │   ├── config/
│   │   │   └── database.js     # Pool de conexión PostgreSQL (pg)
│   │   ├── models/
│   │   │   └── SolicitudModel.js   # Todas las queries SQL (parameterizadas)
│   │   ├── controllers/
│   │   │   └── SolicitudController.js  # Lógica de negocio
│   │   ├── middlewares/
│   │   │   └── validationMiddleware.js # express-validator (anti SQL injection)
│   │   ├── routes/
│   │   │   └── solicitudRoutes.js      # Definición de endpoints REST
│   │   └── __tests__/
│   │       └── solicitudes.test.js     # Tests de integración con mocks
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React App (puerto 3000)
│   ├── src/
│   │   ├── App.jsx             # Layout principal y navegación
│   │   ├── services/
│   │   │   └── api.js          # Axios con interceptores y helpers
│   │   └── components/
│   │       ├── RequestForm.jsx         # Formulario de nueva solicitud
│   │       ├── RequestsTable.jsx       # Bandeja con filtros e inline status
│   │       ├── RequestDetailModal.jsx  # Modal de detalle e historial
│   │       └── Dashboard.jsx           # Cards de métricas
│   └── package.json
│
├── mockups_aichallenge.sql     # Script de creación de tablas y datos ficticios
└── README.md
```

### Decisiones de diseño

- **MVC estricto**: el modelo contiene todas las queries SQL; el controlador solo orquesta; las rutas son solo declarativas.
- **Queries parameterizadas**: todos los valores de usuario pasan como parámetros `$n`, nunca concatenados, eliminando SQL injection.
- **Caché en memoria**: `node-cache` con TTL de 60 s en `GET /api/solicitudes`, invalidado automáticamente en POST y PATCH.
- **CORS restringido**: solo acepta peticiones de `http://localhost:3000`.
- **Helmet + rate-limit**: headers de seguridad y máximo 100 req/15 min por IP.
- **Transacciones**: el cambio de estado usa `BEGIN/COMMIT/ROLLBACK` para garantizar atomicidad entre update y log de historial.

---

## Puertos

| Servicio  | Puerto |
|-----------|--------|
| Backend   | 3001   |
| Frontend  | 3000   |

---

## Endpoints principales de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/health` | Health check del servidor |
| GET    | `/api/solicitudes` | Listar solicitudes (filtros: tipo, urgencia, estado) |
| GET    | `/api/solicitudes/:id` | Detalle de una solicitud |
| POST   | `/api/solicitudes` | Crear nueva solicitud |
| PATCH  | `/api/solicitudes/:id/status` | Cambiar estado de una solicitud |
| GET    | `/api/solicitudes/:id/historial` | Historial de cambios de estado |
| GET    | `/api/solicitudes/metricas/dashboard` | Métricas del dashboard |
| GET    | `/api/solicitudes/referencias/tipos` | Tipos de solicitud disponibles |
| GET    | `/api/solicitudes/referencias/areas` | Áreas disponibles |
