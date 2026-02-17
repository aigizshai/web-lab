import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;