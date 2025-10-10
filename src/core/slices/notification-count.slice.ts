import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AdminExtra } from '@store/admin-store';
import { NotificationService } from '../services';

export interface NotificationCountSliceStateType {
  count: number;
  error: string | null;
  loading: boolean;
}

const initialState: NotificationCountSliceStateType = {
  count: 0,
  error: null,
  loading: false
};

export const fetchNotificationCount = createAsyncThunk<number, void, { rejectValue: string; extra: AdminExtra }>(
  'notificationCount/fetchNotificationCount',
  async (_, { rejectWithValue, extra }) => {
    try {
      const notificationService = new NotificationService(extra.supabase);
      return notificationService.getMyUnreadCount();
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return rejectWithValue('Unable to fetch unread notification count');
    }
  }
);

const notificationCountSlice = createSlice({
  name: 'notificationCount',
  initialState,
  reducers: {
    clearNotificationCount: (state) => {
      state.count = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.count = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotificationCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.count = 0;
        state.loading = false;
      });
  }
});

export const { clearNotificationCount } = notificationCountSlice.actions;
export const notificationCountReducer = notificationCountSlice.reducer;
