import { configureStore } from '@reduxjs/toolkit';

import { userLocationReducer } from '@core/slices/user-location.slice';

export const rootStore = configureStore({
  reducer: {
    userLocation: userLocationReducer
  }
});

export type RootState = ReturnType<typeof rootStore.getState>;
export type RootDispatch = typeof rootStore.dispatch;
