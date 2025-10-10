import { Coordinates } from '@common/types';
import { createSlice } from '@reduxjs/toolkit';

export interface UserLocationSliceStateType {
  userLocation: Coordinates | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  loading: boolean;
}

const initialState: UserLocationSliceStateType = {
  userLocation: null,
  error: null,
  permissionStatus: null,
  loading: false
};

const userLocationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {
    setUserLocation: (
      state,
      action: { payload: { coords: Coordinates; permissionStatus: 'granted' | 'denied' | 'prompt' } }
    ) => {
      state.userLocation = action.payload.coords;
      state.permissionStatus = action.payload.permissionStatus;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: { payload: string }) => {
      state.error = action.payload;
      state.userLocation = null;
      state.permissionStatus = 'denied';
      state.loading = false;
    },
    setLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload;
    },
    clearLocation: (state) => {
      state.userLocation = null;
      state.error = null;
      state.permissionStatus = null;
      state.loading = false;
    }
  }
});

export const { setUserLocation, setError, setLoading, clearLocation } = userLocationSlice.actions;
export const userLocationReducer = userLocationSlice.reducer;
