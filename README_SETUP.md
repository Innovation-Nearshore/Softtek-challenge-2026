# IA Challenge - Full Stack Application Setup Guide

## 📋 Project Overview

This is a modern full-stack web application with a React frontend, Node.js + Express backend, and PostgreSQL database. The project is designed with clean architecture principles, strong TypeScript typing, and a layered architecture pattern for maintainability and scalability.

### Quick Facts
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with reto_c schema
- **Architecture**: Layered architecture with repositories, services, and controllers
- **Type Safety**: Full TypeScript implementation with strict mode enabled
- **API Client**: Axios with request/response interceptors

## 🏗️ Project Structure

```
ia-challenge/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page-level components
│   │   ├── services/                 # API communication layer
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── context/                  # Context API providers
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── styles/                   # Global CSS (Tailwind)
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                           # Node.js + Express backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── env.ts               # Environment variables
│   │   │   ├── database.ts          # Database connection
│   │   │   ├── database.init.sql    # Schema initialization
│   │   │   └── database.verify.ts   # Connection verification
│   │   ├── controllers/              # Request handlers
│   │   │   ├── BaseController.ts
│   │   │   └── healthController.ts
│   │   ├── routes/                   # API route definitions
│   │   │   └── healthRoutes.ts
│   │   ├── services/                 # Business logic
│   │   │   └── BaseService.ts
│   │   ├── models/                   # Database access layer
│   │   │   └── BaseRepository.ts
│   │   ├── middlewares/              # Express middleware
│   │   │   ├── cors.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/                    # TypeScript definitions
│   │   │   └── index.ts
│   │   ├── utils/                    # Utility functions
│   │   │   └── response.ts
│   │   └── index.ts                  # Application entry point
│   ├── dist/                         # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── ARCHITECTURE.md
│
├── .gitignore
├── .editorconfig
├── PROJECT_ARCHITECTURE.md           # Architecture overview
├── FRONTEND_BACKEND_INTEGRATION.md   # Integration guide
└── README_SETUP.md                   # This file
```

## 🔧 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2+ | UI library |
| TypeScript | 5.3+ | Type safety |
| Vite | 5.0+ | Build tool & dev server |
| Tailwind CSS | 3.4+ | Utility-first CSS |
| React Router | 6.20+ | Client-side routing |
| Axios | 1.6+ | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 4.18+ | Web framework |
| TypeScript | 5.3+ | Type safety |
| PostgreSQL | 12+ | Relational database |
| pg | 8.11+ | PostgreSQL client |
| nodemon | 3.0+ | Development auto-reload |
| ts-node | 10.9+ | TypeScript execution |

### Database
| Component | Details |
|-----------|---------|
| Database | PostgreSQL |
| Schema | reto_c |
| Host | localhost (default) |
| Port | 5432 (default) |
| User | postgres |
| Password | Admin123 |
| Connection Pooling | 20 max connections |

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: Included with Node.js
- **PostgreSQL**: v12 or higher, running and accessible
- **Git**: For version control

### Step 1: Clone & Navigate

```bash
# Clone the repository
git clone https://github.com/Innovation-Nearshore/Softtek-challenge-2026.git
cd Softtek-challenge-2026
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with database credentials
cat > .env << EOF
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Admin123
DB_NAME=ia_challenge
DB_SCHEMA=reto_c

CORS_ORIGIN=http://localhost:5173,http://localhost:3000
API_BASE_URL=http://localhost:5000
EOF
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database (if not exists)
psql -U postgres -c "CREATE DATABASE ia_challenge;"

# Create the schema in the database
psql -U postgres -d ia_challenge -c "CREATE SCHEMA reto_c;"
```

### Step 4: Frontend Setup

```bash
# From the project root, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=IA Challenge
VITE_APP_VERSION=1.0.0
EOF
```

## 🚀 Running the Application

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════╗
║   IA Challenge Backend Server              ║
║   Version: 1.0.0                          ║
╠════════════════════════════════════════════╣
║   Environment: development                 ║
║   Port: 5000                              ║
║   Database: ia_challenge                  ║
║   Schema: reto_c                          ║
╚════════════════════════════════════════════╝

✓ Server running at http://localhost:5000
✓ API available at http://localhost:5000/api
✓ Health check: http://localhost:5000/api/health
```

**Terminal 2 - Frontend Dev Server:**

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Verify Backend Connectivity

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"data":{"status":"OK","timestamp":"...","uptime":...,"environment":"development"},"timestamp":"..."}
```

## 🔨 Available Commands

### Backend Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🗄️ Database Setup Details

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE ia_challenge;
\c ia_challenge
CREATE SCHEMA reto_c;
```

### Connection String

```
postgresql://postgres:Admin123@localhost:5432/ia_challenge
```

### Connection Pooling

The backend uses a connection pool with:
- **Max Connections**: 20
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 2 seconds

### Schema Initialization

Tables are created dynamically by the application as needed. To manually initialize the schema, execute:

```bash
psql -U postgres -d ia_challenge -f backend/src/config/database.init.sql
```

## 🔐 Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Application environment |
| PORT | 5000 | Server port |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_USER | postgres | Database user |
| DB_PASSWORD | Admin123 | Database password |
| DB_NAME | ia_challenge | Database name |
| DB_SCHEMA | reto_c | Schema name |
| CORS_ORIGIN | http://localhost:5173 | Allowed CORS origins |
| API_BASE_URL | http://localhost:5000 | API base URL |

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Application environment |
| VITE_API_BASE_URL | http://localhost:5000/api | Backend API URL |
| VITE_APP_NAME | IA Challenge | Application name |
| VITE_APP_VERSION | 1.0.0 | Application version |

## 📝 API Documentation

### Health Check Endpoint

**GET** `/api/health`

Response:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 123.456,
    "environment": "development"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Standard Response Format

All API responses follow this format:

**Success (2xx)**:
```json
{
  "success": true,
  "data": { /* resource data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error (4xx, 5xx)**:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { /* optional details */ }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏗️ Architecture Overview

### Layered Architecture

```
Request → Routes → Controllers → Services → Repositories → Database
Response ← Response Utilities ← Error Handler Middleware
```

### Data Flow Example

1. **Route**: Receives HTTP request at `/api/users`
2. **Controller**: Parses request, validates input
3. **Service**: Implements business logic
4. **Repository**: Executes database queries
5. **Database**: Returns data
6. **Response**: Formatted response sent to client

### Type Safety

All layers use TypeScript with:
- Strict mode enabled
- No implicit any
- Full type coverage
- Strict null checks
- Type-only imports using `import type`

## 🔄 Frontend-Backend Communication

### API Client Configuration

The frontend uses Axios with:
- **Base URL**: `http://localhost:5000/api`
- **Timeout**: 10 seconds
- **Request Interceptors**: Auto-adds auth token
- **Response Interceptors**: Transforms responses and errors

### Authentication

```typescript
// Set token after login
apiClient.setAuthToken('your-token');

// Remove token on logout
apiClient.removeAuthToken();

// Token is automatically included in all requests
// Authorization: Bearer <token>
```

### Making API Calls

```typescript
import { apiClient } from '@services/api';

// Simple GET
const data = await apiClient.get('/endpoint');

// GET with parameters
const data = await apiClient.get('/endpoint', { page: 1 });

// POST
const result = await apiClient.post('/endpoint', { data: 'value' });

// PUT/PATCH/DELETE
await apiClient.put('/endpoint/id', { updated: 'data' });
await apiClient.delete('/endpoint/id');
```

## 🧪 Testing & Quality Assurance

### Type Checking

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run type-check
```

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

### Manual Testing

Use **Insomnia** or **Postman** to test API endpoints:

1. Import collection or manually create requests
2. Set base URL to `http://localhost:5000/api`
3. Test endpoints with various HTTP methods
4. Verify response format and status codes

## 📚 Adding New Features

### Step-by-Step Guide

1. **Define Backend Types** (`backend/src/types/entity.ts`)
2. **Create Repository** (`backend/src/models/EntityRepository.ts`)
3. **Create Service** (`backend/src/services/EntityService.ts`)
4. **Create Controller** (`backend/src/controllers/EntityController.ts`)
5. **Define Routes** (`backend/src/routes/entityRoutes.ts`)
6. **Register Routes** (in `backend/src/index.ts`)
7. **Create Frontend Types** (`frontend/src/types/entity.ts`)
8. **Create API Service** (`frontend/src/services/entityApi.ts`)
9. **Create Custom Hook** (`frontend/src/hooks/useEntity.ts`)
10. **Create Components** (`frontend/src/components/Entity*.tsx`)

See `FRONTEND_BACKEND_INTEGRATION.md` for detailed examples.

## 📦 Building for Production

### Backend Build

```bash
cd backend

# Build TypeScript
npm run build

# Run production server
npm start
```

### Frontend Build

```bash
cd frontend

# Create optimized build
npm run build

# Output in dist/ folder ready for deployment
```

### Production Environment Variables

Update `.env` files for production:

**Backend**:
```
NODE_ENV=production
DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=strong-password
CORS_ORIGIN=https://yourdomain.com
```

**Frontend**:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is in use
lsof -i :5000

# Check database connection
psql -U postgres -d ia_challenge -c "SELECT 1;"
```

### Database Connection Failed

```bash
# Verify PostgreSQL is running
psql -U postgres

# Check credentials
psql -U postgres -h localhost -p 5432 -d ia_challenge

# Create database if missing
createdb -U postgres ia_challenge
```

### Frontend Dev Server Not Starting

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is available
lsof -i :5173
```

### API Calls Failing

1. Verify backend is running: `curl http://localhost:5000/api/health`
2. Check CORS configuration in `backend/src/middlewares/cors.ts`
3. Verify API base URL in frontend `.env`
4. Check browser console for detailed error messages

## 📖 Documentation Files

- **PROJECT_ARCHITECTURE.md**: High-level architecture overview
- **FRONTEND_BACKEND_INTEGRATION.md**: Integration patterns and examples
- **backend/ARCHITECTURE.md**: Detailed backend architecture
- **README_SETUP.md**: This setup and operation guide

## 🔗 Useful Resources

### Official Documentation
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tools
- [Insomnia REST Client](https://insomnia.rest)
- [PostgreSQL Client](https://www.pgadmin.org)
- [Visual Studio Code](https://code.visualstudio.com)

## 📞 Support & Contact

For questions or issues:
1. Check the documentation files
2. Review the architecture guides
3. Check error messages carefully
4. Verify environment setup

## 📝 License

This project is part of the IA Challenge 2026.

---

**Last Updated**: January 2026
**Version**: 1.0.0
