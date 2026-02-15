import { ExtendedItemService } from '@core/services';
import { ExtendedItem } from '@core/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AppExtra } from '@store/store';
import { createLogger } from '@core/utils';

const logger = createLogger('SavedItems');

export interface SavedItemsSliceStateType {
  savedItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
}

const initialState: SavedItemsSliceStateType = {
  savedItems: [],
  error: null,
  loading: false
};

export const fetchSavedItems = createAsyncThunk<ExtendedItem[], void, { rejectValue: string; extra: AppExtra }>(
  'savedItems/fetchSavedItems',
  async (_, { rejectWithValue, extra }) => {
    try {
      const itemService = new ExtendedItemService(extra.supabase);
      return await itemService.getMySavedItems();
    } catch (error) {
      logger.error('Error fetching saved items:', error);
      return rejectWithValue('Unable to fetch saved items');
    }
  }
);

const savedItemsSlice = createSlice({
  name: 'savedItems',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSavedItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedItems.fulfilled, (state, action) => {
        state.savedItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchSavedItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.savedItems = [];
        state.loading = false;
      });
  }
});

export const savedItemsReducer = savedItemsSlice.reducer;
