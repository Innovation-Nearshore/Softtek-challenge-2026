# Gestor de Solicitudes Internas — Softtek Challenge 2026

Aplicación web full-stack para crear, gestionar y hacer seguimiento de solicitudes internas (soporte, aprobaciones, requerimientos). El backend valida toda la lógica de estados y cada transición queda registrada automáticamente en una tabla de historial de auditoría.

---

## Características principales

- **Formulario de nueva solicitud** — crea tickets con validación en frontend y backend
- **Bandeja de solicitudes** — tabla paginada con filtros por tipo y urgencia
- **Cambio de estado validado** — la máquina de estados vive en el backend; el frontend sólo muestra las acciones disponibles
- **Historial de auditoría automático** — cada transición genera un registro en `reto_c.historial_solicitudes`
- **Vista de detalle** — datos completos de la solicitud + línea de tiempo del historial
- **Asignación de responsable** — al pasar a "En revisión" se puede registrar un responsable

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (schema `reto_c`) |
| HTTP client | Axios |
| Routing | React Router v6 |
| Validación backend | express-validator |

---

## Prerequisitos

- **Node.js** ≥ 18 y **npm** ≥ 9
- **PostgreSQL** ≥ 14 corriendo localmente
- Base de datos `ai_challenge` creada con las tablas del schema `reto_c` (ver sección "Base de datos" más abajo)

---

## Estructura del proyecto

```
Softtek-challenge-2026/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app (middlewares, rutas)
│   │   ├── server.js            # Entry point — inicia el servidor HTTP
│   │   ├── config/
│   │   │   ├── database.js      # Pool de conexión pg
│   │   │   └── index.js         # Leer variables de entorno
│   │   ├── controllers/
│   │   │   ├── solicitudesController.js
│   │   │   └── catalogosController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js  # Handler global de errores
│   │   │   └── validate.js      # express-validator helper
│   │   ├── repositories/
│   │   │   ├── solicitudesRepository.js
│   │   │   ├── historialRepository.js
│   │   │   ├── areasRepository.js
│   │   │   └── tiposSolicitudRepository.js
│   │   ├── routes/
│   │   │   ├── solicitudes.js
│   │   │   └── catalogos.js
│   │   ├── services/
│   │   │   └── solicitudesService.js  # Lógica de negocio + máquina de estados
│   │   └── utils/
│   │       └── AppError.js      # Clase de error personalizada
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js        # Instancia Axios configurada
│   │   │   └── solicitudesApi.js# Funciones de llamada a la API
│   │   ├── components/
│   │   │   ├── Badge.jsx / .css
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── LoadingSpinner.jsx / .css
│   │   │   ├── Message.css
│   │   │   ├── Navbar.jsx / .css
│   │   │   └── SuccessMessage.jsx
│   │   ├── pages/
│   │   │   ├── BandejaPage.jsx / .css
│   │   │   ├── DetalleSolicitudPage.jsx / .css
│   │   │   └── NuevaSolicitudPage.jsx / .css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql               # DDL completo del schema reto_c
│   └── seed.sql                 # Datos iniciales de áreas y tipos de solicitud
└── README.md
```

---

## Base de datos

### Las tablas ya existen en producción

Las tablas `reto_c.areas`, `reto_c.tipos_solicitud`, `reto_c.solicitudes` y `reto_c.historial_solicitudes` ya están creadas en la base de datos `ai_challenge`. **No es necesario ejecutar el schema** en ese entorno.

### Si necesitás recrear el schema en un entorno nuevo

```bash
# Conectarse a PostgreSQL
psql -U postgres -d ai_challenge

# Ejecutar el schema
\i database/schema.sql

# Ejecutar los datos iniciales
\i database/seed.sql
```

O bien en una sola línea desde la raíz del proyecto:

```bash
psql -U postgres -d ai_challenge -f database/schema.sql -f database/seed.sql
```

### Datos de conexión (referencia)

| Parámetro | Valor por defecto |
|---|---|
| Host | localhost |
| Puerto | 5432 |
| Base de datos | ai_challenge |
| Schema | reto_c |
| Usuario | postgres |
| Password | Admin123 |

> **Nunca hardcodear credenciales.** Usar el archivo `.env` descripto en la sección siguiente.

---

## Configuración de variables de entorno

### Backend

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_challenge
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_SCHEMA=reto_c
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

Editar `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

---

## Instalación y ejecución

### 1. Backend

```bash
cd backend
npm install
npm run dev      # desarrollo con nodemon (hot-reload)
# ó
npm start        # producción
```

El servidor queda disponible en `http://localhost:3001`.  
Health-check: `GET http://localhost:3001/api/health`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

> Ambos procesos deben estar corriendo simultáneamente. Abrí dos terminales.

---

## Documentación de la API

### Base URL

```
http://localhost:3001/api
```

### Solicitudes

#### `POST /requests` — Crear solicitud

**Body (JSON):**
```json
{
  "tipoSolicitudId": 1,
  "titulo": "Mi primera solicitud",
  "descripcion": "Descripción detallada del problema",
  "urgencia": "Alta",
  "solicitante": "Juan Pérez",
  "emailSolicitante": "juan@empresa.com",
  "areaSolicitanteId": 2
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Solicitud creada correctamente",
  "data": { "id": 1, "numero_ticket": "TKT-20260618-4823", "estado": "Recibida", ... }
}
```

---

#### `GET /requests` — Listar solicitudes

**Query params (opcionales):**
- `tipo` — ID del tipo de solicitud
- `urgencia` — `Alta` | `Media` | `Baja`

**Ejemplo:**
```
GET /api/requests?urgencia=Alta&tipo=2
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": [ { "id": 1, "estado": "Recibida", ... } ]
}
```

---

#### `GET /requests/:id` — Obtener solicitud por ID

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_ticket": "TKT-20260618-4823",
    "tipo_solicitud": { "id": 1, "nombre": "Soporte TI" },
    "area_solicitante": { "id": 2, "nombre": "Recursos Humanos" },
    ...
  }
}
```

---

#### `PATCH /requests/:id/status` — Cambiar estado

**Body (JSON):**
```json
{
  "estado": "En revisión",
  "usuario": "María García",
  "comentario": "Iniciando revisión del caso",
  "asignadoA": "Carlos López"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Estado actualizado a \"En revisión\"",
  "data": { "id": 1, "estado": "En revisión", "asignado_a": "Carlos López", ... }
}
```

**Respuesta 409 (transición inválida):**
```json
{
  "success": false,
  "message": "Transición inválida: no se puede pasar de \"Recibida\" a \"Resuelta\". El siguiente estado permitido es \"En revisión\"."
}
```

---

#### `GET /requests/:id/history` — Historial de auditoría

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "solicitud_id": 1,
      "estado_anterior": null,
      "estado_nuevo": "Recibida",
      "usuario": "Juan Pérez",
      "comentario": "Solicitud creada",
      "fecha_cambio": "2026-06-18T14:32:00.000Z"
    }
  ]
}
```

---

#### `PATCH /requests/:id/assignee` — Asignar responsable

**Body (JSON):**
```json
{ "asignadoA": "Ana Martínez" }
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Responsable asignado correctamente",
  "data": { "id": 1, "asignado_a": "Ana Martínez", ... }
}
```

### Catálogos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/areas` | Lista todas las áreas |
| GET | `/api/tipos-solicitud` | Lista todos los tipos de solicitud |

---

## Máquina de estados

```
┌──────────┐     Iniciar Revisión      ┌─────────────┐     Marcar Resuelta     ┌──────────┐
│ Recibida │ ─────────────────────────▶ │ En revisión │ ───────────────────────▶ │ Resuelta │
└──────────┘                           └─────────────┘                          └──────────┘

Reglas:
✓ Recibida   → En revisión   (válido)
✓ En revisión → Resuelta     (válido)
✗ Recibida   → Resuelta      (salto no permitido)
✗ En revisión → Recibida     (reversión no permitida)
✗ Resuelta   → cualquier     (estado terminal, no modificable)
```

La validación se realiza **exclusivamente en el backend** (`solicitudesService.js`). El frontend refleja el resultado pero no tiene autoridad sobre las transiciones.

---

## Supuestos y decisiones de diseño

1. **Autenticación:** No se implementó sistema de login. El campo `usuario` en el cambio de estado es un texto libre (nombre del operador). En un sistema real se tomaría del token JWT.

2. **Título de solicitud:** El formulario incluye un campo `titulo` no listado explícitamente en el challenge original. Se asumió necesario ya que la tabla `solicitudes` tiene la columna `titulo NOT NULL`.

3. **Email del solicitante:** Se incluye en el formulario porque la tabla lo requiere (`email_solicitante NOT NULL`).

4. **`numero_ticket`:** Se genera automáticamente en el backend con el formato `TKT-YYYYMMDD-XXXX`. El usuario no lo ingresa manualmente.

5. **`fecha_vencimiento`:** Se calcula automáticamente al crear la solicitud sumando `sla_horas` del tipo de solicitud a la fecha actual.

6. **`fecha_resolucion`:** Se asigna automáticamente en el backend cuando el estado pasa a "Resuelta".

7. **Historial inicial:** Al crear una solicitud se inserta automáticamente un registro en `historial_solicitudes` con `estado_anterior = NULL` y `estado_nuevo = 'Recibida'`.

8. **CORS:** El backend acepta requests desde cualquier origen (`cors()` sin restricciones) para simplificar el MVP. En producción se debe restringir al dominio del frontend.

9. **Estados Rechazada/Cancelada:** Están definidos en la tabla como terminales (el backend los trata como estados finales de los que no se puede salir), pero el flujo del MVP no expone botones para llegar a esos estados desde el frontend.

10. **Seed data:** El script `database/seed.sql` usa `ON CONFLICT DO NOTHING` para ser idempotente; se puede ejecutar múltiples veces sin duplicar datos.

---

## Criterios de aceptación cumplidos

| # | Criterio | Estado |
|---|---|---|
| 1 | App corre en el navegador sin errores | ✅ |
| 2 | Formulario guarda solicitudes en PostgreSQL | ✅ |
| 3 | Bandeja lista solicitudes desde PostgreSQL | ✅ |
| 4 | Filtros por tipo y urgencia funcionan | ✅ |
| 5 | Flujo de estados Recibida → En revisión → Resuelta | ✅ |
| 6 | Backend rechaza transiciones inválidas (409) | ✅ |
| 7 | Cambio de estado persiste en base de datos | ✅ |
| 8 | Cambios de estado quedan en `historial_solicitudes` | ✅ |
| 9 | README explica instalación y ejecución completa | ✅ |
