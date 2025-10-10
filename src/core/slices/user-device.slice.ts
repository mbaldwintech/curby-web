import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AdminExtra } from '@store/admin-store';
import { DeviceService, UserDeviceService } from '../services';
import { UserDevice } from '../types';

type UserDeviceState = {
  userDevice: UserDevice | null;
  loading: boolean;
  error: string | null;
};

const initialState: UserDeviceState = {
  userDevice: null,
  loading: false,
  error: null
};

export const syncUserDevice = createAsyncThunk<
  { userDevice: UserDevice | null },
  void,
  { rejectWithValue: string; extra: AdminExtra }
>('userDevice/sync', async (_, { rejectWithValue, extra }) => {
  try {
    const deviceService = new DeviceService(extra.supabase);
    const user = await deviceService.getUserOrNull();
    if (!user) {
      return { userDevice: null };
    }
    const device = await deviceService.getMyDevice();
    if (!device) {
      return { userDevice: null };
    }
    const userDeviceService = new UserDeviceService(extra.supabase);
    const userDevice = await userDeviceService.getOneOrNull([
      { column: 'userId', operator: 'eq', value: user.id },
      { column: 'deviceId', operator: 'eq', value: device.id }
    ]);
    if (!userDevice) {
      return { userDevice: null };
    }

    return { userDevice };
  } catch (err) {
    return rejectWithValue(
      (err instanceof Error ? err.message : JSON.stringify(err)) ?? 'Failed to initialize user userDevice'
    );
  }
});

const userDeviceSlice = createSlice({
  name: 'userDevice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(syncUserDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncUserDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.userDevice = action.payload.userDevice;
      })
      .addCase(syncUserDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const userDeviceReducer = userDeviceSlice.reducer;
