import { ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AppExtra } from '@store/store';

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

export const syncProfile = createAsyncThunk<Profile, void, { rejectWithValue: string; extra: AppExtra }>(
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
