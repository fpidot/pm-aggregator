import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IAdminSettingsData } from '../types/adminTypes';
import { getAdminSettings, updateAdminSettings, updateBigMoveThreshold } from '../services/adminService';

export const fetchAdminSettings = createAsyncThunk(
  'admin/fetchSettings',
  async () => {
    const response = await getAdminSettings();
    return response;
  }
);

export const updateCategories = createAsyncThunk(
  'admin/updateCategories',
  async (categories: string[]) => {
    const response = await updateAdminSettings({ categories });
    return response;
  }
);

export const updateBigMoveThresholdAsync = createAsyncThunk(
  'admin/updateBigMoveThreshold',
  async ({ category, threshold }: { category: string; threshold: number }) => {
    const response = await updateBigMoveThreshold(category, threshold);
    return response;
  }
);

export const updateDefaultBigMoveThresholdAsync = createAsyncThunk(
  'admin/updateDefaultBigMoveThreshold',
  async (threshold: number) => {
    const response = await updateAdminSettings({ defaultBigMoveThreshold: threshold });
    return response;
  }
);

interface AdminState {
    settings: IAdminSettingsData;
    loading: boolean;
    error: string | null;
  }
  
  const initialState: AdminState = {
    settings: {
      dailyUpdateTime: '',
      defaultBigMoveThreshold: 0,
      bigMoveThresholds: {},
      bigMoveTimeWindow: 0,
      priceUpdateInterval: 0,
      contractDiscoveryInterval: 0,
      categories: [],
    },
    loading: false,
    error: null,
  };

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminSettings.fulfilled, (state, action: PayloadAction<IAdminSettingsData>) => {
        state.loading = false;
        state.settings = { ...action.payload };
      })
      .addCase(fetchAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin settings';
      })
      .addCase(updateCategories.fulfilled, (state, action: PayloadAction<IAdminSettingsData>) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(updateBigMoveThresholdAsync.fulfilled, (state, action: PayloadAction<IAdminSettingsData>) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(updateDefaultBigMoveThresholdAsync.fulfilled, (state, action: PayloadAction<IAdminSettingsData>) => {
        state.settings = { ...state.settings, ...action.payload };
      });
  },
});

export default adminSlice.reducer;