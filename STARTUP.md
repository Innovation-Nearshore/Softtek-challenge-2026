# 🚀 Guía de Arranque — Softtek Challenge 2026

## Prerrequisitos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Java JDK | 17+ | `java -version` |
| Maven / mvnw | 3.8+ | incluido en `backend/mvnw.cmd` |
| Node.js | 18+ | `node -v` |
| PostgreSQL | 14+ | corriendo en `localhost:5432` |

## Base de Datos

Asegúrese de que PostgreSQL esté activo y que exista el schema `reto_c`:

```sql
CREATE SCHEMA IF NOT EXISTS reto_c;
```

Credenciales configuradas:
- **Host:** localhost:5432
- **Base de datos:** postgres
- **Schema:** reto_c
- **Usuario:** postgres
- **Contraseña:** Admin123

---

## 1️⃣ Backend — Spring Boot (Puerto 8080)

Abra una terminal en la raíz del proyecto y ejecute:

```cmd
cd backend
mvnw.cmd spring-boot:run
```

Al iniciar, el backend:
- Conecta con PostgreSQL y crea automáticamente las tablas en `reto_c`
- Siembra usuarios de prueba (solo la primera vez)
- Expone la API REST en `http://localhost:8080/api`

**Señal de éxito:** `Started BackendApplication in X.XXX seconds`

---

## 2️⃣ Frontend — React + Vite (Puerto 5173)

Abra una **segunda terminal** en la raíz del proyecto y ejecute:

```cmd
cmd /c "cd frontend && npm run dev"
```

Acceda en el navegador: **http://localhost:5173**

---

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol | Área | Acceso |
|---|---|---|---|---|
| `admin` | `admin123` | ADMIN | TI | Administración + Bandeja global |
| `consultor_ti` | `consultor123` | CONSULTOR | TI | Bandeja TI |
| `consultor_rrhh` | `consultor123` | CONSULTOR | RRHH | Bandeja RRHH |
| `consultor_ops` | `consultor123` | CONSULTOR | OPERACIONES | Bandeja Operaciones |
| `consultor_fin` | `consultor123` | CONSULTOR | FINANZAS | Bandeja Finanzas |
| `solicitante1` | `solicitante123` | SOLICITANTE | TI | Formulario de solicitud |
| `solicitante2` | `solicitante123` | SOLICITANTE | RRHH | Formulario de solicitud |

---

## 🔄 Flujo de Verificación

1. Inicie el backend primero y espere a que esté listo
2. Inicie el frontend
3. Abra `http://localhost:5173`
4. Inicie sesión con `admin` / `admin123` → redirige a `/admin`
5. Inicie sesión con `consultor_ti` / `consultor123` → redirige a `/bandeja`
6. Inicie sesión con `solicitante1` / `solicitante123` → redirige a `/solicitud`
