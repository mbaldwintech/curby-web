'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components/base/card';
import { Skeleton } from '@core/components/base/skeleton';
import { CurbyCoinTransactionService, ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { formatDateTime } from '@core/utils';
import { createClientService } from '@supa/utils/client';
import { CoinsIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserStatusBadge } from './user-status-badge.component';

export function ProfileCard({ userId }: { userId: string }) {
  const profileService = useRef(createClientService(ProfileService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await profileService.findByUserId(userId);
      setProfile(p);
      const tx = await curbyCoinTransactionService.getOneOrNull(
        { column: 'userId', operator: 'eq', value: userId },
        'occurredAt',
        false
      );
      setBalance(tx?.balanceAfter || 0);
    } catch (err) {
      console.error('Error fetching profile details:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  }, [profileService, curbyCoinTransactionService, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-stretch min-h-[120px]">
            <Skeleton className="rounded-full bg-muted/20 flex-shrink-0" style={{ width: 80, height: 80 }} />
            <div className="ml-4 flex-1 flex flex-col space-y-4">
              {[...Array(3)].map((_, i) => (
                <div className="grid grid-cols-2 gap-4" key={i}>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            Error Loading Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-destructive font-semibold mb-2">{error}</div>
            <button
              className="px-4 py-2 rounded bg-muted text-foreground border border-input hover:bg-accent"
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted/20">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`${profile.username} avatar`}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-2xl font-semibold">
              {profile.username?.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <CardTitle className="text-xl font-bold">
          <Link href={`/admin/users/${profile.userId}`}>{profile.username}</Link>
        </CardTitle>
        <UserStatusBadge status={profile.status} />
        <span className="text-sm text-muted-foreground">{profile.role}</span>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">Email: </span>
          <span>{profile.email}</span>
        </div>
        <div className="flex items-center gap-1">
          <CoinsIcon className="w-4 h-4" />
          <span className="font-medium">{balance.toLocaleString()} CC</span>
        </div>
        <div>
          <span className="font-medium">Joined: </span>
          <span>{profile.createdAt ? formatDateTime(profile.createdAt) : '-'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
