import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

export interface UserState {
  isVerified: boolean;
  loading: boolean;
  error: string | null;
  preferences: {
    categories: string[];
    alertPreferences: {
      dailyUpdates: boolean;
      bigMoves: boolean;
    };
    phoneNumber: string;
  };
}

const initialState: UserState = {
  isVerified: false,
  loading: false,
  error: null,
  preferences: {
    categories: [],
    alertPreferences: {
      dailyUpdates: true,
      bigMoves: true
    },
    phoneNumber: ''
  }
};

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

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: UserState['preferences'], { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/preferences', preferences);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data as string);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSubscriber.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(registerSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifySubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySubscriber.fulfilled, (state, action) => {
        state.isVerified = true;
        state.loading = false;
        state.preferences = {
          ...state.preferences,
          categories: action.payload.categories || [],
          phoneNumber: action.payload.phoneNumber
        };
      })
      .addCase(verifySubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;