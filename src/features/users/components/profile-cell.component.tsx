'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  LinkButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@core/components';
import { CurbyCoinTransactionService, DeviceService, ProfileService, UserDeviceService } from '@core/services';
import { Device, Profile } from '@core/types';
import { cn } from '@core/utils';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const ProfileCell = ({ userId, className }: { userId?: string | null; className?: string }) => {
  const profileService = useRef(createClientService(ProfileService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const deviceService = useRef(createClientService(DeviceService)).current;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [curbyCoinCount, setCurbyCoinCount] = useState<number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (userId) {
      profileService
        .findByUserId(userId)
        .then((profile) => {
          if (profile !== null) {
            setProfile(profile);
            curbyCoinTransactionService
              .getOneOrNull({ column: 'userId', operator: 'eq', value: userId }, 'createdAt', false)
              .then((transaction) => {
                if (transaction) {
                  setCurbyCoinCount(transaction.balanceAfter);
                } else {
                  setCurbyCoinCount(0);
                }
              });
            userDeviceService.getAll({ column: 'userId', operator: 'eq', value: userId }).then((userDevices) => {
              if (userDevices.length === 0) {
                setDevices([]);
                return;
              }
              deviceService
                .getAll({ column: 'id', operator: 'in', value: userDevices.map((ud) => ud.deviceId) })
                .then((devices) => {
                  setDevices(devices);
                });
            });
          }
        })
        .catch(() => {
          setProfile(null);
        });
    } else {
      setProfile(null);
    }
  }, [userId, profileService, curbyCoinTransactionService, userDeviceService, deviceService]);

  if (!userId || !profile) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <LinkButton
          variant="link"
          href={`/admin/users/${profile.userId}`}
          onClick={(e) => e.stopPropagation()}
          className={cn('p-0', className)}
        >
          {profile.username}
        </LinkButton>
      </TooltipTrigger>
      <TooltipContent
        className="bg-secondary dark:bg-secondary shadow-lg rounded-lg p-3 w-56"
        arrowClassName="bg-secondary dark:bg-secondary fill-secondary dark:fill-secondary"
      >
        <div className="flex items-center gap-3 border-b border-muted dark:border-muted pb-2 mb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {profile.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold text-secondary-foreground leading-tight">{profile.username}</div>
            <div className="text-sm  text-secondary-foreground/50 leading-tight">
              Joined: {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {curbyCoinCount !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary-foreground/50">Curby Coins</span>
              <span className="font-medium text-secondary-foreground/75">{curbyCoinCount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-secondary-foreground/50">Devices</span>
            <span className="font-medium text-secondary-foreground/75">{devices.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-foreground/50">Last Active</span>
            <span className="font-medium text-secondary-foreground/75">
              {devices.length > 0
                ? new Date(
                    devices.map((d) => new Date(d.lastSeenAt).getTime()).reduce((a, b) => Math.max(a, b), 0)
                  ).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
