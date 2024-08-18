import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { RootState } from '../store';
import { formatPhoneNumber } from '../utils/phoneNumberUtil';

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
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const response = await axios.post('/api/subscribers/register', { phoneNumber: formattedPhoneNumber });
      return { ...response.data, phoneNumber: formattedPhoneNumber };
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
  async ({ phoneNumber, confirmationCode }: { phoneNumber: string; confirmationCode: string }, { rejectWithValue, getState }) => {
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      console.log('Verifying subscriber:', { phoneNumber: formattedPhoneNumber, confirmationCode });
      const response = await axios.post('/api/subscribers/verify', { phoneNumber: formattedPhoneNumber, confirmationCode });
      console.log('Verification response:', response.data);
      
      const state = getState() as RootState;
      const allCategories = state.contracts.categories;
      console.log('All categories:', allCategories);
      
      const result = {
        ...response.data,
        phoneNumber: formattedPhoneNumber,
        categories: allCategories,
        alertPreferences: { dailyUpdates: true, bigMoves: true }
      };
      console.log('Returning result:', result);
      return result;
    } catch (error) {
      console.error('Verification error:', error);
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
      const formattedPreferences = {
        ...preferences,
        phoneNumber: formatPhoneNumber(preferences.phoneNumber)
      };
      console.log('Updating preferences:', formattedPreferences);
      const response = await axios.post('/api/subscribers/preferences', formattedPreferences);
      console.log('Update response:', response.data);
      return response.data.preferences;
    } catch (error) {
      console.error('Update error:', error);
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
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
          categories: action.payload.categories,
          alertPreferences: action.payload.alertPreferences,
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