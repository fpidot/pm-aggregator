import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const registerSubscriber = createAsyncThunk(
  'user/registerSubscriber',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/subscribers/register', { phoneNumber });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const verifySubscriber = createAsyncThunk(
  'user/verifySubscriber',
  async ({ phoneNumber, confirmationCode }: { phoneNumber: string; confirmationCode: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/subscribers/verify', { phoneNumber, confirmationCode });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export interface UserPreferences {
  categories: string[];
  alertPreferences: {
    dailyUpdates: boolean;
    bigMoves: boolean;
  };
  phoneNumber: string;
}

interface UserState {
  preferences: UserPreferences;
  isRegistered: boolean;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
}


export const updateUserPreferences = createAsyncThunk<
  { subscriber: UserPreferences },
  UserPreferences,
  { rejectValue: string }
>(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ subscriber: UserPreferences }>(`${API_URL}/api/subscribers/preferences`, preferences);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data as string);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const initialState: UserState = {
  preferences: {
    categories: [],
    alertPreferences: {
      dailyUpdates: false,
      bigMoves: false
    },
    phoneNumber: ''
  },
  isRegistered: false,
  isVerified: false,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setIsVerified: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSubscriber.fulfilled, (state) => {
        state.loading = false;
        state.isRegistered = true;
      })
      .addCase(registerSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      .addCase(verifySubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySubscriber.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = true;
        state.error = null;
      })
      .addCase(verifySubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action: PayloadAction<{ subscriber: UserPreferences }>) => {
        state.loading = false;
        state.preferences = action.payload.subscriber;
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  }
});

export default userSlice.reducer;