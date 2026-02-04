// src/types/event.ts
export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    category: string;
    location: string;
    createdBy: number;
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
  }