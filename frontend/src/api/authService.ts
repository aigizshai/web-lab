// src/api/authService.ts
import axiosInstance from './axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/event';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<void> => {
    await axiosInstance.post('/auth/register', data);
  },
  
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};