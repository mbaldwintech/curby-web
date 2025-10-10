import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AdminExtra } from '@store/admin-store';
import { DeviceService } from '../services';
import { Device } from '../types';

type DeviceState = {
  device: Device | null;
  loading: boolean;
  error: string | null;
};

const initialState: DeviceState = {
  device: null,
  loading: false,
  error: null
};

export const syncDevice = createAsyncThunk<Device, void, { rejectWithValue: string; extra: AdminExtra }>(
  'device/sync',
  async (_, { rejectWithValue, extra }) => {
    try {
      const deviceService = new DeviceService(extra.supabase);
      const device = await deviceService.getMyDevice();

      return device;
    } catch (err) {
      return rejectWithValue((err instanceof Error ? err.message : err) ?? 'Failed to initialize user device');
    }
  }
);

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(syncDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.device = action.payload;
      })
      .addCase(syncDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const deviceReducer = deviceSlice.reducer;
