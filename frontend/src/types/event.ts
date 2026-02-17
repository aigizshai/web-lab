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
  surname: string;
  name: string;
  patronymic: string;
  gender: 'male' | 'female';
  birthDate: string; // формат YYYY-MM-DD
  email: string;
}
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    surname: string;
    name: string;
    patronymic: string;
    gender: 'male' | 'female';
    birthDate: string;
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    name: string;
    accessToken: string;
    refreshToken: string;
    id: number;
  }