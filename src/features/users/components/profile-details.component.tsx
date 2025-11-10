'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyableStringCell,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@core/components';
import { ReviewStatus, ReviewTriggerType, UserRole, UserStatus } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import {
  CurbyCoinTransactionService,
  ItemService,
  PrivacyPolicyAcceptanceService,
  PrivacyPolicyService,
  ProfileService,
  SavedItemService,
  TermsAndConditionsAcceptanceService,
  TermsAndConditionsService,
  UserDeviceService,
  UserReviewService
} from '@core/services';
import { Item, Profile, SavedItem, UserDevice } from '@core/types';
import { debounce, formatDateTime } from '@core/utils';
import { CurbyCoinTransactionTable } from '@features/curby-coins/components';
import { DeviceTable } from '@features/devices/components';
import { ExtendedEventTable } from '@features/events/components';
import { FeedbackTable } from '@features/feedback/components';
import { ItemTable } from '@features/items/components';
import { PrivacyPolicyAcceptanceTable, TermsAndConditionsAcceptanceTable } from '@features/legal/components';
import { ItemReportTable } from '@features/moderation/item-reports/components';
import { ItemReviewTable } from '@features/moderation/item-reviews/components';
import { UserReviewTable } from '@features/moderation/user-reviews/components';
import { NotificationTable } from '@features/notifications/components';
import { TutorialViewTable } from '@features/tutorials/components';
import { updateEmail, updateUsername } from '@features/users/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  CoinsIcon,
  FileSearch2,
  HouseIcon,
  InfoIcon,
  MailIcon,
  SettingsIcon,
  TextAlignJustify,
  TriangleAlertIcon,
  UserIcon
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useProfile } from '../hooks';
import { FalseTakingTable } from './false-taking-table.component';
import { ProfileCell } from './profile-cell.component';
import { UserStatusBadge } from './user-status-badge.component';

const profileBaseSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .min(3, { message: 'Must be at least 3 characters' })
    .max(20, { message: 'Must be at most 20 characters' })
    .regex(/^[A-Za-z].*$/, 'Must start with a letter')
    .regex(/^[A-Za-z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
  email: z.email({ message: 'Invalid email format' }),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  pushNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  radius: z.number().min(1).max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
});

type ProfileFormValues = z.infer<typeof profileBaseSchema>;

function makeProfileSchema(
  currentUsername: string,
  validateUsername: (username: string, currentUsername?: string) => Promise<boolean | string>
) {
  return profileBaseSchema.superRefine(async (data, ctx) => {
    if (!data.username || data.username === currentUsername) return;

    const isValid = await validateUsername(data.username, currentUsername);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['username'],
        message: isValid as string
      });
    }
  });
}

export interface ProfileDetailsProps {
  id?: string | null;
}

export function ProfileDetails({ id }: ProfileDetailsProps) {
  const profileService = useRef(createClientService(ProfileService)).current;
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const itemService = useRef(createClientService(ItemService)).current;
  const savedItemService = useRef(createClientService(SavedItemService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const termsAndConditionsService = useRef(createClientService(TermsAndConditionsService)).current;
  const termsAndConditionsAcceptanceService = useRef(createClientService(TermsAndConditionsAcceptanceService)).current;
  const privacyPolicyService = useRef(createClientService(PrivacyPolicyService)).current;
  const privacyPolicyAcceptanceService = useRef(createClientService(PrivacyPolicyAcceptanceService)).current;
  const userReviewService = useRef(createClientService(UserReviewService)).current;

  const router = useRouter();
  const { user, validateUsername } = useAuth();
  const { profile: userProfile } = useProfile();
  const debouncedValidateUsername = useRef(debounce(validateUsername, 300, { trailing: true })).current;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [usersItems, setUsersItems] = useState<Item[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isMostRecentTermsAccepted, setIsMostRecentTermsAccepted] = useState<boolean>(false);
  const [isMostRecentPrivacyAccepted, setIsMostRecentPrivacyAccepted] = useState<boolean>(false);

  const formInstance = useForm<ProfileFormValues>({
    resolver: zodResolver(
      makeProfileSchema(profile?.username || '', async (username: string, currentUsername?: string) => {
        if (!username || username === currentUsername) return true;
        const validationResults = await debouncedValidateUsername(username);
        return validationResults.isValid;
      })
    ),
    defaultValues: {
      username: '',
      email: '',
      role: UserRole.User,
      status: UserStatus.Active,
      pushNotifications: false,
      emailNotifications: false,
      emailMarketing: false,
      radius: 10,
      theme: 'dark'
    },
    mode: 'onChange'
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = formInstance;

  const isCurrentUser = useMemo(() => user?.id === profile?.userId, [user, profile]);
  const isAdmin = useMemo(() => userProfile?.role === UserRole.Admin, [userProfile]);
  const isModerator = useMemo(() => userProfile?.role === UserRole.Moderator, [userProfile]);

  const { open: openConfirmDialog } = useConfirmDialog();

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await profileService.findByUserId(id);
      setProfile(p);
      // Reset form with loaded profile data
      reset({
        username: p.username || '',
        email: p.email || '',
        role: p.role,
        status: p.status,
        pushNotifications: p.pushNotifications || false,
        emailNotifications: p.emailNotifications || false,
        emailMarketing: p.emailMarketing || false,
        radius: p.radius || 10,
        theme: p.theme || 'dark'
      });

      // load related data
      const uds = await userDeviceService.getAll([
        { column: 'userId', operator: 'eq', value: p.userId },
        { column: 'active', operator: 'eq', value: true }
      ]);
      setUserDevices(uds);

      const uItems = await itemService.getAll({ column: 'postedBy', operator: 'eq', value: p.userId });
      setUsersItems(uItems);

      const sItems = await savedItemService.getAll({ column: 'userId', operator: 'eq', value: p.userId });
      setSavedItems(sItems);

      const txs = await curbyCoinTransactionService.getOneOrNull(
        { column: 'userId', operator: 'eq', value: p.userId },
        'occurredAt',
        false
      );
      setCurrentBalance(txs?.balanceAfter || 0);

      const mostRecentTerms = await termsAndConditionsService.getAllPaged(
        [],
        { column: 'createdAt', ascending: false },
        { pageIndex: 0, pageSize: 1 }
      );
      if (mostRecentTerms.length > 0) {
        const mostRecentTermsAcceptance = await termsAndConditionsAcceptanceService.getOneOrNull([
          { column: 'userId', operator: 'eq', value: p.userId },
          { column: 'termsAndConditionsId', operator: 'eq', value: mostRecentTerms[0]?.id }
        ]);
        setIsMostRecentTermsAccepted(!!mostRecentTermsAcceptance);
      }

      const mostRecentPrivacy = await privacyPolicyService.getAllPaged(
        [],
        { column: 'createdAt', ascending: false },
        { pageIndex: 0, pageSize: 1 }
      );
      if (mostRecentPrivacy.length > 0) {
        const mostRecentPrivacyAcceptance = await privacyPolicyAcceptanceService.getOneOrNull([
          { column: 'userId', operator: 'eq', value: p.userId },
          { column: 'privacyPolicyId', operator: 'eq', value: mostRecentPrivacy[0]?.id }
        ]);
        setIsMostRecentPrivacyAccepted(!!mostRecentPrivacyAcceptance);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  }, [
    id,
    profileService,
    reset,
    userDeviceService,
    savedItemService,
    curbyCoinTransactionService,
    itemService,
    termsAndConditionsAcceptanceService,
    termsAndConditionsService,
    privacyPolicyAcceptanceService,
    privacyPolicyService
  ]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save updates
  const onSubmit = useCallback(
    async (formData: ProfileFormValues) => {
      if (!profile || !id) return;

      // Security check: Only allow users to edit their own profile or admins to edit any profile
      if (!isCurrentUser && !isAdmin) {
        toast.error('You can only edit your own profile');
        return;
      }

      setSaving(true);
      try {
        // Only update username/email if user is editing their own profile or is admin
        if (isCurrentUser || isAdmin) {
          if (formData.username !== profile.username) {
            await updateUsername(id, formData.username);
          }
          if (formData.email !== profile.email) {
            await updateEmail(id, formData.email);
          }
        }

        const updates: Partial<Profile> = {
          pushNotifications: formData.pushNotifications,
          emailNotifications: formData.emailNotifications,
          emailMarketing: formData.emailMarketing,
          radius: formData.radius,
          theme: formData.theme
        };

        // Only admins can update role and status
        if (isAdmin) {
          updates.role = formData.role;
          updates.status = formData.status;
        }

        const updated = await profileService.update(profile.id, updates);
        setProfile(updated);
        // Update form with the saved data
        reset(formData);
        toast.success(
          isCurrentUser
            ? 'Your profile has been updated successfully!'
            : `${profile.username}'s profile has been updated successfully!`
        );
      } catch (err) {
        console.error('Failed to save profile', err);
        toast.error('Error saving profile');
      } finally {
        setSaving(false);
      }
    },
    [id, profile, profileService, reset, isCurrentUser, isAdmin]
  );

  const save = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const refresh = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  return (
    <div>
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted/20 flex-shrink-0">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.username} avatar`}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-semibold">
                {profile?.username?.slice(0, 1).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile?.username ?? 'Loading...'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <UserStatusBadge status={profile?.status} />
              {profile && (
                <span className="text-sm text-muted-foreground">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>
            {/* Account Status Subtext */}
            {profile && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CoinsIcon className="w-3 h-3" />
                  <span className="font-medium">{currentBalance.toLocaleString()} CC</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {isMostRecentTermsAccepted ? (
                      <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <CircleAlertIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={
                        isMostRecentTermsAccepted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      Terms {isMostRecentTermsAccepted ? 'accepted' : 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMostRecentPrivacyAccepted ? (
                      <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <CircleAlertIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={
                        isMostRecentPrivacyAccepted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      Privacy {isMostRecentPrivacyAccepted ? 'accepted' : 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          {(isCurrentUser || isAdmin) && formInstance.formState.isDirty && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </div>
          )}

          <Button variant="outline" onClick={refresh} disabled={loading || saving} className="min-w-[80px]">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Loading
              </div>
            ) : (
              'Refresh'
            )}
          </Button>

          {(isAdmin || isModerator) && (
            <Button
              variant="outline"
              onClick={() => {
                openConfirmDialog({
                  title: 'Launch User Review',
                  message: `Are you sure you want to launch a user review for ${profile?.username}?`,
                  initialData: { reason: '' },
                  Body: ({ formState, setFormState }) => {
                    return (
                      <div className="space-y-4">
                        <p>Please enter the reason for triggering this review.</p>
                        <div>
                          <Label htmlFor="reason">Reason</Label>
                          <Input
                            id="reason"
                            value={formState.reason || ''}
                            onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
                            placeholder="Enter reason"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    );
                  },
                  confirmButtonText: 'Launch',
                  variant: 'default',
                  onConfirm: (data) => {
                    if (!profile) return;
                    userReviewService
                      .create({
                        userId: profile.userId,
                        triggerType: ReviewTriggerType.Manual,
                        triggerReason: data.reason || 'No reason provided',
                        triggerData: {},
                        status: ReviewStatus.Pending,
                        appealable: true
                      })
                      .then((newReview) => {
                        router.push(`/admin/moderation/user-reviews/${newReview.id}`);
                      });
                  }
                });
              }}
              className="min-w-[120px]"
              disabled={!profile}
            >
              <FileSearch2 className="w-4 h-4 mr-2" />
              Launch Review
            </Button>
          )}

          {isCurrentUser || isAdmin ? (
            <Button
              onClick={save}
              disabled={!profile || saving || !formInstance.formState.isDirty || !formInstance.formState.isValid}
              className="min-w-[120px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          ) : (
            <Button disabled variant="outline" className="min-w-[80px]">
              View Only
            </Button>
          )}
        </div>
      </div>

      {!id && (
        <Card>
          <CardHeader>
            <CardTitle>User ID required</CardTitle>
          </CardHeader>
          <CardContent>A user ID is required to load profile details.</CardContent>
        </Card>
      )}

      {profile && !isCurrentUser && !isAdmin && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <TriangleAlertIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Viewing Another User&apos;s Profile</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You can view this profile but cannot make changes. Only users can edit their own profiles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="h-5 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-5 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                      <div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-5 bg-muted rounded animate-pulse w-1/4" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {!loading && !profile && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 p-6">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <CircleAlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Profile Not Found</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                The profile for user ID{' '}
                <code className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono">{id}</code>{' '}
                could not be found. This user may not exist or you may not have permission to view their profile.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: avatar + actions */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Account
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your username, email, and basic account information
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="w-30.5 h-30.5 rounded-full overflow-hidden bg-muted/20">
                  {profile.avatarUrl ? (
                    // Use next/image; make it fill container preserving aspect
                    <Image
                      src={profile.avatarUrl}
                      alt={`${profile.username} avatar`}
                      width={112}
                      height={112}
                      style={{ objectFit: 'cover', width: '112px', height: '112px' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      {profile.username?.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...register('username')}
                    readOnly={!isCurrentUser}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.username && (
                    <p id="username-error" className="text-sm text-red-500 mt-1" role="alert">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    {...register('email')}
                    readOnly={!isCurrentUser}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role
                  </Label>
                  {isAdmin ? (
                    <Select
                      onValueChange={(v) => setValue('role', v as UserRole, { shouldDirty: true })}
                      value={watch('role')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.User}>User</SelectItem>
                        <SelectItem value={UserRole.Moderator}>Moderator</SelectItem>
                        <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={watch('role')} readOnly />
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Status
                  </Label>
                  <Input value={watch('status')} readOnly />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle column: account details + audit */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">Customize your notification and display settings</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5">
                      <HouseIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Receive push notifications on your mobile device
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={watch('pushNotifications') || false}
                    onCheckedChange={(v) => setValue('pushNotifications', v, { shouldDirty: true })}
                    disabled={!isCurrentUser}
                  />
                </div>

                <div className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Receive important account updates via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={watch('emailNotifications') || false}
                    onCheckedChange={(v) => setValue('emailNotifications', v, { shouldDirty: true })}
                    disabled={!isCurrentUser}
                  />
                </div>

                <div>
                  <Label htmlFor="radius" className="text-sm font-medium">
                    Radius (miles)
                  </Label>
                  <Input
                    id="radius"
                    type="number"
                    min="1"
                    max="100"
                    {...register('radius', { valueAsNumber: true })}
                    readOnly={!isCurrentUser}
                    aria-describedby={errors.radius ? 'radius-error' : 'radius-help'}
                    className={errors.radius ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <p id="radius-help" className="text-xs text-muted-foreground mt-1">
                    Search radius for finding items (1-100 miles)
                  </p>
                  {errors.radius && (
                    <p id="radius-error" className="text-sm text-red-500 mt-1" role="alert">
                      {errors.radius.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <Select
                    onValueChange={(v) => setValue('theme', v as 'light' | 'dark', { shouldDirty: true })}
                    value={watch('theme') || 'dark'}
                    disabled={!isCurrentUser}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TextAlignJustify className="w-4 h-4" />
                  Profile Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">Technical information about this profile</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  {profile.createdBy ? (
                    <ProfileCell
                      userId={profile.createdBy}
                      className="text-sm py-0 h-[undefined] text-card-foreground"
                    />
                  ) : (
                    <div className="text-sm">system</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {profile.createdAt ? formatDateTime(new Date(profile.createdAt)) : '-'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                  {profile.updatedBy ? (
                    <ProfileCell
                      userId={profile.updatedBy}
                      className="text-sm py-0 h-[undefined] text-card-foreground"
                    />
                  ) : (
                    <div className="text-sm">system</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {profile.updatedAt ? formatDateTime(new Date(profile.updatedAt)) : '-'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">User ID</div>
                  <CopyableStringCell value={profile.userId} className="text-sm break-all" />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Profile ID</div>
                  <CopyableStringCell value={profile.id} className="text-sm break-all" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {isAdmin && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Admin Data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Information only visible to admins for moderation and support purposes
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="user-data" className="w-full">
                    <div className="w-full">
                      <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-md">
                        <TabsTrigger
                          value="user-data"
                          className={`
                            data-[state=active]:bg-primary
                            dark:data-[state=active]:bg-primary
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:shadow-sm
                            hover:bg-muted/80
                            dark:hover:bg-muted/80
                            text-xs
                            px-3
                            py-2.5
                            rounded-sm
                          `}
                        >
                          User Data
                        </TabsTrigger>
                        <TabsTrigger
                          value="activity"
                          className={`
                            data-[state=active]:bg-primary
                            dark:data-[state=active]:bg-primary
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:shadow-sm
                            hover:bg-muted/80 dark:hover:bg-muted/80
                            text-xs
                            px-3
                            py-2.5
                            rounded-sm
                          `}
                        >
                          Activity
                        </TabsTrigger>
                        <TabsTrigger
                          value="moderation"
                          className={`
                            data-[state=active]:bg-primary
                            dark:data-[state=active]:bg-primary
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:shadow-sm
                            hover:bg-muted/80
                            dark:hover:bg-muted/80
                            text-xs
                            px-3
                            py-2.5
                            rounded-sm
                          `}
                        >
                          Moderation
                        </TabsTrigger>
                        <TabsTrigger
                          value="system"
                          className={`
                            data-[state=active]:bg-primary
                            dark:data-[state=active]:bg-primary
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:shadow-sm
                            hover:bg-muted/80
                            dark:hover:bg-muted/80
                            text-xs
                            px-3
                            py-2.5
                            rounded-sm
                          `}
                        >
                          System
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="user-data" className="space-y-4">
                      {/* Devices Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Devices</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-4">
                            Devices this user has logged in from (click a row to view device details)
                          </div>
                          <div className="flex flex-col gap-2">
                            <DeviceTable
                              restrictiveFilters={[
                                { column: 'id', operator: 'in', value: userDevices.map((ud) => ud.deviceId) }
                              ]}
                              extraColumns={[
                                {
                                  accessorKey: 'lastSeenAt',
                                  header: 'Last Seen',
                                  cell: ({ row }) =>
                                    userDevices.some((ud) => row.original.id === ud.deviceId) &&
                                    userDevices.find((ud) => row.original.id === ud.deviceId)?.lastSeenAt
                                      ? formatDateTime(
                                          userDevices.find((ud) => row.original.id === ud.deviceId)!.lastSeenAt!
                                        )
                                      : 'Never',
                                  enableColumnFilter: false,
                                  enableSorting: false,
                                  enableSearching: false
                                },
                                {
                                  accessorKey: 'lastLogin',
                                  header: 'Last Login',
                                  cell: ({ row }) =>
                                    userDevices.some((ud) => row.original.id === ud.deviceId) &&
                                    userDevices.find((ud) => row.original.id === ud.deviceId)?.lastLogin
                                      ? formatDateTime(
                                          userDevices.find((ud) => row.original.id === ud.deviceId)!.lastLogin!
                                        )
                                      : 'Never',
                                  enableColumnFilter: false,
                                  enableSorting: false,
                                  enableSearching: false
                                },
                                {
                                  accessorKey: 'lastLogout',
                                  header: 'Last Logout',
                                  cell: ({ row }) => {
                                    const ud = userDevices.find((ud) => row.original.id === ud.deviceId);
                                    if (!ud || !ud.lastLogout) return 'Never';
                                    return formatDateTime(ud.lastLogout);
                                  },
                                  enableColumnFilter: false,
                                  enableSorting: false,
                                  enableSearching: false
                                }
                              ]}
                              onRowClick={(row) => {
                                router.push(`/admin/devices/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/devices/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Items Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-2">
                            Items this user has posted (click a row to view item details)
                          </div>
                          <div className="flex flex-col gap-2">
                            <ItemTable
                              restrictiveFilters={[{ column: 'postedBy', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/items/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/item/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Items Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Saved Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-2">
                            Items this user has saved (click a row to view item details)
                          </div>
                          <div className="flex flex-col gap-2">
                            <ItemTable
                              restrictiveFilters={[
                                { column: 'id', operator: 'in', value: savedItems.map((si) => si.itemId) }
                              ]}
                              onRowClick={(row) => {
                                router.push(`/admin/items/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/item/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">False Takings</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Items this user has falsely taken (click a row to view item details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <FalseTakingTable
                            restrictiveFilters={[{ column: 'takerId', operator: 'eq', value: profile.userId }]}
                            onRowClick={(row) => {
                              router.push(`/admin/items/${row.original.itemId}`);
                            }}
                            getRowActionMenuItems={() => [
                              {
                                label: 'View Item Details',
                                icon: InfoIcon,
                                onClick: (row) => {
                                  router.push(`/admin/items/${row.original.itemId}`);
                                }
                              }
                            ]}
                            maxHeight={300}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Events</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Events this user has triggered (click a row to view event details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <ExtendedEventTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/events/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/events/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Curby Coins</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Curby Coin transactions for this user (click a row to view transaction details)
                          </div>
                        </CardHeader>
                        <div className="text-sm text-muted-foreground mb-2">
                          Curby Coin transactions for this user (click a row to view transaction details)
                        </div>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <CurbyCoinTransactionTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/transactions/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/transactions/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Notifications</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Notifications sent to this user (click a row to view notification details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <NotificationTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/notifications/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/notifications/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Submitted Item Reports</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Item reports made by this user (click a row to view report details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <ItemReportTable
                              restrictiveFilters={[{ column: 'reporterId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/moderation/item-reviews/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="moderation" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Reported Items</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Reports made against this user&apos;s items (click a row to view report details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <ItemReportTable
                              restrictiveFilters={[
                                { column: 'itemId', operator: 'in', value: usersItems.map((ui) => ui.id) }
                              ]}
                              onRowClick={(row) => {
                                router.push(`/admin/moderation/item-reviews/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Item Reviews</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Item reviews for this user&apos;s items (click a row to view review details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <ItemReviewTable
                              restrictiveFilters={[
                                { column: 'itemId', operator: 'in', value: usersItems.map((ui) => ui.id) }
                              ]}
                              onRowClick={(row) => {
                                router.push(`/admin/moderation/item-reviews/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">User Reviews</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            User reviews for this user (click a row to view review details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <UserReviewTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/moderation/user-reviews/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/moderation/user-reviews/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Tutorial Views</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Tutorial views for this user (click a row to view tutorial view details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <TutorialViewTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/tutorials/views/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/tutorials/views/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Terms & Conditions Acceptances</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Terms & Conditions acceptances for this user (click a row to view acceptance details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <TermsAndConditionsAcceptanceTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/legal/terms/acceptances/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/legal/terms/acceptances/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Privacy Policy Acceptances</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Privacy Policy acceptances for this user (click a row to view acceptance details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <PrivacyPolicyAcceptanceTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/legal/privacy/acceptances/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/legal/privacy/acceptances/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Feedback</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Feedback submitted by this user (click a row to view feedback details)
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <FeedbackTable
                              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
                              onRowClick={(row) => {
                                router.push(`/admin/feedback/${row.id}`);
                              }}
                              getRowActionMenuItems={() => [
                                {
                                  label: 'View Details',
                                  icon: InfoIcon,
                                  onClick: (row) => {
                                    router.push(`/admin/feedback/${row.id}`);
                                  }
                                }
                              ]}
                              maxHeight={300}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
