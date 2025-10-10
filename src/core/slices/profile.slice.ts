import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AdminExtra } from '@store/admin-store';
import { ProfileService } from '../services';
import { Profile } from '../types';

type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null
};

export const syncProfile = createAsyncThunk<Profile, void, { rejectWithValue: string; extra: AdminExtra }>(
  'profile/sync',
  async (_, { rejectWithValue, extra }) => {
    try {
      const profileService = new ProfileService(extra.supabase);
      const profile = await profileService.getMyProfile();

      return profile;
    } catch (err) {
      return rejectWithValue((err instanceof Error ? err.message : err) ?? 'Failed to initialize user profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(syncProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(syncProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const profileReducer = profileSlice.reducer;
