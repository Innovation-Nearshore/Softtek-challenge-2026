# Gestor de Solicitudes — Setup Guide

MVP funcional con React + Tailwind (frontend) y Node.js + Express + PostgreSQL (backend).  
Schema de base de datos: `reto_c` — tabla principal: `reto_c.solicitudes`.

---

## Requisitos previos

- Node.js ≥ 18
- PostgreSQL con el schema `reto_c` y sus tablas ya creadas:
  - `reto_c.solicitudes`
  - `reto_c.tipos_solicitud`
  - `reto_c.areas`
  - `reto_c.historial_solicitudes`

---

## 1. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Contenido de `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_base
PORT=3001
```

---

## 2. Ejecutar el backend

```bash
cd backend
npm install
npm start
```

El servidor quedará escuchando en `http://localhost:3001`.

---

## 3. Configurar variables de entorno del frontend

```bash
cp frontend/.env.example frontend/.env
```

Contenido de `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

---

## 4. Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## API Endpoints

### GET /requests

Retorna todos los registros de `reto_c.solicitudes` con JOIN a `tipos_solicitud` y `areas`.

**Response 200:**
```json
[
  {
    "id": 1,
    "numero_ticket": "TCK-1716739200000",
    "titulo": "Falla en acceso al sistema",
    "descripcion": "No puedo iniciar sesión desde ayer.",
    "urgencia": "Alta",
    "estado": "Recibida",
    "solicitante": "Ana García",
    "email_solicitante": "ana.garcia@empresa.com",
    "fecha_creacion": "2026-05-26T14:00:00.000Z",
    "tipo_solicitud": "Soporte técnico",
    "area_solicitante": "Tecnología"
  }
]
```

---

### POST /requests

Crea una nueva solicitud en `reto_c.solicitudes`.

**URL:** `POST http://localhost:3001/requests`  
**Content-Type:** `application/json`

**Body de ejemplo:**
```json
{
  "tipo_solicitud_id": 1,
  "titulo": "Falla en acceso al sistema",
  "descripcion": "No puedo iniciar sesión desde ayer por la mañana.",
  "urgencia": "Alta",
  "solicitante": "Ana García",
  "email_solicitante": "ana.garcia@empresa.com",
  "area_solicitante_id": 3
}
```

**Campos requeridos:**

| Campo               | Tipo    | Descripción / Valores permitidos              |
|---------------------|---------|-----------------------------------------------|
| `tipo_solicitud_id` | integer | ID de la tabla `reto_c.tipos_solicitud`       |
| `titulo`            | string  | Título corto de la solicitud                  |
| `descripcion`       | string  | Descripción detallada                         |
| `urgencia`          | string  | `Alta`, `Media` o `Baja`                      |
| `solicitante`       | string  | Nombre completo del solicitante               |
| `email_solicitante` | string  | Email válido del solicitante                  |
| `area_solicitante_id` | integer | ID de la tabla `reto_c.areas`               |

**Campos generados automáticamente:**

| Campo           | Valor                            |
|-----------------|----------------------------------|
| `numero_ticket` | `TCK-<timestamp>` (ej: TCK-1716739200000) |
| `estado`        | `Recibida`                       |
| `fecha_creacion`| Timestamp de la BD               |

**Response 201:**
```json
{
  "id": 2,
  "numero_ticket": "TCK-1716739200123",
  "tipo_solicitud_id": 1,
  "titulo": "Falla en acceso al sistema",
  "descripcion": "No puedo iniciar sesión desde ayer por la mañana.",
  "urgencia": "Alta",
  "estado": "Recibida",
  "solicitante": "Ana García",
  "email_solicitante": "ana.garcia@empresa.com",
  "area_solicitante_id": 3,
  "fecha_creacion": "2026-05-26T14:05:00.000Z"
}
```

**Response 400 — campo faltante:**
```json
{ "error": "Missing required fields: titulo, email_solicitante" }
```

**Response 400 — urgencia inválida:**
```json
{ "error": "urgencia must be one of: Alta, Media, Baja" }
```

**Response 400 — email inválido:**
```json
{ "error": "Invalid email format for email_solicitante" }
```

---

## Estructura del proyecto

```
backend/
  src/
    db/             # Pool de conexión (pool.js) y helper query() (index.js)
    services/       # requestsService.js — queries SQL parametrizadas
    controllers/    # requestsController.js — validación y respuestas HTTP
    routes/         # requestsRoutes.js — definición GET /  POST /
    middlewares/    # errorHandler.js — manejo centralizado de errores
    app.js          # Express: cors, json, rutas, error handler
    index.js        # Entrada del servidor (dotenv + listen)

frontend/
  src/
    components/     # RequestForm.jsx, RequestsTable.jsx
    pages/          # RequestsPage.jsx
    services/       # requestsService.js (fetch API)
```
