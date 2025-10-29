'use client';

import { debounce, wait } from '@core/utils';
import { EmailOtpType, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AuthValidationStatus } from '../types';

export interface AuthServiceInterface {
  authDeepLinks: Record<string, string>;

  getUser(): Promise<User>;
  validateEmail(email: string): AuthValidationStatus;
  validateUsername(username: string): Promise<AuthValidationStatus>;
  validatePassword(password: string): AuthValidationStatus;

  joinAsGuest(): Promise<User>;
  joinWithEmail(email: string, password: string, username: string): Promise<void>;
  verifyConfirmEmail(accessToken: string, refreshToken: string): Promise<User>;
  resendSignupConfirmationEmail(email: string): Promise<void>;
  loginWithEmail(email: string, password: string): Promise<User>;
  convertGuest(id: string, email: string, password: string): Promise<User>;
  logout(): Promise<void>;

  onAuthChange(callback: (session: Session | null) => void): () => void;

  updateEmail(email: string): Promise<User>;
  updateUsername(username: string): Promise<User>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<User>;
}

export interface AuthRoutes {
  join: string;
  awaitingVerification: string;
  signupConfirmCallback: string;
  login: string;
  resetPassword: string;
  changePassword: string;
  home: string;
  passwordConfirmation: string;
  emailChangeConfirmCallback: string;
  [key: string]: string;
}

export interface JoinWithEmailParams {
  email: string;
  password: string;
  username: string;
}

export interface ConfirmationUrlParams {
  access_token?: string;
  refresh_token?: string;
  type?: EmailOtpType;
  email?: string;
  token?: string;
  message?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
  [key: string]: string | undefined;
}

export interface ConvertGuestParams {
  email: string;
  password: string;
}

export interface UpdateEmailParams {
  newEmail: string;
}

export interface UpdateUsernameParams {
  username: string;
}

export interface UpdatePasswordParams {
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthContextProps {
  isInitialized: boolean;
  isAuthenticated: boolean;
  passwordConfirmedAt: Date | null;
  session: Session | null;
  user: User | null;
  validateEmail: (email: string) => AuthValidationStatus;
  validateUsername: (username: string) => Promise<AuthValidationStatus>;
  validatePassword: (password: string) => AuthValidationStatus;
  joinAsGuest: () => Promise<void>;
  joinWithEmail: (params: JoinWithEmailParams) => Promise<void>;
  verifySignup: (params: ConfirmationUrlParams) => Promise<void>;
  verifyAccountRecovery: (params: ConfirmationUrlParams) => Promise<void>;
  verifyConfirmEmailChange: (params: ConfirmationUrlParams) => Promise<void>;
  validateConfirmationParams: (params: ConfirmationUrlParams) => boolean;
  resendSignupConfirmationEmail: (email: string) => Promise<void>;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  confirmPassword: () => Promise<boolean>;
  handleConfirmPassword: (password: string) => Promise<void>;
  cancelPasswordConfirmation: () => void;
  convertGuest: (params: ConvertGuestParams) => Promise<void>;
  updatePassword: (params: UpdatePasswordParams) => Promise<void>;
  updateEmail: (params: UpdateEmailParams) => Promise<void>;
  updateUsername: (params: UpdateUsernameParams) => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isInitialized: false,
  isAuthenticated: false,
  passwordConfirmedAt: null,
  session: null,
  user: null,
  validateEmail: () => ({ isValid: false, message: 'Not implemented' }),
  validateUsername: async () => ({ isValid: false, message: 'Not implemented' }),
  validatePassword: () => ({ isValid: false, message: 'Not implemented' }),
  joinAsGuest: async () => {},
  joinWithEmail: async () => {},
  verifySignup: async () => {},
  verifyAccountRecovery: async () => {},
  verifyConfirmEmailChange: async () => {},
  validateConfirmationParams: () => false,
  resendSignupConfirmationEmail: async () => {},
  login: async () => {},
  logout: async () => {},
  confirmPassword: async () => false,
  handleConfirmPassword: async () => {},
  cancelPasswordConfirmation: () => {},
  convertGuest: async () => {},
  updatePassword: async () => {},
  updateEmail: async () => {},
  updateUsername: async () => {},
  resetPassword: async () => {},
  fetchUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export interface AuthProviderProps {
  authService: AuthServiceInterface;
  authRoutes: AuthRoutes;
  onReady?: () => void;
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ authService, authRoutes, onReady, children }) => {
  const router = useRouter();

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const passwordConfirmationTimeoutDuration = 15 * 60 * 1000; // 15 minutes
  const [passwordConfirmedAt, setPasswordConfirmedAt] = useState<Date | null>(null);
  const passwordConfirmationResolver = useRef<((value: boolean) => void) | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetUser = useCallback(debounce(authService.getUser, 500), []);

  const readyCalled = useRef(false);

  useEffect(() => {
    try {
      return authService.onAuthChange(async (newSession) => {
        setIsInitialized(true);
        setSession(newSession);
        authService
          .getUser()
          .then((u) => {
            setUser(u);
            setIsAuthenticated(!!u);
          })
          .catch(() => {
            setUser(null);
            setIsAuthenticated(false);
          })
          .finally(() => {
            if (!readyCalled.current) {
              readyCalled.current = true;
              onReady?.();
            }
          });
      });
    } catch (error) {
      console.error('Error setting up auth change listener:', error);
    }
  }, [onReady, authService]);

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      if (!session) return;
      const u = await authService.getUser();
      setUser(u);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [session, authService]);

  useEffect(() => {
    if (!session) return;
    debouncedGetUser().then((u) => {
      setUser(u);
    });
  }, [session, debouncedGetUser, router]);

  const joinAsGuest = useCallback(async () => {
    try {
      if (isAuthenticated) return;
      await authService.joinAsGuest();
      await wait(1000);
      router.replace(authRoutes.home);
      wait(5 * 1000).then();
      toast.success('Successfully signed in as guest!');
    } catch (error) {
      console.error('Error signing in as guest:', error);
      toast.error('Error signing in as guest. Please try again later.');
    }
  }, [isAuthenticated, router, authRoutes, authService]);

  const joinWithEmail = useCallback(
    async ({ email, password, username }: JoinWithEmailParams) => {
      try {
        if (isAuthenticated) return;
        await authService.joinWithEmail(email, password, username);
        await wait(1000);
        router.push(authRoutes.awaitingVerification);
        toast.success('Successfully signed up with email!');
      } catch (error) {
        console.error('Error joining with email:', error);
        toast.error('Error joining with email. Please try again later.');
      }
    },
    [isAuthenticated, router, authRoutes, authService]
  );

  const validateConfirmationParams = (params: ConfirmationUrlParams): boolean => {
    if (!params) {
      return false;
    }
    if (params.error || params.error_code || params.error_description) {
      return false;
    }
    return params.access_token && params.refresh_token && params.type ? true : false;
  };

  const verifySignup = async (params: ConfirmationUrlParams) => {
    if (validateConfirmationParams(params)) {
      await authService.verifyConfirmEmail(params.access_token!, params.refresh_token!);
      await wait(1000);
      router.replace(authRoutes.home);
      toast.success('Email verified successfully!');
    }
  };

  const verifyConfirmEmailChange = async (params: ConfirmationUrlParams) => {
    if (validateConfirmationParams(params)) {
      await authService.verifyConfirmEmail(params.access_token!, params.refresh_token!);
      await wait(1000);
      router.replace('/(tabs)/free-items');
      toast.success('Email verified successfully!');
    }
  };

  const verifyAccountRecovery = async (params: ConfirmationUrlParams) => {
    if (validateConfirmationParams(params)) {
      await authService.verifyConfirmEmail(params.access_token!, params.refresh_token!);
    }
  };

  const resendSignupConfirmationEmail = async (email: string) => {
    try {
      if (!email) {
        throw new Error('Email is required to resend OTP');
      }
      await authService.resendSignupConfirmationEmail(email);
      toast.success('Signup confirmation email resent successfully!');
    } catch (error) {
      console.error('Error resending signup confirmation email:', error);
      toast.error('Error resending. Please try again.');
    }
  };

  const login = async ({ email, password }: LoginParams) => {
    try {
      await authService.loginWithEmail(email, password);
      await wait(1000);
      toast.success('Successfully logged in!');
      router.replace(authRoutes.home);
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Error logging in. Please check your credentials and try again.');
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      router.replace(authRoutes.login);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out. Please try again later.');
    }
  }, [router, authService, authRoutes]);

  const convertGuest = useCallback(
    async ({ email, password }: ConvertGuestParams) => {
      try {
        if (!user || !user.is_anonymous) {
          throw new Error('User not found or not a guest');
        }
        await authService.convertGuest(user.id, email, password);
        toast.success('Registration confirmation email sent.  Please check your inbox.');
      } catch (error) {
        console.error('Error converting guest:', error);
        toast.error('Error registering user. Please try again later.');
      }
    },
    [user, authService]
  );

  const resetPassword = async ({ email }: ResetPasswordParams) => {
    try {
      await authService.resetPassword(email);
      await wait(1000);
      toast.success('Password reset email sent successfully!');
      router.push(authRoutes.awaitingVerification);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error submitting password reset. Please try again later.');
    }
  };

  const updatePassword = async ({ password }: UpdatePasswordParams) => {
    try {
      await authService.updatePassword(password);
      await wait(1000);
      router.replace(authRoutes.home);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password. Please try again later.');
    }
  };

  const updateEmail = async ({ newEmail }: UpdateEmailParams) => {
    try {
      await authService.updateEmail(newEmail);
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Error updating email. Please try again later.');
    }
  };

  const updateUsername = async ({ username }: UpdateUsernameParams) => {
    try {
      await authService.updateUsername(username);
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Error updating username. Please try again later.');
    }
  };

  const confirmPassword = useCallback(async () => {
    try {
      if (!user || !user.email) {
        throw new Error('User not found or is a guest');
      }
      if (passwordConfirmedAt && passwordConfirmedAt.getTime() > Date.now() - passwordConfirmationTimeoutDuration) {
        return new Promise<boolean>((resolve) => {
          resolve(true);
        });
      }
      return new Promise<boolean>((resolve) => {
        passwordConfirmationResolver.current = resolve;
        router.push(authRoutes.passwordConfirmation);
      });
    } catch (error) {
      console.error('Error confirming password:', error);
      toast.error('Error confirming password. Please try again.');
      return new Promise<boolean>((resolve) => {
        resolve(false);
      });
    }
  }, [user, passwordConfirmedAt, router, passwordConfirmationTimeoutDuration, authRoutes]);

  const handleConfirmPassword = useCallback(
    async (password: string) => {
      try {
        if (!user || !user.email || !password) {
          toast.error('User not found or password is empty');
          return;
        }
        await authService.loginWithEmail(user.email, password);
        setPasswordConfirmedAt(new Date());
        toast.success('Password confirmed successfully!');
        passwordConfirmationResolver.current?.(true);
        passwordConfirmationResolver.current = null;
        router.back();
      } catch (error) {
        console.error('Error confirming password:', error instanceof Error ? error.message : error);
        toast.error('Error confirming password. Please try again.');
      }
    },
    [user, router, authService]
  );

  const cancelPasswordConfirmation = () => {
    passwordConfirmationResolver.current?.(false);
    passwordConfirmationResolver.current = null;
    setPasswordConfirmedAt(null);
    router.back();
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isAuthenticated,
        passwordConfirmedAt,
        session,
        user,
        validateEmail: (email: string) => authService.validateEmail(email),
        validateUsername: (username: string) => authService.validateUsername(username),
        validatePassword: (password: string) => authService.validatePassword(password),
        joinAsGuest,
        joinWithEmail,
        verifySignup,
        verifyAccountRecovery,
        verifyConfirmEmailChange,
        validateConfirmationParams,
        resendSignupConfirmationEmail,
        login,
        logout,
        confirmPassword,
        handleConfirmPassword,
        cancelPasswordConfirmation,
        convertGuest,
        updatePassword,
        updateEmail,
        updateUsername,
        resetPassword,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
