// Re-export API types from api.ts
export type { ApiResponse, PaginationInfo, PaginatedApiResponse, HttpMethod, ApiError } from './api';

// Example entity types that can be shared with backend
// These should match the backend types exactly for type safety

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Add domain-specific types here as your application grows
// Example:
// export interface User extends BaseEntity {
//   email: string;
//   name: string;
// }

// Request/Response DTOs
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
