import { configureStore } from '@reduxjs/toolkit';

import { curbyCoinBalanceReducer } from '@features/curby-coins/slices';
import { deviceReducer, userDeviceReducer } from '@features/devices/slices';
import { savedItemsReducer, urgentItemsReducer } from '@features/items/slices';
import { notificationCountReducer } from '@features/notifications/slices';
import { profileReducer } from '@features/users/slices';
import { createClient } from '@supa/utils/client';

const supabase = createClient();

export const appStore = configureStore({
  reducer: {
    curbyCoinBalance: curbyCoinBalanceReducer,
    device: deviceReducer,
    notificationCount: notificationCountReducer,
    profile: profileReducer,
    savedItems: savedItemsReducer,
    userDevice: userDeviceReducer,
    urgentItems: urgentItemsReducer
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
