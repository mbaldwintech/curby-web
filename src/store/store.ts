import { configureStore } from '@reduxjs/toolkit';

import { deviceReducer, userDeviceReducer } from '@features/devices/slices';
import { profileReducer } from '@features/users/slices';
import { createClient } from '@supa/utils/client';

const supabase = createClient();

export const appStore = configureStore({
  reducer: {
    device: deviceReducer,
    profile: profileReducer,
    userDevice: userDeviceReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { supabase }
      }
    })
});

export type AppState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
export type AppExtra = { supabase: typeof supabase };
