import { configureStore } from '@reduxjs/toolkit';

import {
  curbyCoinBalanceReducer,
  deviceReducer,
  notificationCountReducer,
  profileReducer,
  savedItemsReducer,
  urgentItemsReducer,
  userDeviceReducer
} from '@core/slices';
import { createClient } from '@supa/utils/client';

const supabase = createClient();

export const adminStore = configureStore({
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

export type AdminState = ReturnType<typeof adminStore.getState>;
export type AdminDispatch = typeof adminStore.dispatch;
export type AdminExtra = { supabase: typeof supabase };
