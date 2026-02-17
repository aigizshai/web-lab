import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { eventService } from '../../api/eventService';
import type { Event, EventFilters } from '../../types/event';

interface EventsState {
  items: Event[];
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;
  selectedEventId: number | null;
}

const initialState: EventsState = {
  items: [],
  filters: { category: 'all', search: '', startDate: '', endDate: '' },
  isLoading: false,
  error: null,
  selectedEventId: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (category?: string, { rejectWithValue }) => {
    try {
      const events = await eventService.getEvents(category);
      return events;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить мероприятия');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: any, { rejectWithValue }) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      return newEvent;
    } catch (error: any) {
      console.error('Ошибка создания (подробно):', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const updated = await eventService.updateEvent(id, data);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await eventService.deleteEvent(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EventFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: 'all', search: '', startDate: '', endDate: '' };
    },
    setSelectedEvent: (state, action: PayloadAction<number | null>) => {
      state.selectedEventId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createEvent
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // updateEvent
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // deleteEvent
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, setSelectedEvent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;