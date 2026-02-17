import axiosInstance from './axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/event';


export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await axiosInstance.post('/auth/register', data);
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userId: number, data: Partial<Omit<User, 'id' | 'email'>>): Promise<User> => {
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};