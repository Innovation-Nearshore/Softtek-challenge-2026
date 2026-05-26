# Gestor de Solicitudes Internas

Aplicación web full-stack para crear, gestionar y hacer seguimiento de solicitudes internas (soporte, aprobaciones, requerimientos). Aplica a RRHH, TI, Operaciones y Finanzas.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Configuración del Backend](#configuración-del-backend)
- [Configuración del Frontend](#configuración-del-frontend)
- [Variables de entorno](#variables-de-entorno)
- [Ejecutar en desarrollo](#ejecutar-en-desarrollo)
- [Endpoints de la API](#endpoints-de-la-api)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción general

| Módulo | Descripción |
|--------|-------------|
| **Módulo 1 — Bandeja de Solicitudes** | Tabla con todas las solicitudes, filtros por tipo y urgencia, cambio de estado inline |
| **Módulo 2 — Formulario de Solicitud** | Modal/Popup con validaciones para crear nuevas solicitudes |

---

## Arquitectura

```
Prueba C/
├── Frontend/   # React + Vite + Tailwind CSS  (puerto 5173)
└── Backend/    # Node.js + Express.js          (puerto 3001)
```

El frontend consume la API REST del backend. En desarrollo, Vite tiene configurado un proxy que redirige `/api/*` → `http://localhost:3001`.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18 LTS         |
| npm         | 9+             |
| PostgreSQL   | 14+            |

---

## Configuración del Backend

### 1. Instalar dependencias

```bash
cd "Prueba C/Backend"
npm install
```

### 2. Configurar variables de entorno

Copie el archivo de ejemplo y complete los valores:

```bash
cp .env.example .env
```

Edite `.env` con los valores correctos (ver sección [Variables de entorno](#variables-de-entorno)).

### 3. Base de datos

Las tablas ya existen en la base de datos. El esquema utilizado es `reto_c` dentro de la base `ai_challenge`.

Tablas:
- `reto_c.requests` — solicitudes principales
- `reto_c.request_history` — historial de cambios de estado

---

## Configuración del Frontend

### 1. Instalar dependencias

```bash
cd "Prueba C/Frontend"
npm install
```

### 2. (Opcional) Ajustar URL del backend

Si el backend corre en un puerto distinto a `3001`, edite `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // ← cambiar aquí
    changeOrigin: true,
  },
},
```

---

## Variables de entorno

### Backend — `Prueba C/Backend/.env`

| Variable       | Descripción                          | Valor por defecto |
|----------------|--------------------------------------|-------------------|
| `PORT`         | Puerto en que escucha el servidor     | `3001`            |
| `DB_HOST`      | Host del servidor PostgreSQL          | `localhost`       |
| `DB_PORT`      | Puerto de PostgreSQL                  | `5432`            |
| `DB_NAME`      | Nombre de la base de datos            | `ai_challenge`    |
| `DB_SCHEMA`    | Esquema de PostgreSQL                 | `reto_c`          |
| `DB_USER`      | Usuario de PostgreSQL                 | `postgres`        |
| `DB_PASSWORD`  | Contraseña de PostgreSQL              | *(requerida)*     |
| `CORS_ORIGINS` | Orígenes permitidos por CORS (CSV)   | `http://localhost:5173` |
| `NODE_ENV`     | Entorno de ejecución                  | `development`     |

> **Nota:** El archivo `.env` está en `.gitignore` y nunca debe ser commiteado.

---

## Ejecutar en desarrollo

Abra **dos terminales** (una para cada servicio):

### Terminal 1 — Backend

```bash
cd "Prueba C/Backend"
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`
Health check: `GET http://localhost:3001/api/health`

### Terminal 2 — Frontend

```bash
cd "Prueba C/Frontend"
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## Endpoints de la API

Base URL: `http://localhost:3001/api`

| Método   | Ruta                          | Descripción                                    |
|----------|-------------------------------|------------------------------------------------|
| `GET`    | `/health`                     | Health check del servidor                      |
| `GET`    | `/requests`                   | Listar solicitudes (filtros: `type`, `urgency`) |
| `GET`    | `/requests/:id`               | Obtener una solicitud por ID                   |
| `POST`   | `/requests`                   | Crear una nueva solicitud                      |
| `PATCH`  | `/requests/:id/status`        | Actualizar estado (registra en historial)      |
| `DELETE` | `/requests/:id`               | Eliminar una solicitud                         |
| `DELETE` | `/requests`                   | Eliminar todas las solicitudes                 |

### Ejemplo — Crear solicitud (`POST /api/requests`)

```json
{
  "type": "Soporte TI",
  "urgency": "Alta",
  "description": "El equipo no enciende desde ayer por la mañana.",
  "requester": "Juan Pérez",
  "area": "TI"
}
```

### Ejemplo — Cambiar estado (`PATCH /api/requests/1/status`)

```json
{
  "status": "En revisión"
}
```

---

## Estructura del proyecto

```
Prueba C/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Pool de conexión PostgreSQL
│   │   ├── controllers/
│   │   │   └── requestsController.js # Lógica de negocio
│   │   ├── routes/
│   │   │   └── requests.js          # Definición de rutas
│   │   └── server.js                # Configuración Express
│   ├── .env.example                 # Plantilla de variables de entorno
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── RequestsTable.jsx     # Módulo 1 — Bandeja
    │   │   └── RequestFormModal.jsx  # Módulo 2 — Formulario popup
    │   ├── constants/
    │   │   └── index.js             # Tipos, urgencias, áreas, estados
    │   ├── hooks/
    │   │   └── useRequests.js       # Hook de estado y llamadas API
    │   ├── services/
    │   │   └── requestsService.js   # Capa HTTP (axios)
    │   ├── App.jsx                  # Componente raíz
    │   ├── main.jsx                 # Punto de entrada React
    │   └── index.css                # Estilos globales + Tailwind
    ├── index.html
    └── package.json
```

---

## Tecnologías utilizadas

**Frontend**
- [React 18](https://react.dev/) — UI
- [Vite 5](https://vitejs.dev/) — bundler y servidor de desarrollo
- [Tailwind CSS 3](https://tailwindcss.com/) — estilos
- [Axios](https://axios-http.com/) — cliente HTTP

**Backend**
- [Node.js 18+](https://nodejs.org/) — entorno de ejecución
- [Express.js 4](https://expressjs.com/) — framework web
- [node-postgres (pg)](https://node-postgres.com/) — cliente PostgreSQL
- [Helmet](https://helmetjs.github.io/) — cabeceras de seguridad HTTP
- [Morgan](https://github.com/expressjs/morgan) — logging de peticiones
- [CORS](https://github.com/expressjs/cors) — control de orígenes
- [dotenv](https://github.com/motdotla/dotenv) — gestión de variables de entorno
