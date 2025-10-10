import type { SupabaseClient } from '@supabase/supabase-js';
import { Session, User } from '@supabase/supabase-js';
import { AuthValidationStatus } from '../types';

export interface AuthRoutes {
  join: string;
  awaitingVerification: string;
  signupConfirmCallback: string;
  login: string;
  resetPassword: string;
  changePassword: string;
  freeItems: string;
  passwordConfirmation: string;
  emailChangeConfirmCallback: string;
  [key: string]: string;
}

export const AuthEventTypeKey = {
  AnonymousUserJoined: 'ANONYMOUS_USER_JOINED',
  AnonymousUserConverted: 'ANONYMOUS_USER_CONVERTED',
  Join: 'JOIN',
  EmailVerificationRequested: 'EMAIL_VERIFICATION_REQUESTED',
  EmailVerified: 'EMAIL_VERIFIED',
  Login: 'LOGIN',
  Logout: 'LOGOUT',
  PasswordResetRequested: 'PASSWORD_RESET_REQUESTED',
  PasswordChange: 'PASSWORD_CHANGE',
  EmailChange: 'EMAIL_CHANGE',
  UsernameChange: 'USERNAME_CHANGE'
} as const;

export type AuthEventTypeKeyType = (typeof AuthEventTypeKey)[keyof typeof AuthEventTypeKey];

export interface AuthConfig<T extends Record<keyof typeof AuthEventTypeKey, string> = typeof AuthEventTypeKey> {
  checkIfUsernameExists: (username: string) => Promise<boolean>;
  authDeepLinks: Record<string, string>;
  onJoin?: (user: User) => void;
  onLogin?: (user: User) => void;
  onLogout?: () => void;
  AuthEventTypeKeyEnum?: T;
  eventLoggerService?: {
    log: (event: T[keyof typeof AuthEventTypeKey], metadata?: Record<string, unknown>) => Promise<void>;
  };
}

export class AuthService<T extends Record<keyof typeof AuthEventTypeKey, string> = typeof AuthEventTypeKey> {
  private checkIfUsernameExists: (username: string) => Promise<boolean>;
  public authDeepLinks: Record<string, string>;
  private onJoin?: (user: User) => void;
  private onLogin?: (user: User) => void;
  private onLogout?: () => void;
  private AuthEventTypeKeyEnum: T;
  private eventLoggerService?: {
    log: (event: T[keyof typeof AuthEventTypeKey], metadata?: Record<string, unknown>) => Promise<void>;
  };

  constructor(
    protected supabase: SupabaseClient,
    {
      checkIfUsernameExists,
      authDeepLinks,
      onJoin,
      onLogin,
      onLogout,
      AuthEventTypeKeyEnum = AuthEventTypeKey as T,
      eventLoggerService
    }: AuthConfig<T>
  ) {
    this.checkIfUsernameExists = checkIfUsernameExists;
    this.authDeepLinks = authDeepLinks;
    this.onJoin = onJoin;
    this.onLogin = onLogin;
    this.onLogout = onLogout;
    this.AuthEventTypeKeyEnum = AuthEventTypeKeyEnum;
    this.eventLoggerService = eventLoggerService;

    this.getUser = this.getUser.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.validateUsername = this.validateUsername.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.joinAsGuest = this.joinAsGuest.bind(this);
    this.joinWithEmail = this.joinWithEmail.bind(this);
    this.verifyConfirmEmail = this.verifyConfirmEmail.bind(this);
    this.resendSignupConfirmationEmail = this.resendSignupConfirmationEmail.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.convertGuest = this.convertGuest.bind(this);
    this.logout = this.logout.bind(this);
    this.onAuthChange = this.onAuthChange.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  async getUser(): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error fetching Supabase user:', error);
      throw new Error('Failed to fetch user from Supabase');
    }

    return data.user;
  }

  async getUserOrNull(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error fetching Supabase user:', error);
      return null;
    }

    return data.user;
  }

  validateEmail(email: string): AuthValidationStatus {
    if (!email) {
      return {
        isValid: false,
        message: 'Email is required'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        isValid: false,
        message: 'Invalid email format'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  async validateUsername(username: string): Promise<AuthValidationStatus> {
    if (!username) {
      return {
        isValid: false,
        message: 'Username is required'
      };
    }
    if (username.length < 3) {
      return {
        isValid: false,
        message: 'Username must be at least 3 characters long'
      };
    }
    if (username.length > 20) {
      return {
        isValid: false,
        message: 'Username must be at most 20 characters long'
      };
    }
    if (username.includes(' ') || !/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
      return {
        isValid: false,
        message: 'Username can only contain letters, numbers, and underscores, and must start with a letter'
      };
    }

    const exists = await this.checkIfUsernameExists(username);
    if (exists) {
      return {
        isValid: false,
        message: 'Username is already taken'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  validatePassword(password: string): AuthValidationStatus {
    if (!password || password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters'
      };
    }

    if (!/[a-z]+/.test(password)) {
      return {
        isValid: false,
        message: 'Passwords must contain at least one lowercase letter'
      };
    }

    if (!/[A-Z]+/.test(password)) {
      return {
        isValid: false,
        message: 'Passwords must contain at least one uppercase letter'
      };
    }

    if (!/[0-9]+/.test(password)) {
      return {
        isValid: false,
        message: 'Passwords must contain at least one number'
      };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]+/.test(password)) {
      return {
        isValid: false,
        message: 'Passwords must contain at least one special character'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  async joinAsGuest(): Promise<User> {
    const { data, error } = await this.supabase.auth.signInAnonymously();

    if (error) {
      console.error('Error logging in anonymously:', error);
      throw new Error('Failed to log in anonymously');
    }

    if (!data.user) {
      throw new Error('No user returned from anonymous login');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.AnonymousUserJoined) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.AnonymousUserJoined);
    }

    return data.user;
  }

  async joinWithEmail(email: string, password: string, username: string): Promise<void> {
    const emailValidationResults = this.validateEmail(email);
    const passwordValidationResults = this.validatePassword(password);
    const usernameValidationResults = await this.validateUsername(username);

    if (!emailValidationResults.isValid) {
      throw new Error('Invalid email format or email already taken');
    }
    if (!passwordValidationResults.isValid) {
      throw new Error('Invalid password format');
    }
    if (!usernameValidationResults.isValid) {
      throw new Error('Invalid username');
    }

    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        emailRedirectTo: this.authDeepLinks.signupConfirmCallback
      }
    });

    if (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }

    const user = await this.getUserOrNull();

    if (user && this.eventLoggerService && this.AuthEventTypeKeyEnum.Join) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.Join);
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.EmailVerificationRequested) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.EmailVerificationRequested, { email });
    }
  }

  async verifyConfirmEmail(accessToken: string, refreshToken: string): Promise<User> {
    if (!accessToken || !refreshToken) {
      throw new Error('Access token and refresh token are required');
    }

    const { data, error } = await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) {
      console.error('Error verifying email:', error);
      throw new Error('Invalid access or refresh token');
    }

    if (!data.user) {
      throw new Error('No user returned from email verification');
    }

    if (this.eventLoggerService) {
      if (this.AuthEventTypeKeyEnum.EmailVerified) {
        await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.EmailVerified);
      }
      if (this.AuthEventTypeKeyEnum.Join) {
        await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.Join);
      }
    }

    this.onJoin?.(data.user);

    return data.user;
  }

  async resendSignupConfirmationEmail(email: string): Promise<void> {
    if (!email) {
      throw new Error('Email is required');
    }

    const { error } = await this.supabase.auth.resend({
      email,
      type: 'signup',
      options: {
        emailRedirectTo: this.authDeepLinks.signupConfirmCallback
      }
    });

    if (error) {
      console.error('Error resending OTP:', error);
      throw new Error('Failed to resend OTP');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.EmailVerificationRequested) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.EmailVerificationRequested, { email });
    }
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Error logging in:', error);
      throw new Error('Invalid email or password');
    }

    if (!data.user) {
      throw new Error('No user returned from login');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.Login) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.Login);
    }

    this.onLogin?.(data.user);

    return data.user;
  }

  async convertGuest(id: string, email: string, password: string): Promise<User> {
    const guestUser = await this.getUser();
    if (!guestUser.is_anonymous) {
      throw new Error('User is not a guest');
    }

    const emailValidationResults = this.validateEmail(email);
    const passwordValidationResults = this.validatePassword(password);

    if (!emailValidationResults.isValid) {
      throw new Error('Invalid email format or email already taken');
    }
    if (!passwordValidationResults.isValid) {
      throw new Error('Invalid password format');
    }

    const { data, error } = await this.supabase.auth.updateUser(
      { email, password },
      {
        emailRedirectTo: this.authDeepLinks.signupConfirmCallback
      }
    );

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to convert guest user');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.AnonymousUserConverted) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.AnonymousUserConverted);
    }

    return data.user;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.Logout) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.Logout);
    }

    if (error) {
      throw error;
    }

    this.onLogout?.();
  }

  onAuthChange(callback: (session: Session | null) => void): () => void {
    const response = this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
    return response.data.subscription.unsubscribe;
  }

  async updateEmail(email: string): Promise<User> {
    const emailValidationResults = this.validateEmail(email);
    if (!emailValidationResults.isValid) {
      throw new Error(emailValidationResults.message);
    }

    const { data, error } = await this.supabase.auth.updateUser(
      { email },
      {
        emailRedirectTo: this.authDeepLinks.emailChangeConfirmCallback
      }
    );

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to update email');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.EmailChange) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.EmailChange);
    }

    return data.user;
  }

  async updateUsername(username: string): Promise<User> {
    const usernameValidationResults = await this.validateUsername(username);
    if (!usernameValidationResults.isValid) {
      throw new Error(usernameValidationResults.message);
    }

    const { data, error } = await this.supabase.auth.updateUser({
      data: { username }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to update username');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.UsernameChange) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.UsernameChange);
    }

    return data.user;
  }

  async resetPassword(email: string): Promise<void> {
    const emailValidationResults = this.validateEmail(email);
    if (!emailValidationResults.isValid) {
      throw new Error(emailValidationResults.message);
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: this.authDeepLinks.changePassword
    });

    if (error) {
      throw error;
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.PasswordResetRequested) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.PasswordResetRequested, { email });
    }
  }

  async updatePassword(password: string): Promise<User> {
    const passwordValidationResults = this.validatePassword(password);
    if (!passwordValidationResults.isValid) {
      throw new Error(passwordValidationResults.message);
    }

    const { data, error } = await this.supabase.auth.updateUser({ password });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to update password');
    }

    if (this.eventLoggerService && this.AuthEventTypeKeyEnum.PasswordChange) {
      await this.eventLoggerService.log(this.AuthEventTypeKeyEnum.PasswordChange);
    }

    return data.user;
  }
}
