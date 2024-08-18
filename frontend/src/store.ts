import { configureStore } from '@reduxjs/toolkit';
import contractsReducer from './slices/contractSlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    contracts: contractsReducer,
    user: userReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;