import axiosInstance from './axios';
import type { Event, CreateEventRequest } from '../types/event';

export const eventService = {
  getEvents: async (category?: string): Promise<Event[]> => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/events', { params });
    return response.data;
  },
  
  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const response = await axiosInstance.post('/events', data);
    return response.data;
  },
  
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/events/${id}`);
  },

  updateEvent: async (id: number, data: Partial<CreateEventRequest>): Promise<Event> => {
    const response = await axiosInstance.put(`/events/${id}`, data);
    return response.data;
  },

  getEventsByUser: async (userId: number): Promise<Event[]> => {
    const response = await axiosInstance.get(`/users/${userId}/events`);
    return response.data;
  }
};
