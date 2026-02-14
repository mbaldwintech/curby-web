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
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  CoinsIcon,
  FileSearch2,
  HouseIcon,
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
import { ProfileActivityTab } from './profile-activity-tab.component';
import { ProfileCell } from './profile-cell.component';
import { ProfileItemsTab } from './profile-items-tab.component';
import { ProfileModerationTab } from './profile-moderation-tab.component';
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

const tabTriggerClassName = `
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
`;

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

  const onSubmit = useCallback(
    async (formData: ProfileFormValues) => {
      if (!profile || !id) return;

      if (!isCurrentUser && !isAdmin) {
        toast.error('You can only edit your own profile');
        return;
      }

      setSaving(true);
      try {
        if (isCurrentUser || isAdmin) {
          if (formData.username !== profile.username) {
            const { updateUsername } = await import('@features/users/actions');
            await updateUsername(id, formData.username);
          }
          if (formData.email !== profile.email) {
            const { updateEmail } = await import('@features/users/actions');
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

        if (isAdmin) {
          updates.role = formData.role;
          updates.status = formData.status;
        }

        const updated = await profileService.update(profile.id, updates);
        setProfile(updated);
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
      {/* Header */}
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
          {/* Left column: Account */}
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

          {/* Right column: Preferences + Details */}
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

          {/* Admin Data Tabs */}
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
                      <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-md">
                        <TabsTrigger value="user-data" className={tabTriggerClassName}>
                          User Data
                        </TabsTrigger>
                        <TabsTrigger value="activity" className={tabTriggerClassName}>
                          Activity
                        </TabsTrigger>
                        <TabsTrigger value="moderation" className={tabTriggerClassName}>
                          Moderation
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="user-data">
                      <ProfileItemsTab profile={profile} userDevices={userDevices} savedItems={savedItems} />
                    </TabsContent>

                    <TabsContent value="activity">
                      <ProfileActivityTab profile={profile} />
                    </TabsContent>

                    <TabsContent value="moderation">
                      <ProfileModerationTab profile={profile} usersItems={usersItems} />
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
