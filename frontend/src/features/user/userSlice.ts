import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventService } from '../../api/eventService';
import type { Event } from '../../types/event';

interface UserState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  events: [],
  isLoading: false,
  error: null,
};

export const fetchUserEvents = createAsyncThunk(
  'user/fetchEvents',
  async (userId: number, { rejectWithValue }) => {
    try {
      const events = await eventService.getEventsByUser(userId);
      return events;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки мероприятий пользователя');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserEvents: (state) => {
      state.events = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearUserEvents }=userSlice.actions;
export default userSlice.reducer;