import { configureStore } from '@reduxjs/toolkit';
import contractReducer from './slices/contractSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    contracts: contractReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;