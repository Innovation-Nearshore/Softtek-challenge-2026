# 🚀 Gestión de Iniciativas

Plataforma web para registrar y hacer seguimiento de iniciativas o proyectos de un área, aplicable a cualquier industria.

---

## 📋 Características

| Módulo | Descripción |
|---|---|
| **Formulario de registro** | Crear y editar iniciativas con validación obligatoria en todos los campos (Nombre, Responsable, Estado, Fecha Límite, Prioridad, Descripción) |
| **Dashboard – Tabla** | Lista de iniciativas con filtros por estado y prioridad, contadores en tiempo real y **edición inline** de Nombre y Responsable (doble clic) |
| **Dashboard – Kanban** | Tablero visual con columnas por estado; permite **arrastrar y soltar** tarjetas para cambiar el estado con actualización optimista y persistencia en BD |
| **Dashboard – Próximos vencimientos** | Vista de iniciativas con fecha límite en los próximos 7 días, con código de color por urgencia |
| **Vista dedicada de vencimientos** | Página `/proximos-vencimientos` con tabla, contador y leyenda de urgencia |
| **CRUD completo** | Crear, leer, actualizar y eliminar iniciativas |
| **Validación doble** | Frontend (tiempo real, por campo) + Backend (respuestas con `fieldErrors` por campo) |
| **Persistencia** | Datos almacenados en PostgreSQL, persisten al recargar |
| **Sin recarga de página** | Drag & drop y edición inline usan actualización optimista vía API |

---

## 🛠 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js 18 + Express 4 |
| Base de datos | PostgreSQL 14+ |
| HTTP Client | Axios |
| Estilos | CSS plano por componente |

---

## ⚙️ Requisitos Previos

- **Node.js** v18 o superior — [descargar](https://nodejs.org/)
- **npm** v9 o superior (incluido con Node.js)
- **PostgreSQL** v14 o superior en ejecución local
- Base de datos con el esquema `reto_a` y tabla `iniciativas` ya creados (ver `mockups_aichallenge.sql`)

---

## 📁 Estructura del Proyecto

```
ChallengerAI-RetoA/
├── backend/
│   ├── src/
│   │   ├── db.js                  # Pool de conexión PostgreSQL (search_path = reto_a)
│   │   ├── server.js              # Entrada Express + CORS + health check
│   │   └── routes/
│   │       └── iniciativas.js     # Rutas CRUD + stats + proximos-vencimientos
│   ├── .env                       # Variables de entorno (no commitear)
│   ├── .env.example               # Plantilla de variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx / .css
│   │   │   ├── IniciativaForm.jsx / .css   # Formulario con validación completa
│   │   │   └── KanbanBoard.jsx / .css      # Kanban con drag & drop
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx / .css        # Tabla + edición inline + Kanban + vencimientos
│   │   │   └── ProximosVencimientos.jsx / .css
│   │   ├── services/
│   │   │   └── api.js             # Capa HTTP Axios (todos los endpoints)
│   │   ├── utils/
│   │   │   └── constants.js       # Estados, prioridades, colores
│   │   ├── App.jsx                # Router principal
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── mockups_aichallenge.sql        # Esquema de referencia (NO ejecutar)
└── README.md
```

---

## 🚀 Instalación y Ejecución (< 5 minutos)

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ChallengerAI-RetoA
```

### Paso 2 — Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo `backend/.env` con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=postgres
PORT=3001
FRONTEND_URL=http://localhost:5173
```

> ⚠️ El esquema `reto_a` y la tabla `iniciativas` deben existir en la base de datos antes de iniciar el servidor. Consulta `mockups_aichallenge.sql` como referencia; **no ejecutarlo si la BD ya existe**.

Iniciar el servidor backend:

```bash
# Modo desarrollo (recarga automática)
npm run dev

# Modo producción
npm start
```

✅ El backend quedará disponible en: `http://localhost:3001`  
Verificar estado: `http://localhost:3001/health`

---

### Paso 3 — Configurar el Frontend

Abrir una **nueva terminal** y ejecutar:

```bash
cd frontend
npm install
```

Crear opcionalmente `frontend/.env` (usa `localhost:3001` por defecto):

```env
VITE_API_URL=http://localhost:3001/api
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

✅ La aplicación estará disponible en: `http://localhost:5173`

---

### Resumen rápido (ambos servicios)

```
Terminal 1:  cd backend   && npm install && npm run dev
Terminal 2:  cd frontend  && npm install && npm run dev
Navegador:   http://localhost:5173
```

---

## 🔌 API – Endpoints

Base URL: `http://localhost:3001/api`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/iniciativas` | Listar iniciativas (`?estado=` y/o `?prioridad=`) |
| `GET` | `/iniciativas/stats` | Contadores por estado + total |
| `GET` | `/iniciativas/proximos-vencimientos` | Vencen en los próximos 7 días |
| `GET` | `/iniciativas/:id` | Obtener una por ID |
| `POST` | `/iniciativas` | Crear nueva (todos los campos requeridos) |
| `PUT` | `/iniciativas/:id` | Actualizar (todos los campos requeridos) |
| `DELETE` | `/iniciativas/:id` | Eliminar |
| `GET` | `/health` | Health check |

### Cuerpo POST / PUT

```json
{
  "nombre": "Optimización de procesos",
  "responsable": "Ana García",
  "estado": "En curso",
  "fecha_limite": "2025-12-31",
  "prioridad": "Alta",
  "descripcion": "Revisión y mejora de flujos internos del área."
}
```

> Todos los campos son **obligatorios**. En caso de error de validación, la API devuelve `fieldErrors` con errores por campo:
> ```json
> { "success": false, "fieldErrors": { "nombre": "El nombre es obligatorio." } }
> ```

### Valores permitidos

| Campo | Valores |
|---|---|
| `estado` | `Pendiente`, `En curso`, `Completado` |
| `prioridad` | `Alta`, `Media`, `Baja` |

---

## 🗄️ Base de Datos

Esquema `reto_a`, tabla `iniciativas`:

```sql
id                  SERIAL PRIMARY KEY
nombre              VARCHAR   NOT NULL
responsable         VARCHAR   NOT NULL
estado              VARCHAR   NOT NULL   -- Pendiente | En curso | Completado
fecha_limite        DATE      NOT NULL
prioridad           VARCHAR   NOT NULL   -- Alta | Media | Baja
descripcion         TEXT      NOT NULL
fecha_creacion      TIMESTAMP
fecha_actualizacion TIMESTAMP
```

> ℹ️ El backend configura automáticamente `search_path = reto_a` en cada conexión.  
> ⚠️ No modificar la estructura de la base de datos.

---

## 🎨 Guía de uso rápido

### Crear una iniciativa
1. Clic en **+ Nueva Iniciativa** (navbar o dashboard)
2. Completar todos los campos marcados con `*`
3. Clic en **✅ Guardar**

### Edición inline (tabla)
- **Doble clic** sobre el nombre o responsable de cualquier fila
- Modificar el valor y presionar **Enter** para guardar o **Esc** para cancelar
- Se muestra el botón ✔ / ✖ como alternativa al teclado

### Drag & Drop Kanban
1. Cambiar a vista **🗂 Kanban** con el toggle
2. Arrastrar una tarjeta desde su columna actual
3. Soltar sobre la columna de destino (se resalta en azul)
4. El estado se actualiza en la UI inmediatamente y persiste en la BD

### Filtros
- Usar los selectores **Filtrar por Estado** y **Filtrar por Prioridad** de forma independiente o combinada
- La consulta se envía al servidor (no filtrado en cliente)

---

## 🐛 Solución de Problemas

| Problema | Solución |
|---|---|
| `Error al cargar iniciativas` | Verificar que el backend esté corriendo en `localhost:3001` |
| `CORS error` | Verificar que `FRONTEND_URL` en `backend/.env` coincida con la URL del frontend |
| `DB connection error` | Revisar credenciales en `backend/.env` y que PostgreSQL esté activo |
| `no existe la relación «iniciativas»` | Confirmar que la BD `postgres` contiene el esquema `reto_a` con la tabla `iniciativas` |
| Drag & drop no funciona | Asegurarse de arrastrar desde la tarjeta y soltar sobre el cuerpo de la columna (área azul punteada) |
| Edición inline no guarda | Verificar que el campo no esté vacío; los mensajes de error aparecen bajo el input |
| Puerto 3001 ocupado | Cambiar `PORT` en `backend/.env` y actualizar `VITE_API_URL` en `frontend/.env` |

---

## 📝 Licencia

Proyecto de demostración — ChallengerAI Reto A.
