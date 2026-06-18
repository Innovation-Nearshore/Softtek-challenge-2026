# Gestor de Solicitudes Internas

Aplicación web para crear, gestionar y hacer seguimiento de solicitudes internas (soporte, aprobaciones, requerimientos).

**Stack:** React + Tailwind CSS · Node.js + Express · PostgreSQL

---

## Prerrequisitos

| Software   | Versión mínima recomendada |
|------------|---------------------------|
| Node.js    | 18.x o superior           |
| npm        | 9.x o superior            |
| PostgreSQL | 14.x o superior           |

Asegúrese de que PostgreSQL esté corriendo y que la base de datos `ai_challenge` exista con el schema `reto_c` y sus tablas ya inicializadas (ver sección **Base de datos**).

---

## Base de datos

La base de datos debe estar corriendo localmente **antes** de iniciar el backend.

1. Acceda a su instancia de PostgreSQL.
2. Cree la base de datos si no existe:
   ```sql
   CREATE DATABASE ai_challenge;
   ```
3. Ejecute el script de inicialización para crear el schema y las tablas:
   ```bash
   psql -U postgres -d ai_challenge -f mockups_aichallenge.sql
   ```
   > El archivo `mockups_aichallenge.sql` se encuentra en la raíz del repositorio.

---

## Variables de entorno

### Backend — `backend/.env`

Copie el archivo de ejemplo y complete los valores:

```bash
cp backend/.env.example backend/.env
```

| Variable          | Descripción                                                   | Valor por defecto                              |
|-------------------|---------------------------------------------------------------|------------------------------------------------|
| `DB_HOST`         | Host del servidor PostgreSQL                                  | `localhost`                                    |
| `DB_PORT`         | Puerto de PostgreSQL                                          | `5432`                                         |
| `DB_NAME`         | Nombre de la base de datos                                    | `ai_challenge`                                 |
| `DB_USER`         | Usuario de PostgreSQL                                         | `postgres`                                     |
| `DB_PASSWORD`     | Contraseña del usuario de PostgreSQL                          | *(completar)*                                  |
| `DB_SCHEMA`       | Schema de la base de datos                                    | `reto_c`                                       |
| `PORT`            | Puerto en el que escucha el servidor backend                  | `3001`                                         |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS (separados por coma)            | `http://localhost:5173,http://localhost:4173`   |

**Ejemplo completo:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_challenge
DB_USER=postgres
DB_PASSWORD=Admin123
DB_SCHEMA=reto_c
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:4173
```

---

### Frontend — `frontend/.env`

Copie el archivo de ejemplo:

```bash
cp frontend/.env.example frontend/.env
```

| Variable       | Descripción                          | Valor por defecto              |
|----------------|--------------------------------------|-------------------------------|
| `VITE_API_URL` | URL base de la API del backend       | `http://localhost:3001/api`   |

**Ejemplo:**
```env
VITE_API_URL=http://localhost:3001/api
```

> Si el backend corre en un puerto diferente al `3001`, actualice este valor.

---

## Instalación de dependencias

Instale las dependencias del backend y del frontend por separado:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Ejecución local

Abra **dos terminales** distintas.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

El servidor quedará disponible en: **http://localhost:3001**

Para verificar que está corriendo: **http://localhost:3001/api/health**

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

La aplicación quedará disponible en: **http://localhost:5173**

> Si Vite asigna automáticamente el puerto `5174` (porque el `5173` está ocupado), agregue `http://localhost:5174` a `ALLOWED_ORIGINS` en `backend/.env`.

---

## Resumen rápido (copy-paste)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Softtek-challenge-2026

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar backend/.env con la contraseña de PostgreSQL

# 3. Inicializar la base de datos (si aún no está creada)
psql -U postgres -d ai_challenge -f mockups_aichallenge.sql

# 4. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 5. Iniciar el backend (Terminal 1)
cd ../backend && npm run dev

# 6. Iniciar el frontend (Terminal 2)
cd ../frontend && npm run dev
```

Abrir en el navegador: **http://localhost:5173**

---

## Endpoints principales de la API

| Método | Ruta                              | Descripción                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/api/health`                     | Verificación de estado del servidor      |
| GET    | `/api/areas`                      | Lista de áreas                           |
| GET    | `/api/tipos-solicitud`            | Lista de tipos de solicitud              |
| GET    | `/api/solicitudes`                | Lista paginada de solicitudes            |
| POST   | `/api/solicitudes`                | Crear nueva solicitud                    |
| PATCH  | `/api/solicitudes/:id/estado`     | Actualizar estado de una solicitud       |
| GET    | `/api/solicitudes/:id/historial`  | Historial de cambios de una solicitud    |
| GET    | `/api/metrics`                    | Métricas agregadas por estado y urgencia |
