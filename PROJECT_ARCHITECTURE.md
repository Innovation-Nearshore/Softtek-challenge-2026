# IA Challenge - Project Architecture

## 📋 Overview

This is a full-stack web application built with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL

The project follows a monorepo structure with clear separation of concerns.

## 📁 Project Structure

```
ia-challenge/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API communication layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Context API state management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── assets/          # Static assets (images, fonts, etc.)
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Root component
│   ├── public/              # Static files served directly
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts       # Vite configuration (if using Vite)
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Request/response handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models/repositories
│   │   ├── config/          # Configuration files
│   │   ├── middlewares/     # Express middleware
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── tests/               # Test files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example         # Environment variables template
│
├── .gitignore              # Git ignore rules
├── .editorconfig           # Editor configuration
├── README.md               # Main documentation
├── ARCHITECTURE.md         # This file
└── package.json            # Root package.json (if using monorepo tooling)
```

## 🔧 Technology Stack

### Frontend
- **React 18+**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Relational database
- **pg**: PostgreSQL client
- **dotenv**: Environment variables management
- **cors**: Cross-Origin Resource Sharing middleware
- **nodemon**: Auto-reload during development
- **ts-node**: Run TypeScript directly

### Database
- **PostgreSQL**: Production database
- **Schema**: `reto_c`
- **Connection Parameters**:
  - Host: localhost (default)
  - Port: 5432 (default)
  - User: postgres
  - Password: Admin123
  - Database: ia_challenge

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Installation & Setup

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the backend directory with:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Admin123
DB_NAME=ia_challenge
DB_SCHEMA=reto_c
NODE_ENV=development
PORT=5000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in the frontend directory with:
```
VITE_API_BASE_URL=http://localhost:5000/api
NODE_ENV=development
```

#### 3. Database Setup

Ensure PostgreSQL is running and the database is created:
```sql
CREATE DATABASE ia_challenge;
```

The backend will automatically initialize tables when the server starts (pending schema creation).

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The API will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The application will start on `http://localhost:5173` (default Vite port)

#### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## 📊 Architecture Layers

### Backend Architecture

1. **Routes Layer** (`src/routes/`)
   - Defines API endpoints
   - Maps HTTP methods to controller functions
   - Handles request validation

2. **Controllers Layer** (`src/controllers/`)
   - Processes HTTP requests and responses
   - Delegates business logic to services
   - Returns formatted responses

3. **Services Layer** (`src/services/`)
   - Implements business logic
   - Orchestrates operations
   - Validates business rules

4. **Models Layer** (`src/models/`)
   - Database interaction (repositories)
   - Query builders
   - Data access patterns

5. **Middleware Layer** (`src/middlewares/`)
   - Request preprocessing
   - Authentication/Authorization
   - Error handling
   - CORS configuration

### Frontend Architecture

1. **Components** (`src/components/`)
   - Presentational and container components
   - Reusable UI elements
   - Props-based and typed

2. **Pages** (`src/pages/`)
   - Full page components
   - Route-specific layouts
   - Integration of multiple components

3. **Services** (`src/services/`)
   - API client wrapper (Axios)
   - HTTP request/response handling
   - Data transformation

4. **Hooks** (`src/hooks/`)
   - Custom React hooks
   - State and side-effect logic
   - Reusable component logic

5. **Context** (`src/context/`)
   - Global state management
   - Provider setup
   - Context hooks

6. **Types** (`src/types/`)
   - TypeScript interfaces and types
   - Shared type definitions
   - API response schemas

## 🔐 Environment Variables

### Backend (.env)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_SCHEMA`: Database schema
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API base URL
- `NODE_ENV`: Environment (development/production)

## 📝 API Communication

The frontend communicates with the backend through RESTful API endpoints. All HTTP requests are made through the Axios client configured in `frontend/src/services/api.ts`.

### Base URL
- Development: `http://localhost:5000/api`
- Production: Configured via environment variables

### Request/Response Pattern
- All requests include proper headers and authentication tokens (when applicable)
- Responses follow a consistent JSON structure
- Error handling is centralized in the Axios interceptors

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

## 📦 Building & Deployment

### Backend Deployment
1. Build: `npm run build`
2. Run: `npm start` (runs compiled JavaScript)
3. Ensure PostgreSQL is accessible in production environment

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update `VITE_API_BASE_URL` environment variable for production API

## 🔄 Data Flow

```
User Browser
    ↓
React Frontend (Vite Dev Server)
    ↓
Axios HTTP Client
    ↓
Express API Server (Node.js)
    ↓
Controllers & Services
    ↓
Database Models/Repositories
    ↓
PostgreSQL Database
```

## 📚 Database Schema

The database schema (`reto_c`) will contain tables for the application's domain entities. Each table includes:
- Primary keys (id)
- Timestamps (created_at, updated_at)
- Appropriate indexes for performance
- Foreign key constraints

## 🛠️ Development Workflow

1. **Feature Branch**: Create a feature branch from `main`
2. **Development**: Make changes in frontend/backend
3. **Testing**: Run local tests before committing
4. **Build Verification**: Ensure `npm run build` succeeds
5. **Commit**: Push to feature branch
6. **Pull Request**: Create PR with description
7. **Code Review**: Peer review and approval
8. **Merge**: Merge to `main` branch

## ⚠️ Important Notes

- **Type Safety**: Always use TypeScript types, especially for API data
- **CORS**: Backend is configured to accept requests from frontend dev server
- **Sensitive Data**: Never commit `.env` files; use `.env.example` template
- **Database Credentials**: Only use provided credentials for development
- **Error Handling**: Implement comprehensive error handling in both layers

## 📞 Support

For questions or issues related to the architecture, refer to the specific layer documentation or contact the development team.
