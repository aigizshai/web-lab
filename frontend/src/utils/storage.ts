// src/utils/storage.ts
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN='refresh_token';
const USER_KEY = 'user_data';

export const storage = {
  // Токен
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN);
  },
  // Пользователь
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  getUser: (): any => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  // Очистка
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN);
  },
  
  // Проверка авторизации
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};