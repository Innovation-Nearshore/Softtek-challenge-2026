# Gestión de Iniciativas — MVP

Sistema de gestión de iniciativas con formulario de registro, dashboard de datos y tablero Kanban con drag-and-drop. Construido con Node.js/Express (backend) y React/Vite (frontend), conectado a PostgreSQL.

---

## Requisitos Previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior  |
| PostgreSQL  | 14.x o superior |

---

## 1. Configuración de la Base de Datos

1. Asegúrate de que PostgreSQL esté corriendo localmente en el puerto **5432**.
2. Crea la base de datos si no existe:

```sql
CREATE DATABASE ai_challenge;
```

3. Ejecuta el script SQL de estructura de tablas:

```bash
psql -U postgres -d ai_challenge -f mockups_aichallenge.sql
```

Esto crea el esquema `reto_a` y la tabla `iniciativas` con todos sus campos.

---

## 2. Variables de Entorno (Backend)

El archivo `backend/.env` debe contener las siguientes variables. Existe una plantilla en `backend/.env.example`.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_challenge
DB_USER=postgres
DB_PASSWORD=123456
DB_SCHEMA=reto_a
PORT=4000
```

Copia la plantilla si el archivo `.env` no existe:

```bash
# Windows (PowerShell)
copy backend\.env.example backend\.env
```

---

## 3. Instalación de Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## 4. Ejecución del Proyecto

Abre **dos terminales** y ejecuta cada servicio por separado:

**Terminal 1 — Backend (API REST):**
```bash
cd backend
npm run dev
```
El servidor arrancará en: `http://localhost:4000`

Verifica que el servidor responde:
```
GET http://localhost:4000/health
```

**Terminal 2 — Frontend (React):**
```bash
cd frontend
npm run dev
```
La aplicación estará disponible en: `http://localhost:5173`

El frontend tiene un proxy configurado en `vite.config.js` que redirige `/api` a `http://localhost:4000`, evitando problemas de CORS en desarrollo.

---

## 5. Pruebas Automatizadas (Backend)

### Ejecutar todos los tests
```bash
cd backend
npm test
```

### Ejecutar tests con reporte de cobertura
```bash
cd backend
npm run test:coverage
```

El reporte se imprime directamente en la consola al finalizar. Ejemplo de salida:

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |     100 |      100 |     100 |     100 |
 controllers                |     100 |      100 |     100 |     100 |
  initiatives.controller.js |     100 |      100 |     100 |     100 |
 queries                    |     100 |      100 |     100 |     100 |
  initiatives.queries.js    |     100 |      100 |     100 |     100 |
 routes                     |     100 |      100 |     100 |     100 |
  initiatives.routes.js     |     100 |      100 |     100 |     100 |
----------------------------|---------|----------|---------|---------|
```

### Cómo interpretar el reporte

| Columna   | Significado                                              |
|-----------|----------------------------------------------------------|
| % Stmts   | Porcentaje de sentencias ejecutadas por los tests        |
| % Branch  | Porcentaje de ramas (if/else, ternarios) cubiertas       |
| % Funcs   | Porcentaje de funciones invocadas por los tests          |
| % Lines   | Porcentaje de líneas de código ejecutadas                |

- **Umbral mínimo configurado**: 50% en todas las métricas (definido en `backend/jest.config.js`).
- **Cobertura actual**: 100% en todas las métricas.
- El informe HTML detallado se genera en `backend/coverage/lcov-report/index.html`.

### Archivos de tests

| Archivo                                       | Descripción                                                        |
|-----------------------------------------------|--------------------------------------------------------------------|
| `backend/tests/initiatives.controller.test.js` | 31 tests unitarios de los 4 controladores con pool mockeado        |
| `backend/tests/initiatives.routes.test.js`     | 33 tests de integración HTTP usando supertest con pool mockeado    |

> **Nota**: Los tests no requieren conexión a PostgreSQL. El módulo `db/pool.js` es reemplazado por un mock de Jest que simula respuestas de la base de datos.

---

## 6. Referencia de Endpoints API

Base URL: `http://localhost:4000/api`

| Método  | Ruta                        | Descripción                            |
|---------|-----------------------------|----------------------------------------|
| GET     | /initiatives                | Listar iniciativas (filtros opcionales)|
| POST    | /initiatives                | Crear una nueva iniciativa             |
| PATCH   | /initiatives/:id/estado     | Actualizar el estado de una iniciativa |
| GET     | /health                     | Verificar estado del servidor          |

**Query params opcionales para GET /initiatives:**
- `estado`: `Pendiente`, `En curso` o `Completado`
- `prioridad`: `Alta`, `Media` o `Baja`

**Body para POST /initiatives:**
```json
{
  "nombre": "Migración Cloud",
  "responsable": "Ana Torres",
  "estado": "Pendiente",
  "fecha_limite": "2025-12-31",
  "prioridad": "Alta",
  "descripcion": "Migrar toda la infraestructura a AWS"
}
```

**Body para PATCH /initiatives/:id/estado:**
```json
{ "estado": "En curso" }
```

**Valores válidos:**

| Campo     | Valores aceptados                    |
|-----------|--------------------------------------|
| estado    | Pendiente, En curso, Completado      |
| prioridad | Alta, Media, Baja                    |

---

## 7. Estructura del Proyecto

```
/
├── backend/
│   ├── .env                             # Variables de entorno (no subir a git)
│   ├── .env.example                     # Plantilla de variables
│   ├── package.json
│   └── src/
│       ├── server.js                    # Punto de entrada Express
│       ├── db/
│       │   └── pool.js                  # Conexión PostgreSQL (pg.Pool)
│       ├── queries/
│       │   └── initiatives.queries.js   # Sentencias SQL
│       ├── controllers/
│       │   └── initiatives.controller.js
│       └── routes/
│           └── initiatives.routes.js
├── frontend/
│   ├── vite.config.js                   # Proxy API + config Vite
│   ├── package.json
│   └── src/
│       ├── App.jsx                      # Navegación por tabs + estado global
│       ├── services/
│       │   └── initiativesService.js    # Capa HTTP (Axios)
│       └── components/
│           ├── InitiativeForm.jsx       # Formulario de registro
│           ├── Dashboard.jsx            # Tabla, contadores, vencimientos
│           └── KanbanBoard.jsx          # Kanban con drag-and-drop
├── mockups_aichallenge.sql              # Script DDL de la base de datos
└── Libro2.csv                           # Historias de usuario de referencia
```

---

## 8. Funcionalidades

- **Registro**: Formulario para crear iniciativas con validación de campos obligatorios (nombre, responsable, fecha límite).
- **Dashboard**: Contadores numéricos por estado, filtros por estado y prioridad, tabla completa de iniciativas y lista de próximos vencimientos con resaltado por urgencia.
- **Kanban**: Tres columnas (Pendiente / En curso / Completado) con drag-and-drop que persiste el cambio de estado directamente en PostgreSQL.
