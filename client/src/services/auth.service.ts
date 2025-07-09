/**
 * Authentication service
 */

import { ApiService } from './api';
import { queryClient } from '@/lib/queryClient';
import type { User } from '@/types';

class AuthService extends ApiService {
  constructor() {
    super(import.meta.env.VITE_API_URL || '', queryClient);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
    return this.get<User>(`/auth/user/${firebaseUid}`);
  }

  async createUser(userData: {
    firebaseUid: string;
    email: string;
    name: string;
  }): Promise<User> {
    return this.post<User>('/auth/register', userData);
  }

  async updateUserProfile(userId: number, userData: Partial<User>): Promise<User> {
    return this.patch<User>(`/auth/user/${userId}`, userData);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.get<User>('/auth/me');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        return null;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
    this.invalidateQueries(['auth']);
  }

  // Cache management
  invalidateAuthCache(): void {
    this.invalidateQueries(['auth']);
  }

  setUserCache(user: User): void {
    this.setQueryData(['auth', 'user'], user);
  }
}

export const authService = new AuthService();