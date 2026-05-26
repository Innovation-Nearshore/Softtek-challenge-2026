# Backend Architecture

## Layered Architecture Pattern

The backend follows a clean, layered architecture pattern to ensure separation of concerns and maintainability.

```
┌─────────────────────────────────────┐
│   HTTP Request (Express Routes)     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Controllers Layer                 │
│   (Request/Response Handling)       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Services Layer                    │
│   (Business Logic)                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Models/Repositories Layer         │
│   (Database Interaction)            │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   PostgreSQL Database               │
│   (reto_c schema)                   │
└─────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Routes Layer (`src/routes/`)

**Purpose**: Define API endpoint paths and HTTP methods, map requests to controllers.

**Key Files**:
- `healthRoutes.ts`: Health check endpoints
- `{entity}Routes.ts`: Feature-specific routes

**Responsibilities**:
- Define REST endpoints (GET, POST, PUT, DELETE, PATCH)
- Validate request structure at route level
- Map HTTP methods to controller functions
- Apply middleware specific to routes

**Example**:
```typescript
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', delete);
```

### 2. Controllers Layer (`src/controllers/`)

**Purpose**: Handle HTTP requests and responses, orchestrate request/response lifecycle.

**Key Files**:
- `BaseController.ts`: Abstract base with common CRUD operations
- `healthController.ts`: Health check controller
- `{entity}Controller.ts`: Feature-specific controllers

**Responsibilities**:
- Parse request parameters, query strings, and body
- Call appropriate service methods
- Format and send responses using utility functions
- Handle HTTP status codes
- Validate input before passing to services

**Example**:
```typescript
async create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const data = req.body;
  const result = await this.service.create(data);
  sendSuccess(res, result, 201);
}
```

### 3. Services Layer (`src/services/`)

**Purpose**: Implement business logic, orchestrate operations, validate business rules.

**Key Files**:
- `BaseService.ts`: Abstract base with common CRUD logic
- `{entity}Service.ts`: Feature-specific business logic

**Responsibilities**:
- Implement all business logic
- Validate business rules
- Orchestrate operations across repositories
- Handle data transformation
- Manage transaction-like operations

**Example**:
```typescript
async create(data: CreateUserDto): Promise<User> {
  // Validate business rules
  if (await this.userExists(data.email)) {
    throw new Error('Email already exists');
  }
  
  // Delegate to repository
  return this.repository.create(data);
}
```

### 4. Models/Repositories Layer (`src/models/`)

**Purpose**: Abstract database interactions, provide data access patterns.

**Key Files**:
- `BaseRepository.ts`: Abstract base with common CRUD operations
- `{entity}Repository.ts`: Feature-specific database queries

**Responsibilities**:
- Execute database queries
- Map database results to TypeScript types
- Handle query construction
- Implement data access patterns
- Manage database connections

**Example**:
```typescript
async create(data: CreateUserData): Promise<User> {
  const id = uuid();
  const sql = `
    INSERT INTO reto_c.users (id, email, name, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await query(sql, [id, data.email, data.name, now, now]);
  return result.rows[0];
}
```

## Type Safety with TypeScript

### Base Interfaces

Located in `src/types/index.ts`:

```typescript
// API Response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

// Base entity interface
interface DatabaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Entity Definition Pattern

All entities should extend `DatabaseEntity`:

```typescript
interface User extends DatabaseEntity {
  email: string;
  name: string;
  // ... other fields
}
```

## Data Flow Example: Creating a User

```
POST /api/users
  │
  ├─► Routes Layer (userRoutes.ts)
  │   └─► Extract body data
  │
  ├─► Controllers Layer (UserController)
  │   ├─► Receive request
  │   ├─► Validate input
  │   └─► Call service.create()
  │
  ├─► Services Layer (UserService)
  │   ├─► Validate business rules
  │   ├─► Check for duplicates
  │   └─► Call repository.create()
  │
  ├─► Repositories Layer (UserRepository)
  │   ├─► Build SQL query
  │   ├─► Execute query
  │   └─► Return typed result
  │
  └─► Response sent back to client
      with proper status code and format
```

## Error Handling

### Error Flow

1. **Repository Layer**: Throws database errors
2. **Service Layer**: Catches and transforms to business errors
3. **Controller Layer**: Catches and formats as HTTP responses
4. **Middleware**: Global error handler catches unhandled errors

### Custom Error Class

```typescript
// In middlewares/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: Record<string, any>
  )
}
```

## Middleware Pipeline

```
Request
  │
  ├─► Body Parser (express.json)
  ├─► CORS Middleware
  ├─► Custom Middleware
  ├─► Routes
  ├─► 404 Handler
  │
  └─► Error Handler (must be last)
```

## File Structure

```
backend/src/
├── config/
│   ├── env.ts              # Environment variables
│   ├── database.ts         # Database connection pool
│   ├── database.init.sql   # Schema initialization
│   └── database.verify.ts  # Connection verification
│
├── controllers/
│   ├── BaseController.ts   # Abstract base class
│   └── healthController.ts # Health check controller
│
├── routes/
│   └── healthRoutes.ts     # Route definitions
│
├── services/
│   └── BaseService.ts      # Abstract base class
│
├── models/
│   └── BaseRepository.ts   # Abstract base class
│
├── middlewares/
│   ├── cors.ts             # CORS configuration
│   └── errorHandler.ts     # Error handling
│
├── types/
│   └── index.ts            # TypeScript definitions
│
├── utils/
│   └── response.ts         # Response formatting
│
└── index.ts                # Application entry point
```

## Adding a New Feature

When adding a new entity/feature, follow this pattern:

1. **Create Types** (`src/types/user.ts`)
   ```typescript
   import type { DatabaseEntity } from './index';
   
   export interface User extends DatabaseEntity {
     email: string;
     name: string;
   }
   ```

2. **Create Repository** (`src/models/UserRepository.ts`)
   ```typescript
   export class UserRepository extends BaseRepository<User> {
     constructor() {
       super({ tableName: 'users' });
     }
     // Implement abstract methods
   }
   ```

3. **Create Service** (`src/services/UserService.ts`)
   ```typescript
   export class UserService extends BaseService<User, UserRepository> {
     constructor(repository: UserRepository) {
       super(repository);
     }
     // Implement business logic
   }
   ```

4. **Create Controller** (`src/controllers/UserController.ts`)
   ```typescript
   export class UserController extends BaseController<User, UserService> {
     constructor(service: UserService) {
       super(service);
     }
     // Implement request handlers
   }
   ```

5. **Create Routes** (`src/routes/userRoutes.ts`)
   ```typescript
   const router = Router();
   const repository = new UserRepository();
   const service = new UserService(repository);
   const controller = new UserController(service);
   
   router.get('/', (req, res, next) => controller.getAll(req, res, next));
   export default router;
   ```

6. **Register Routes** (`src/index.ts`)
   ```typescript
   app.use('/api/users', userRoutes);
   ```

## Database Schema Considerations

### Naming Conventions

- **Schema**: `reto_c` (provided)
- **Tables**: `snake_case` (e.g., `users`, `user_roles`)
- **Columns**: `snake_case` (e.g., `user_id`, `created_at`)
- **Indexes**: `idx_{table}_{column}` (e.g., `idx_users_email`)

### Timestamp Columns

Every entity should include:
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Primary Keys

Use UUID for distributed systems reliability:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

## Testing Strategy

### Unit Tests
- Test services with mocked repositories
- Test controllers with mocked services
- Test utility functions independently

### Integration Tests
- Test full request/response cycle
- Use test database
- Verify database state changes

### File Location
Tests live alongside implementation:
- `src/services/__tests__/UserService.test.ts`
- `src/controllers/__tests__/UserController.test.ts`

## Performance Considerations

1. **Connection Pooling**: Configured in `database.ts`
2. **Query Optimization**: Use indexes on frequently queried columns
3. **Pagination**: Implement limit/offset in repositories
4. **Caching**: Add caching layer in services when needed
5. **Monitoring**: Log slow queries (> 1000ms)
