import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateUserPreferencesAPI } from '../api';
import { UserPreferences } from '../types';

interface UserState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  preferences: {
    categories: [],
    alertTypes: {
      dailyUpdates: false,
      bigMoves: false,
    },
  },
  loading: false,
  error: null,
};

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: UserPreferences) => {
    const response = await updateUserPreferencesAPI(preferences);
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    preferences: {
      categories: [],
      alertTypes: {
        dailyUpdates: false,
        bigMoves: false
      },
      phoneNumber: ''
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export default userSlice.reducer;