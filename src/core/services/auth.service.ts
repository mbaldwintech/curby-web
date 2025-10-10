import { EventTypeKey } from '@core/enumerations';
import { AuthRoutes } from '@supa/providers';
import { AuthService as AuthServiceBase } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeviceService } from './device.service';
import { EventLoggerService } from './event-logger.service';
import { PrivacyPolicyService } from './privacy-policy.service';
import { ProfileService } from './profile.service';
import { TermsAndConditionsService } from './terms-and-conditions.service';

export const authRoutes: AuthRoutes = {
  join: '/admin/register',
  awaitingVerification: '/admin/awaiting-verification',
  signupConfirmCallback: '/admin/signup-confirm-callback',
  login: '/admin/login',
  resetPassword: '/admin/reset-password',
  changePassword: '/admin/change-password',
  home: '/admin',
  passwordConfirmation: '/(modals)/profile/confirm-password',
  emailChangeConfirmCallback: '/email-change-confirm-callback'
};

export class AuthService extends AuthServiceBase {
  constructor(
    protected supabase: SupabaseClient,
    deviceId?: string
  ) {
    const deviceService = new DeviceService(supabase);
    deviceService.deviceId = deviceId;
    const profileService = new ProfileService(supabase);
    const termsAndConditionsService = new TermsAndConditionsService(supabase);
    const privacyPolicyService = new PrivacyPolicyService(supabase);
    const eventLoggerService = new EventLoggerService(supabase);
    eventLoggerService.deviceId = deviceId;
    super(supabase, {
      checkIfUsernameExists: async (username: string): Promise<boolean> => {
        return profileService.exists({ column: 'username', operator: 'eq', value: username });
      },
      authDeepLinks: Object.keys(authRoutes).reduce(
        (acc, key) => {
          acc[key] = `curby:/${authRoutes[key]}`;
          return acc;
        },
        {} as Record<keyof typeof authRoutes, string>
      ),
      onJoin: async () => {
        await termsAndConditionsService.acceptCurrent();
        await privacyPolicyService.acceptCurrent();
      },
      onLogin: async () => {
        deviceService.trackLogin();
      },
      onLogout: async () => {
        deviceService.trackLogout();
      },
      AuthEventTypeKeyEnum: EventTypeKey,
      eventLoggerService: eventLoggerService
    });
  }
}
