// src/api/eventService.ts
import axiosInstance from './axios';
import type { Event } from '../types/event';

export const eventService = {
  getEvents: async (category?: string): Promise<Event[]> => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/events', { params });
    return response.data;
  },
  
  createEvent: async (data: Omit<Event, 'id'>): Promise<Event> => {
    const response = await axiosInstance.post('/events', data);
    return response.data;
  },
  
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/events/${id}`);
  }
};