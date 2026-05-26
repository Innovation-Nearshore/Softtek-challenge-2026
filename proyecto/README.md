# Gestor de Solicitudes Internas

Aplicación web fullstack para gestionar solicitudes internas de una organización.  
Construida con React + Vite (frontend), Node.js + Express (backend) y PostgreSQL (base de datos).

---

## 📁 Estructura del proyecto

```
proyecto/
├── backend/
│   ├── db.js
│   ├── index.js
│   ├── routes/
│   │   └── solicitudes.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api.js
│       └── components/
│           ├── Formulario.jsx
│           ├── Tabla.jsx
│           ├── Dashboard.jsx
│           └── Detalle.jsx
└── README.md
```

---

## 🗄️ Configuración de PostgreSQL

### Requisitos

- PostgreSQL 13 o superior instalado y en ejecución.
- Un usuario con permisos para crear esquemas y tablas.

### Esquema y tablas

Conéctate a tu base de datos PostgreSQL y ejecuta los siguientes comandos SQL:

```sql
-- Crear el esquema
CREATE SCHEMA IF NOT EXISTS reto_cta;

-- Establecer el search_path
SET search_path TO reto_cta;

-- Tabla de áreas
CREATE TABLE IF NOT EXISTS reto_cta.areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tipos de solicitud
CREATE TABLE IF NOT EXISTS reto_cta.tipos_solicitud (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla principal de solicitudes
CREATE TABLE IF NOT EXISTS reto_cta.solicitudes (
    id SERIAL PRIMARY KEY,
    numero_ticket VARCHAR(50),
    tipo_solicitud_id INTEGER REFERENCES reto_cta.tipos_solicitud(id),
    area_id INTEGER REFERENCES reto_cta.areas(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    urgencia VARCHAR(20) NOT NULL CHECK (urgencia IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    solicitante VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de historial de cambios de estado
CREATE TABLE IF NOT EXISTS reto_cta.historial_solicitudes (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER REFERENCES reto_cta.solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    comentario TEXT,
    changed_by VARCHAR(150),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo para áreas
INSERT INTO reto_cta.areas (nombre) VALUES
    ('Tecnología'),
    ('Recursos Humanos'),
    ('Finanzas'),
    ('Operaciones'),
    ('Soporte')
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para tipos de solicitud
INSERT INTO reto_cta.tipos_solicitud (nombre, codigo, descripcion) VALUES
    ('Soporte Técnico', 'SOPORTE', 'Solicitudes de soporte técnico y TI'),
    ('Recurso Humano', 'RRHH', 'Solicitudes relacionadas con personal'),
    ('Compras', 'COMPRAS', 'Solicitudes de adquisición de bienes'),
    ('Infraestructura', 'INFRA', 'Solicitudes de infraestructura y facilities'),
    ('Acceso a Sistemas', 'ACCESO', 'Solicitudes de acceso a sistemas y aplicaciones')
ON CONFLICT (codigo) DO NOTHING;
```

---

## ⚙️ Variables de entorno (Backend)

Copia el archivo `.env.example` a `.env` dentro de la carpeta `backend/` y completa los valores:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con los datos de tu instancia PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
PORT=3000
```

---

## 📦 Instalación y ejecución del Backend

```bash
# Desde la raíz del proyecto
cd backend

# Instalar dependencias
npm install

# Modo desarrollo (con nodemon, reinicio automático)
npm run dev

# Modo producción
npm start
```

El servidor quedará disponible en: **http://localhost:3000**

---

## 🎨 Instalación y ejecución del Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

La aplicación quedará disponible en: **http://localhost:5173**

---

## 🔗 URLs de acceso

| Servicio       | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost:5173            |
| Backend API    | http://localhost:3000/api        |
| Health Check   | http://localhost:3000/health     |

---

## 📡 Endpoints disponibles

| Método  | Ruta                                    | Descripción                              |
|---------|-----------------------------------------|------------------------------------------|
| GET     | `/api/solicitudes`                      | Listar solicitudes (filtros: urgencia, tipo) |
| POST    | `/api/solicitudes`                      | Crear nueva solicitud                    |
| GET     | `/api/solicitudes/:id`                  | Obtener solicitud + historial            |
| PATCH   | `/api/solicitudes/:id/estado`           | Cambiar estado de solicitud              |
| GET     | `/api/solicitudes/dashboard/metrics`    | Métricas del dashboard                   |

---

## 🗺️ Vistas del Frontend

| Ruta               | Componente  | Descripción                              |
|--------------------|-------------|------------------------------------------|
| `/`                | Dashboard   | Métricas generales del sistema           |
| `/solicitudes`     | Tabla       | Listado con filtros y cambio de estado   |
| `/nueva`           | Formulario  | Crear nueva solicitud                    |
| `/solicitudes/:id` | Detalle     | Vista detallada con historial            |

---

## 🚀 Pasos de inicio rápido

1. **Configura PostgreSQL** con el schema y tablas del paso anterior.
2. **Crea el archivo `.env`** en `backend/` basado en `.env.example`.
3. **Instala dependencias del backend** y levanta el servidor:
   ```bash
   cd backend && npm install && npm run dev
   ```
4. **En otra terminal**, instala dependencias del frontend y levanta el servidor:
   ```bash
   cd frontend && npm install && npm run dev
   ```
5. **Abre** http://localhost:5173 en tu navegador.

---

## 🛠️ Tecnologías utilizadas

### Backend
- **Node.js** — entorno de ejecución
- **Express** — framework web
- **pg (node-postgres)** — cliente PostgreSQL
- **dotenv** — gestión de variables de entorno
- **cors** — soporte para Cross-Origin Resource Sharing
- **nodemon** — reinicio automático en desarrollo

### Frontend
- **React 18** — librería de interfaz de usuario
- **Vite 5** — bundler y servidor de desarrollo
- **Axios** — cliente HTTP
- **React Router DOM v6** — enrutamiento del lado del cliente

---

## 📝 Notas importantes

- El backend debe estar corriendo **antes** de iniciar el frontend para que los datos carguen correctamente.
- El frontend está configurado con un proxy en Vite: las peticiones a `/api` se redirigen automáticamente a `http://localhost:3000/api`.
- Los números de ticket se generan automáticamente con el formato: `TICK-YYYYMMDD-####`.
- El esquema de la base de datos se establece automáticamente como `reto_cta` en cada conexión del pool.
