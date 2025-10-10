'use client';

import { formatDateTime } from '@common/utils';
import { AdminHeader } from '@core/components/admin-header';
import { Badge } from '@core/components/badge';
import { Button } from '@core/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/card';
import { Input } from '@core/components/input';
import { Label } from '@core/components/label';
import { LoadingSpinner } from '@core/components/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/select';
import { Separator } from '@core/components/separator';
import { Switch } from '@core/components/switch';
import { UserRole, UserStatus } from '@core/enumerations';
import { ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { createClientService } from '@supa/utils/client';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type UserDetailsPageParams = {
  id: string;
};

export default function UserDetailsPage() {
  const { id } = useParams<UserDetailsPageParams>();
  const profileService = useRef(createClientService(ProfileService)).current;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // const { open: openConfirmDialog } = useConfirmDialog();

  // form state mirrors profile for editing
  const [form, setForm] = useState<Partial<Profile>>({});

  // subscribe cleanup ref
  const subscriptionCleanup = useRef<(() => void) | null>(null);

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const p = await profileService.getById(id);
      setProfile(p);
      setForm({
        username: p.username,
        email: p.email ?? '',
        role: p.role,
        status: p.status,
        pushNotifications: p.pushNotifications,
        emailNotifications: p.emailNotifications,
        emailMarketing: p.emailMarketing,
        radius: p.radius,
        theme: p.theme
      });
    } catch (err) {
      console.error('Failed to load user profile', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [id, profileService]);

  useEffect(() => {
    loadProfile();
    return () => {
      if (subscriptionCleanup.current) {
        subscriptionCleanup.current();
        subscriptionCleanup.current = null;
      }
    };
  }, [loadProfile]);

  // Save updates
  const save = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updates: Partial<Profile> = {
        username: form.username ?? profile.username,
        email: form.email ?? profile.email,
        role: form.role ?? profile.role,
        status: form.status ?? profile.status,
        pushNotifications: form.pushNotifications ?? profile.pushNotifications,
        emailNotifications: form.emailNotifications ?? profile.emailNotifications,
        emailMarketing: form.emailMarketing ?? profile.emailMarketing,
        radius: form.radius ?? profile.radius,
        theme: form.theme ?? profile.theme
      };
      const updated = await profileService.update(profile.id, updates);
      setProfile(updated);
      setForm((prev) => ({ ...prev, ...updates }));
      setSuccessMessage('Profile saved');
      // clear message after a short delay
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [profile, profileService, form]);

  const refresh = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // const handleSuspendPress = useCallback(() => {
  //   openConfirmDialog({
  //     title: 'Confirm Suspension',
  //     message: `Are you sure you want to suspend ${profile?.username}?`,
  //     confirmButtonText: 'Suspend',
  //     variant: 'destructive',
  //     onConfirm: async ({ days = 3 }) => {
  //       if (!profile) {
  //         return;
  //       }
  //       try {
  //         setSaving(true);
  //         const updated = await profileService.update(profile.id, {
  //           status: 'suspended',
  //           suspensionEndsAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  //         } as Partial<Profile>);
  //         setProfile(updated);
  //         setForm((f) => ({ ...f, status: updated.status, suspensionEndsAt: updated.suspensionEndsAt }));
  //         setSuccessMessage('User suspended');
  //         setTimeout(() => setSuccessMessage(null), 3000);
  //       } catch (err) {
  //         console.error('Failed to suspend', err);
  //         setError('Failed to suspend user');
  //       } finally {
  //         setSaving(false);
  //       }
  //     },
  //     initialData: { days: 3 },
  //     Body: ({ formState, setFormState }) => {
  //       return (
  //         <div className="space-y-2">
  //           <Label>Days to Suspend</Label>
  //           <Input
  //             type="number"
  //             placeholder="Days to suspend (default 3)"
  //             value={formState.days ?? ''}
  //             onChange={(e) => setFormState({ ...formState, days: Number(e.target.value) })}
  //           />
  //         </div>
  //       );
  //     }
  //   });
  // }, [openConfirmDialog, profile, profileService]);

  // const handleLiftSuspensionPress = useCallback(() => {
  //   openConfirmDialog({
  //     title: 'Lift Suspension',
  //     message: `Are you sure you want to lift the suspension for ${profile?.username}?`,
  //     confirmButtonText: 'Lift Suspension',
  //     onConfirm: async () => {
  //       if (!profile) return;
  //       try {
  //         setSaving(true);
  //         const updated = await profileService.update(profile.id, {
  //           status: UserStatus.Active,
  //           suspensionEndsAt: null
  //         });
  //         setProfile(updated);
  //         setForm((f) => ({ ...f, status: updated.status, suspensionEndsAt: updated.suspensionEndsAt }));
  //         setSuccessMessage('Suspension lifted');
  //         setTimeout(() => setSuccessMessage(null), 3000);
  //       } catch (err) {
  //         console.error('Failed to unsuspend', err);
  //         setError('Failed to unsuspend user');
  //       } finally {
  //         setSaving(false);
  //       }
  //     }
  //   });
  // }, [openConfirmDialog, profile, profileService]);

  // // Ban / Unban
  // const toggleBan = useCallback(async () => {
  //   if (!profile) return;
  //   const isBanned = Boolean(profile.bannedAt);
  //   if (!isBanned) {
  //     if (!window.confirm(`Permanently ban ${profile.username}? This cannot be undone here.`)) return;
  //     try {
  //       setSaving(true);
  //       const updated = await profileService.update(profile.id, {
  //         status: 'banned',
  //         bannedAt: new Date().toISOString()
  //       } as Partial<Profile>);
  //       setProfile(updated);
  //       setForm((f) => ({ ...f, status: updated.status, bannedAt: updated.bannedAt }));
  //       setSuccessMessage('User banned');
  //       setTimeout(() => setSuccessMessage(null), 3000);
  //     } catch (err) {
  //       console.error('Failed to ban', err);
  //       setError('Failed to ban user');
  //     } finally {
  //       setSaving(false);
  //     }
  //   } else {
  //     if (!window.confirm(`Remove ban for ${profile.username}?`)) return;
  //     try {
  //       setSaving(true);
  //       const updated = await profileService.update(profile.id, {
  //         status: 'active',
  //         bannedAt: null
  //       } as Partial<Profile>);
  //       setProfile(updated);
  //       setForm((f) => ({ ...f, status: updated.status, bannedAt: updated.bannedAt }));
  //       setSuccessMessage('User unbanned');
  //       setTimeout(() => setSuccessMessage(null), 3000);
  //     } catch (err) {
  //       console.error('Failed to unban', err);
  //       setError('Failed to unban user');
  //     } finally {
  //       setSaving(false);
  //     }
  //   }
  // }, [profile, profileService]);

  // local helpers
  const setField = <K extends keyof Profile>(key: K, value: Profile[K] | null) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // small helper to render status badge
  const renderStatusBadge = (p?: Profile | null) => {
    if (!p) return null;
    switch (p.status) {
      case 'active':
        return <Badge>Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge>{p.status}</Badge>;
    }
  };

  return (
    <>
      <AdminHeader title="User Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{profile?.username ?? 'User'}</h2>
            <div className="mt-1">{renderStatusBadge(profile)}</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={refresh} disabled={loading || saving}>
              Refresh
            </Button>
            <Button onClick={save} disabled={!profile || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <Separator />

        {loading && (
          <div className="py-20 flex justify-center">
            <LoadingSpinner loading size={70} />
          </div>
        )}

        {error && <div className="text-destructive mb-4">{error}</div>}

        {successMessage && <div className="text-success mb-4">{successMessage}</div>}

        {!loading && !profile && (
          <Card>
            <CardHeader>
              <CardTitle>User not found</CardTitle>
            </CardHeader>
            <CardContent>
              No profile was returned for user id <code>{id}</code>.
            </CardContent>
          </Card>
        )}

        {profile && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left column: avatar + actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Identity</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-muted/20">
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
                      <div className="w-28 h-28 flex items-center justify-center bg-muted text-muted-foreground">
                        {profile.username?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <Label>Username</Label>
                    <Input value={form.username ?? ''} onChange={(e) => setField('username', e.target.value)} />
                  </div>

                  <div className="w-full">
                    <Label>Email</Label>
                    <Input value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} />
                  </div>

                  {/* <div className="flex w-full gap-2">
                    <Button
                      variant="secondary"
                      onClick={profile.status === 'suspended' ? handleLiftSuspensionPress : handleSuspendPress}
                    >
                      {profile.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                    </Button>
                    <Button variant="destructive" onClick={toggleBan}>
                      {profile.bannedAt ? 'Unban' : 'Ban'}
                    </Button>
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <div className="text-sm text-muted-foreground">Allow app push</div>
                    </div>
                    <Switch
                      checked={Boolean(form.pushNotifications)}
                      onCheckedChange={(v) => setField('pushNotifications', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-muted-foreground">Account emails</div>
                    </div>
                    <Switch
                      checked={Boolean(form.emailNotifications)}
                      onCheckedChange={(v) => setField('emailNotifications', v)}
                    />
                  </div>

                  <div>
                    <Label>Radius (miles)</Label>
                    <Input
                      type="number"
                      value={String(form.radius ?? 10)}
                      onChange={(e) => setField('radius', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Theme</Label>
                    <Select
                      onValueChange={(v) => setField('theme', v as 'light' | 'dark')}
                      defaultValue={form.theme ?? 'dark'}
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
            </div>

            {/* Middle column: account details + audit */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Role</Label>
                    <Select
                      onValueChange={(v) => setField('role', v as UserRole)}
                      defaultValue={String(form.role ?? profile.role)}
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
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      onValueChange={(v) => setField('status', v as UserStatus)}
                      defaultValue={String(form.status ?? profile.status)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserStatus.Active}>Active</SelectItem>
                        <SelectItem value={UserStatus.Suspended}>Suspended</SelectItem>
                        <SelectItem value={UserStatus.Banned}>Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div>
                    <Label>Suspension Ends At</Label>
                    <Input
                      type="datetime-local"
                      value={form.suspensionEndsAt ? new Date(form.suspensionEndsAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField('suspensionEndsAt', v ? new Date(v).toISOString() : null);
                      }}
                    />
                  </div>

                  <div>
                    <Label>Banned At</Label>
                    <Input
                      type="datetime-local"
                      value={form.bannedAt ? new Date(form.bannedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField('bannedAt', v ? new Date(v).toISOString() : null);
                      }}
                    />
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm">{profile.createdBy ?? 'system'}</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.createdAt ? formatDateTime(new Date(profile.createdAt)) : '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                    <div className="text-sm">{profile.updatedBy ?? 'system'}</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.updatedAt ? formatDateTime(new Date(profile.updatedAt)) : '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">User ID</div>
                    <div className="text-sm break-all">{profile.userId}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Profile ID</div>
                    <div className="text-sm break-all">{profile.id}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <a
                      className="underline"
                      href={`/admin/moderation/unassigned/flagged-users?userId=${profile.userId}`}
                    >
                      View flagged reports for this user
                    </a>
                  </div>
                  <div className="text-sm">
                    <a
                      className="underline"
                      href={`/admin/moderation/unassigned/reported-items?userId=${profile.userId}`}
                    >
                      View reported items by this user
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
