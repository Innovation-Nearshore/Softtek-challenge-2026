/// <reference types="vite/client" />
import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          statusCode: error.response?.status,
        };

        if (error.response?.data?.error) {
          apiError.message = error.response.data.error.message;
          apiError.code = error.response.data.error.code;
          apiError.details = error.response.data.error.details;
        } else if (error.message) {
          apiError.message = error.message;
        }

        return Promise.reject(apiError);
      }
    );
  }

  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axiosInstance.get<unknown, AxiosResponse<ApiResponse<T>>>(url, {
      params,
    });
    return response.data.data as T;
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.post<unknown, AxiosResponse<ApiResponse<T>>>(url, data);
    return response.data.data as T;
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<unknown, AxiosResponse<ApiResponse<T>>>(url, data);
    return response.data.data as T;
  }

  async patch<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.patch<unknown, AxiosResponse<ApiResponse<T>>>(
      url,
      data
    );
    return response.data.data as T;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<unknown, AxiosResponse<ApiResponse<T>>>(url);
    return response.data.data as T;
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

export const apiClient = new ApiClient();
