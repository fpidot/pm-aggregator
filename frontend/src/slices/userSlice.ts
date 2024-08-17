import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data as string);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const initialState = {
  preferences: {
    categories: [] as string[],
    alertPreferences: {
      dailyUpdates: false,
      bigMoves: false
    },
    phoneNumber: ''
  },
  loading: false,
  error: null as string | null
} as UserState;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload || 'An error occurred';
      });
  }
});

export default userSlice.reducer;