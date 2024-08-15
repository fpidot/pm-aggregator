import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchContractsFromAPI } from '../api';
import { Contract } from '../types';

interface ContractState {
  contracts: Contract[];
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  contracts: [],
  categories: [],
  loading: false,
  error: null,
};

export const fetchContracts = createAsyncThunk(
  'contracts/fetchContracts',
  async () => {
    const response = await fetchContractsFromAPI();
    return response;
  }
);

const contractSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
        state.categories = action.payload.categories;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export default contractSlice.reducer;