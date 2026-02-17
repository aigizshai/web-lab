// src/types/event.ts
export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    category: EventCategory;
    location: string;
    createdBy: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }
  export interface CreateEventRequest {
    title: string;
    description: string;
    date: string;
    category: string;
    location: string;
    createdBy: number;
  }
  export type EventCategory = 
  | 'встреча'
  | 'день рождения'
  | 'праздник'
  | 'концерт'
  | 'лекция'
  | 'выставка'
  | 'другое'
  | 'all';

export interface EventFilters {
  category?: EventCategory | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
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
    name: string;
    accessToken: string;
    refreshToken: string;
    id: number;
  }