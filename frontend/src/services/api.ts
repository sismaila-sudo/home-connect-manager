import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
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
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await this.api({
        method,
        url: endpoint,
        data,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response?.data) {
      const errorData = error.response.data as ApiResponse;
      return new Error(errorData.message || 'An error occurred');
    }
    if (error.request) {
      return new Error('Network error - please check your connection');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<ApiResponse>('POST', '/auth/login', {
      email,
      password,
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async loginWithCode(loginCode: string) {
    const response = await this.request<ApiResponse>('POST', '/auth/login-member', {
      loginCode,
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    householdName?: string;
  }) {
    const response = await this.request<ApiResponse>('POST', '/auth/register', data);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.request<ApiResponse>('GET', '/auth/me');
  }

  async refreshToken() {
    const response = await this.request<ApiResponse>('POST', '/auth/refresh');
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  logout() {
    this.removeToken();
  }

  // Household endpoints
  async getHousehold(householdId: string) {
    return this.request<ApiResponse>('GET', `/households/${householdId}`);
  }

  async getHouseholdMembers(householdId: string) {
    return this.request<ApiResponse>('GET', `/households/${householdId}/members`);
  }

  async addHouseholdMember(householdId: string, memberData: any) {
    return this.request<ApiResponse>('POST', `/households/${householdId}/members`, memberData);
  }

  async updateHouseholdMember(householdId: string, memberId: string, memberData: any) {
    return this.request<ApiResponse>('PUT', `/households/${householdId}/members/${memberId}`, memberData);
  }

  async removeHouseholdMember(householdId: string, memberId: string) {
    return this.request<ApiResponse>('DELETE', `/households/${householdId}/members/${memberId}`);
  }

  async updateHouseholdSettings(householdId: string, settings: any) {
    return this.request<ApiResponse>('PUT', `/households/${householdId}/settings`, settings);
  }

  async getDashboardData(householdId: string) {
    return this.request<ApiResponse>('GET', `/households/${householdId}/dashboard`);
  }

  // Task endpoints
  async getTasks(householdId: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<ApiResponse>('GET', `/tasks/${householdId}${queryString}`);
  }

  async getTask(householdId: string, taskId: string) {
    return this.request<ApiResponse>('GET', `/tasks/${householdId}/${taskId}`);
  }

  async createTask(householdId: string, taskData: any) {
    return this.request<ApiResponse>('POST', `/tasks/${householdId}`, taskData);
  }

  async updateTask(householdId: string, taskId: string, taskData: any) {
    return this.request<ApiResponse>('PUT', `/tasks/${householdId}/${taskId}`, taskData);
  }

  async deleteTask(householdId: string, taskId: string) {
    return this.request<ApiResponse>('DELETE', `/tasks/${householdId}/${taskId}`);
  }

  async getTaskCategories(householdId: string) {
    return this.request<ApiResponse>('GET', `/tasks/${householdId}/categories`);
  }

  async getTaskTemplates(householdId: string) {
    return this.request<ApiResponse>('GET', `/tasks/${householdId}/templates`);
  }

  async getTaskStatistics(householdId: string, period?: string) {
    const queryString = period ? `?period=${period}` : '';
    return this.request<ApiResponse>('GET', `/tasks/${householdId}/statistics${queryString}`);
  }

  // Recipe endpoints
  async getRecipes(householdId: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<ApiResponse>('GET', `/recipes/${householdId}${queryString}`);
  }

  // Shopping endpoints
  async getShoppingLists(householdId: string) {
    return this.request<ApiResponse>('GET', `/shopping/${householdId}/lists`);
  }

  // Budget endpoints
  async getBudgets(householdId: string) {
    return this.request<ApiResponse>('GET', `/budgets/${householdId}`);
  }

  // Report endpoints
  async getReports(householdId: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<ApiResponse>('GET', `/reports/${householdId}${queryString}`);
  }

  // Notification endpoints
  async getNotifications(householdId: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<ApiResponse>('GET', `/notifications/${householdId}${queryString}`);
  }

  async markNotificationAsRead(householdId: string, notificationId: string) {
    return this.request<ApiResponse>('PUT', `/notifications/${householdId}/${notificationId}/read`);
  }

  // File upload
  async uploadFile(file: File, endpoint: string = '/upload') {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export const apiService = new ApiService();
export default apiService;