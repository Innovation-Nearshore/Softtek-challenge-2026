# Gestor de Solicitudes — MVP

Full-stack MVP para gestión de solicitudes internas. Construido con **React + Tailwind** en el frontend y **Node.js + Express + PostgreSQL** en el backend.

---

## Stack

| Capa       | Tecnología                    |
|------------|-------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS  |
| Backend    | Node.js, Express 4            |
| Base de datos | PostgreSQL (schema `reto_c`) |

---

## Estructura del proyecto

```
/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── controllers/requestsController.js
│   │   ├── db/
│   │   │   ├── index.js        ← helper query()
│   │   │   └── pool.js         ← conexión pg.Pool
│   │   ├── middlewares/errorHandler.js
│   │   ├── routes/requestsRoutes.js
│   │   └── services/requestsService.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── RequestForm.jsx
    │   │   └── RequestsTable.jsx
    │   ├── pages/RequestsPage.jsx
    │   └── services/requestsService.js
    ├── .env.example
    └── package.json
```

---

## Schema de base de datos

El backend trabaja sobre el schema `reto_c` y las siguientes tablas (ya existentes, no se crean ni modifican):

- **`reto_c.solicitudes`** — tabla principal
- **`reto_c.tipos_solicitud`** — catálogo de tipos (join por `tipo_solicitud_id`)
- **`reto_c.areas`** — catálogo de áreas (join por `area_solicitante_id`)

### Columnas relevantes de `solicitudes`

| Columna              | Tipo      | Descripción                              |
|----------------------|-----------|------------------------------------------|
| `id`                 | serial PK | Identificador interno                    |
| `numero_ticket`      | varchar   | Generado automáticamente (TCK-timestamp) |
| `tipo_solicitud_id`  | integer FK| Referencia a `tipos_solicitud.id`        |
| `titulo`             | varchar   | Título breve                             |
| `descripcion`        | text      | Descripción detallada                    |
| `urgencia`           | varchar   | `Alta` \| `Media` \| `Baja`             |
| `estado`             | varchar   | Default: `Recibida`                      |
| `solicitante`        | varchar   | Nombre del solicitante                   |
| `email_solicitante`  | varchar   | Correo electrónico                       |
| `area_solicitante_id`| integer FK| Referencia a `areas.id`                  |
| `fecha_creacion`     | timestamp | Generado automáticamente                 |

---

## Configuración

### Backend

Copia `.env.example` a `.env` y completa los valores:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_db   # la DB que contiene el schema reto_c
```

### Frontend

Copia `.env.example` a `.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:3001
```

---

## Instalación y ejecución

### Backend

```bash
cd backend
npm install
npm start        # producción
# ó
npm run dev      # desarrollo
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

---

## Swagger UI

La documentación interactiva de la API está disponible en:

    http://localhost:3001/api-docs

Generada con **swagger-jsdoc** y **swagger-ui-express** (OpenAPI 3.0). Desde el navegador puedes explorar los endpoints, ver los schemas de solicitud/respuesta y ejecutar peticiones de prueba directamente.

---

## Endpoints

### `GET /requests`

Retorna todas las solicitudes con joins a `tipos_solicitud` y `areas`.

**Respuesta ejemplo:**

```json
[
  {
    "id": 1,
    "numero_ticket": "TCK-1716730800000",
    "titulo": "Falla en impresora",
    "tipo_solicitud": "Soporte TI",
    "urgencia": "Alta",
    "estado": "Recibida",
    "solicitante": "Ana García",
    "area_solicitante": "Recursos Humanos",
    "fecha_creacion": "2025-05-26T14:00:00.000Z"
  }
]
```

---

### `POST /requests`

Crea una nueva solicitud.

**URL:** `POST http://localhost:3001/requests`  
**Content-Type:** `application/json`

**Body requerido:**

```json
{
  "tipo_solicitud_id": 1,
  "titulo": "Falla en impresora del piso 3",
  "descripcion": "La impresora HP LaserJet no enciende desde esta mañana.",
  "urgencia": "Alta",
  "solicitante": "Ana García",
  "email_solicitante": "ana.garcia@empresa.com",
  "area_solicitante_id": 2
}
```

**Respuesta exitosa (201):**

```json
{
  "id": 42,
  "numero_ticket": "TCK-1716730812345",
  "tipo_solicitud_id": 1,
  "titulo": "Falla en impresora del piso 3",
  "descripcion": "La impresora HP LaserJet no enciende desde esta mañana.",
  "urgencia": "Alta",
  "estado": "Recibida",
  "solicitante": "Ana García",
  "email_solicitante": "ana.garcia@empresa.com",
  "area_solicitante_id": 2,
  "fecha_creacion": "2025-05-26T14:00:12.345Z"
}
```

**Errores posibles:**

| Código | Motivo                                           |
|--------|--------------------------------------------------|
| 400    | Campo requerido faltante o formato inválido      |
| 400    | Referencia FK inválida (tipo o área inexistente) |
| 500    | Error interno del servidor                       |

---

## Validaciones del backend

- Todos los campos del body son **obligatorios**.
- `urgencia` debe ser exactamente `Alta`, `Media` o `Baja`.
- `email_solicitante` debe contener `@` y un dominio.
- `tipo_solicitud_id` y `area_solicitante_id` deben ser enteros positivos.
- Las queries usan parámetros (`$1`, `$2`, …) para prevenir SQL injection.
