# Tracker de Iniciativas — Softtek Challenge 2026

Aplicación web full-stack para el seguimiento de iniciativas del área de Operaciones.  
Permite registrar, editar, eliminar y filtrar iniciativas con persistencia en PostgreSQL.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Configuración de la base de datos](#configuración-de-la-base-de-datos)
3. [Configuración del backend](#configuración-del-backend)
4. [Configuración del frontend](#configuración-del-frontend)
5. [Ejecutar la aplicación](#ejecutar-la-aplicación)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [API Reference](#api-reference)
8. [Decisiones técnicas y seguridad](#decisiones-técnicas-y-seguridad)

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 20.x          |
| npm         | 10.x          |
| PostgreSQL  | 14.x          |

---

## Configuración de la base de datos

1. Conectarse a PostgreSQL con un usuario administrador.
2. Ejecutar el script de datos mockup para crear el schema y cargar los datos de prueba:

```bash
psql -U postgres -d postgres -f src/mockups_aichallenge.sql
```

> Esto crea el schema `reto_a` y la tabla `reto_a.iniciativas` con 40 registros de prueba.

---

## Configuración del backend

### 1. Instalar dependencias

```bash
cd src/backend
npm install
```

### 2. Crear archivo de entorno

```bash
cp .env.example .env
```

Editar `src/backend/.env` con los valores reales de la base de datos:

```env
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_SCHEMA=reto_a

# CORS – debe coincidir con la URL del frontend en desarrollo
CORS_ORIGIN=http://localhost:5173

# Rate limiting (15 min, 100 requests)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Configuración del frontend

### 1. Instalar dependencias

```bash
cd src/frontend
npm install
```

El proxy de Vite (`vite.config.js`) redirige `/api/*` → `http://localhost:3001` automáticamente en desarrollo.  
No se requiere configuración adicional.

---

## Ejecutar la aplicación

Abrir **dos terminales** en paralelo:

### Terminal 1 — Backend

```bash
cd src/backend
npm run dev
```

El servidor queda escuchando en `http://localhost:3001`.  
Endpoint de salud: `GET http://localhost:3001/health`

### Terminal 2 — Frontend

```bash
cd src/frontend
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## Estructura del proyecto

```
src/
├── mockups_aichallenge.sql        # Script de creación de schema y datos mockup
├── plan.md                        # Caso de uso y criterios de aceptación
├── backend/
│   ├── .env.example               # Variables de entorno (template)
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── database.js        # Pool de conexiones PostgreSQL
│       │   └── env.js             # Validación de variables de entorno
│       ├── repositories/
│       │   └── initiativesRepository.js   # Capa de acceso a datos (SQL)
│       ├── services/
│       │   └── initiativesService.js      # Lógica de negocio y validaciones
│       ├── controllers/
│       │   └── initiativesController.js   # Handlers HTTP
│       ├── middlewares/
│       │   ├── validate.js                # Reglas express-validator
│       │   └── errorHandler.js            # Manejo centralizado de errores
│       ├── routes/
│       │   └── initiatives.js             # Router Express
│       ├── app.js                         # Setup Express (Helmet, CORS, rate-limit)
│       └── server.js                      # Bootstrap y graceful shutdown
└── frontend/
    ├── vite.config.js             # Proxy /api → localhost:3001
    ├── index.html
    └── src/
        ├── App.jsx                # Routing (React Router)
        ├── context/
        │   └── InitiativesContext.jsx     # Estado global (useReducer)
        ├── services/
        │   └── initiativesService.js      # Axios – cliente HTTP
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatsCards.jsx             # Cards de contadores por estado
        │   ├── InitiativesTable.jsx       # Tabla con overdue highlight
        │   ├── InitiativeForm.jsx         # Formulario crear/editar
        │   └── StatusBadge.jsx            # Badges de estado y prioridad
        └── pages/
            ├── Dashboard.jsx              # Vista principal con filtros
            ├── NewInitiative.jsx          # Formulario nueva iniciativa
            └── EditInitiative.jsx         # Formulario editar iniciativa
```

---

## API Reference

Base URL: `http://localhost:3001/api`

| Método | Ruta                      | Descripción                                |
|--------|---------------------------|--------------------------------------------|
| GET    | `/health`                 | Health check del servidor                  |
| GET    | `/initiatives`            | Listar todas las iniciativas (paginación)  |
| GET    | `/initiatives/stats`      | Contadores por estado                      |
| GET    | `/initiatives/:id`        | Obtener una iniciativa por ID              |
| POST   | `/initiatives`            | Crear una nueva iniciativa                 |
| PUT    | `/initiatives/:id`        | Actualizar una iniciativa existente        |
| DELETE | `/initiatives/:id`        | Eliminar una iniciativa                    |

### Query params (GET /initiatives)

| Parámetro | Tipo    | Descripción                                          |
|-----------|---------|------------------------------------------------------|
| `status`  | string  | Filtrar por estado: `Pendiente`, `En curso`, `Completado` |
| `limit`   | integer | Máximo de registros a devolver (default: 100, max: 200) |
| `offset`  | integer | Desplazamiento para paginación (default: 0)         |

### Payload POST/PUT

```json
{
  "name": "Nombre de la iniciativa",
  "responsible": "Nombre del responsable",
  "status": "Pendiente",
  "deadline": "2026-12-31",
  "priority": "Alta",
  "description": "Descripción opcional"
}
```

**Valores válidos:**
- `status`: `Pendiente` | `En curso` | `Completado`
- `priority`: `Alta` | `Media` | `Baja`
- `deadline`: formato ISO 8601 (`YYYY-MM-DD`)

---

## Decisiones técnicas y seguridad

### Backend

- **Arquitectura en capas**: config → repository → service → controller → route  
  Cumple con SOLID (Single Responsibility, Dependency Inversion).
- **OWASP A01 – Broken Access Control**: endpoints protegidos por rate limiting y validación estricta de parámetros.
- **OWASP A03 – Injection**: todas las queries usan parámetros posicionales (`$1`, `$2`…); nunca interpolación de strings.
- **OWASP A04 – Insecure Design**: payload limit de 10 KB; rate limit 100 req / 15 min.
- **OWASP A05 – Security Misconfiguration**: Helmet configura headers HTTP seguros; `X-Powered-By` deshabilitado.
- **OWASP A09 – Logging**: errores de servidor logueados en consola sin exponer stack trace al cliente en producción.
- **Anti-corruption layer**: el repositorio aliasa columnas en español (`nombre`, `fecha_limite`…) a inglés (`name`, `deadline`…), aislando el schema de BD del dominio de la aplicación.

### Frontend

- **Estado global con `useReducer`** en lugar de Redux, suficiente para el alcance del dominio.
- **CSS Modules** para estilos completamente encapsulados por componente.
- **Proxy Vite** evita CORS en desarrollo; en producción el frontend debe servirse desde el mismo origen o configurar el CORS adecuadamente.
- **Sin sessionStorage / localStorage**: los datos persisten exclusivamente en PostgreSQL; F5 recarga desde la BD.
