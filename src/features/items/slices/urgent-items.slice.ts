import { ExtendedItemService, ItemService } from '@core/services';
import { ExtendedItem } from '@core/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AppExtra } from '@store/store';

export interface UrgentItemsSliceStateType {
  count: number;
  urgentItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
}

const initialState: UrgentItemsSliceStateType = {
  count: 0,
  urgentItems: [],
  error: null,
  loading: false
};

export const fetchUrgentItems = createAsyncThunk<ExtendedItem[], void, { rejectValue: string; extra: AppExtra }>(
  'urgentItems/fetchUrgentItems',
  async (_, { rejectWithValue, extra }) => {
    try {
      const itemService = new ExtendedItemService(extra.supabase);
      return await itemService.getMyUrgentItems();
    } catch (error) {
      console.error('Error fetching urgent items:', error);
      return rejectWithValue('Unable to fetch urgent items');
    }
  }
);

export const fetchUrgentItemsCount = createAsyncThunk<number, void, { rejectValue: string; extra: AppExtra }>(
  'urgentItems/fetchUrgentItemsCount',
  async (_, { rejectWithValue, extra }) => {
    try {
      const itemService = new ItemService(extra.supabase);
      return await itemService.getMyUrgentItemsCount();
    } catch (error) {
      console.error('Error fetching urgent items count:', error);
      return rejectWithValue('Unable to fetch urgent items count');
    }
  }
);

const urgentItemsSlice = createSlice({
  name: 'urgentItems',
  initialState,
  reducers: {
    // Example of a synchronous reducer
    clearUrgentItems: (state) => {
      state.urgentItems = [];
      state.count = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch urgent items
      .addCase(fetchUrgentItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUrgentItems.fulfilled, (state, action) => {
        state.urgentItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchUrgentItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.urgentItems = [];
        state.loading = false;
      })
      // Fetch urgent items count
      .addCase(fetchUrgentItemsCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUrgentItemsCount.fulfilled, (state, action) => {
        state.count = action.payload;
        state.loading = false;
      })
      .addCase(fetchUrgentItemsCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.count = 0;
        state.loading = false;
      });
  }
});

export const urgentItemsReducer = urgentItemsSlice.reducer;
