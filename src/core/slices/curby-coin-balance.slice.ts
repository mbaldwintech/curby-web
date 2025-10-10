import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AdminExtra } from '@store/admin-store';
import { CurbyCoinTransactionService } from '../services';

export interface CurbyCoinBalanceSliceStateType {
  balance: number;
  error: string | null;
  loading: boolean;
}

const initialState: CurbyCoinBalanceSliceStateType = {
  balance: 0,
  error: null,
  loading: false
};

export const fetchCurbyCoinBalance = createAsyncThunk<number, void, { rejectValue: string; extra: AdminExtra }>(
  'curbyCoinBalance/fetchCurbyCoinBalance',
  async (_, { rejectWithValue, extra }) => {
    try {
      const curbyCoinTransactionService = new CurbyCoinTransactionService(extra.supabase);
      return await curbyCoinTransactionService.getMyBalance();
    } catch (error) {
      console.error('Error fetching curbyCoin balance:', error);
      return rejectWithValue('Unable to fetch curbyCoin balance');
    }
  }
);

const curbyCoinBalanceSlice = createSlice({
  name: 'curbyCoinBalance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurbyCoinBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurbyCoinBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurbyCoinBalance.rejected, (state, action) => {
        state.error = action.payload as string;
        state.balance = 0;
        state.loading = false;
      });
  }
});

export const curbyCoinBalanceReducer = curbyCoinBalanceSlice.reducer;
