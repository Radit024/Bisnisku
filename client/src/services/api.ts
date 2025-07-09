/**
 * Base API service with common functionality
 */

import { QueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private baseUrl: string;
  private queryClient: QueryClient;

  constructor(baseUrl: string = '', queryClient: QueryClient) {
    this.baseUrl = baseUrl;
    this.queryClient = queryClient;
  }

  private async throwIfResNotOk(res: Response): Promise<void> {
    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new ApiError(`${res.status}: ${text}`, res.status, res);
    }
  }

  private getFullUrl(path: string): string {
    const url = path.startsWith('/api/') 
      ? `${this.baseUrl}${path}` 
      : `${this.baseUrl}/api/${path.replace(/^\//, "")}`;
    return url;
  }

  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(path);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    await this.throwIfResNotOk(response);
    return response.json();
  }

  async post<T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    await this.throwIfResNotOk(response);
    return response.json();
  }

  async put<T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(path);
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    await this.throwIfResNotOk(response);
    return response.json();
  }

  async patch<T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(path);
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    await this.throwIfResNotOk(response);
    return response.json();
  }

  async delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    await this.throwIfResNotOk(response);
    return response.json();
  }

  invalidateQueries(queryKey: string | string[]): void {
    this.queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  }

  setQueryData<T>(queryKey: string | string[], data: T): void {
    this.queryClient.setQueryData(Array.isArray(queryKey) ? queryKey : [queryKey], data);
  }
}