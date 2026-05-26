# Frontend-Backend Integration Guide

## Overview

The frontend (React + TypeScript) communicates with the backend (Express + Node.js) through RESTful APIs using Axios as the HTTP client. This document explains the integration patterns and how to add new API endpoints.

## CORS Configuration

### Backend Setup

The backend is configured to accept requests from the frontend through CORS middleware.

**File:** `backend/src/middlewares/cors.ts`

```typescript
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### Frontend Proxy

The frontend development server proxies API requests to the backend.

**File:** `frontend/vite.config.ts`

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

## API Client Setup

### Initialization

The API client is configured in `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = new ApiClient(API_BASE_URL);
```

### Request/Response Interceptors

```typescript
// Request Interceptor
- Automatically adds authorization token from localStorage
- Adds Content-Type header

// Response Interceptor
- Unwraps ApiResponse format
- Extracts error details
- Transforms errors to consistent ApiError format
```

## API Response Format

All API endpoints follow a consistent response format:

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Example",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "code": "RESOURCE_NOT_FOUND",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Using the API Client

### Basic Operations

```typescript
import { apiClient } from '@services/api';

// GET request
const user = await apiClient.get<User>('/users/123');

// GET with query parameters
const users = await apiClient.get<User[]>('/users', { page: 1, limit: 10 });

// POST request
const newUser = await apiClient.post<User>('/users', {
  email: 'user@example.com',
  name: 'John Doe',
});

// PUT request (full update)
const updatedUser = await apiClient.put<User>('/users/123', {
  email: 'newemail@example.com',
  name: 'Jane Doe',
});

// PATCH request (partial update)
const patchedUser = await apiClient.patch<User>('/users/123', {
  name: 'Jane Doe',
});

// DELETE request
await apiClient.delete('/users/123');
```

### Error Handling

```typescript
import { apiClient } from '@services/api';
import type { ApiError } from '@types/api';

try {
  const data = await apiClient.get('/users/123');
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message);
  console.error(apiError.code);
  console.error(apiError.statusCode);
}
```

### Authentication

```typescript
// Set token after login
apiClient.setAuthToken('your-auth-token');

// Remove token on logout
apiClient.removeAuthToken();
```

## Shared Types Pattern

Frontend and backend should share type definitions to ensure consistency.

### Backend Definition

**File:** `backend/src/types/user.ts`

```typescript
import type { DatabaseEntity } from './index';

export interface User extends DatabaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface CreateUserDto {
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}
```

### Frontend Definition

**File:** `frontend/src/types/user.ts`

```typescript
import type { BaseEntity } from './index';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface CreateUserDto {
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}
```

## Adding a New API Endpoint

### 1. Define Backend Types

**File:** `backend/src/types/user.ts`

```typescript
export interface User extends DatabaseEntity {
  email: string;
  name: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}
```

### 2. Create Backend Repository

**File:** `backend/src/models/UserRepository.ts`

```typescript
import { BaseRepository } from './BaseRepository';
import type { User } from '../types/user';
import { v4 as uuid } from 'uuid';
import { query } from '../config/database';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super({ tableName: 'users' });
  }

  async create(data: CreateUserDto): Promise<User> {
    const id = uuid();
    const now = new Date();
    const sql = `
      INSERT INTO ${this.getFullTableName()} (id, email, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query<User>(sql, [id, data.email, data.name, now, now]);
    return result.rows[0];
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User | null> {
    const now = new Date();
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(now);
    values.push(id);

    const sql = `
      UPDATE ${this.getFullTableName()}
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await query<User>(sql, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.getFullTableName()} WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }
}
```

### 3. Create Backend Service

**File:** `backend/src/services/UserService.ts`

```typescript
import { BaseService } from './BaseService';
import type { User, CreateUserDto } from '../types/user';
import { UserRepository } from '../models/UserRepository';

export class UserService extends BaseService<User, UserRepository> {
  constructor(repository: UserRepository) {
    super(repository);
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.repository.create(data);
    return user;
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
```

### 4. Create Backend Controller

**File:** `backend/src/controllers/UserController.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import type { User } from '../types/user';
import { UserService } from '../services/UserService';
import { sendSuccess, sendError } from '../utils/response';

export class UserController extends BaseController<User, UserService> {
  constructor(service: UserService) {
    super(service);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.service.create(req.body);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.service.update(id, req.body);
      if (!user) {
        sendError(res, 'User not found', 'RESOURCE_NOT_FOUND', 404);
        return;
      }
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);
      if (!success) {
        sendError(res, 'User not found', 'RESOURCE_NOT_FOUND', 404);
        return;
      }
      sendSuccess(res, { id }, 200);
    } catch (error) {
      next(error);
    }
  }
}
```

### 5. Create Backend Routes

**File:** `backend/src/routes/userRoutes.ts`

```typescript
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../models/UserRepository';

const router = Router();
const repository = new UserRepository();
const service = new UserService(repository);
const controller = new UserController(service);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
```

### 6. Register Routes in Main Server

**File:** `backend/src/index.ts`

```typescript
import userRoutes from './routes/userRoutes';

app.use('/api/users', userRoutes);
```

### 7. Define Frontend Types

**File:** `frontend/src/types/user.ts`

```typescript
import type { BaseEntity } from './index';

export interface User extends BaseEntity {
  email: string;
  name: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}
```

### 8. Create Frontend API Service

**File:** `frontend/src/services/userApi.ts`

```typescript
import { apiClient } from './api';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user';

export const userApi = {
  async getAll(page = 1, limit = 10) {
    return apiClient.get<User[]>('/users', { page, limit });
  },

  async getById(id: string) {
    return apiClient.get<User>(`/users/${id}`);
  },

  async create(data: CreateUserDto) {
    return apiClient.post<User>('/users', data);
  },

  async update(id: string, data: UpdateUserDto) {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/users/${id}`);
  },
};
```

### 9. Create Frontend Custom Hook

**File:** `frontend/src/hooks/useUsers.ts`

```typescript
import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user';
import type { ApiError } from '../types/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto) => {
    try {
      const newUser = await userApi.create(data);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const updateUser = async (id: string, data: UpdateUserDto) => {
    try {
      const updated = await userApi.update(id, data);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
```

### 10. Use Hook in Component

**File:** `frontend/src/pages/UsersPage.tsx`

```typescript
import React from 'react';
import { useUsers } from '../hooks/useUsers';

const UsersPage: React.FC = () => {
  const { users, loading, error, createUser, deleteUser } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
```

## Development Workflow

1. **Backend Development**: Modify backend code in `backend/src/`
2. **Type Definition**: Update types in `backend/src/types/`
3. **API Implementation**: Implement controllers, services, repositories
4. **Test Backend**: Start backend with `npm run dev` and test with Insomnia
5. **Frontend Development**: Create frontend types matching backend
6. **API Service**: Create service layer for API calls
7. **Hooks/Components**: Implement React components using custom hooks
8. **Test Integration**: Verify frontend-backend communication

## Production Deployment

### Environment Variables

**Frontend (.env.production)**:
```
VITE_API_BASE_URL=https://api.production-domain.com/api
```

**Backend (.env.production)**:
```
CORS_ORIGIN=https://production-domain.com
NODE_ENV=production
DB_HOST=production-db-host
```

### CORS for Production

Update `backend/src/middlewares/cors.ts` with production domains:

```typescript
origin: ['https://production-domain.com', 'https://www.production-domain.com']
```

## Error Handling Best Practices

1. **Validation Errors**: Return 400 with validation details
2. **Not Found**: Return 404 with RESOURCE_NOT_FOUND code
3. **Server Errors**: Return 500 with INTERNAL_ERROR code
4. **Unauthorized**: Return 401 with UNAUTHORIZED code
5. **Forbidden**: Return 403 with FORBIDDEN code

## Performance Optimization

1. **Pagination**: Use pagination for large datasets
2. **Caching**: Cache frequently accessed data on frontend
3. **Debouncing**: Debounce search and filter inputs
4. **Lazy Loading**: Load routes and components on demand
5. **Compression**: Enable gzip compression on backend
