'use client';

import { Button, LinkButton, Tooltip, TooltipContent, TooltipTrigger } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { CopyIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DeviceService } from '../../services';
import { Device } from '../../types';

export const DeviceCell = ({ deviceId }: { deviceId?: string | null }) => {
  const deviceService = useRef(createClientService(DeviceService)).current;
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (deviceId) {
      deviceService
        .getByIdOrNull(deviceId)
        .then((device) => {
          if (device !== null) {
            setDevice(device);
          }
        })
        .catch(() => {
          setDevice(null);
        });
    } else {
      setDevice(null);
    }
  }, [deviceId, deviceService]);

  if (!deviceId || !device) {
    return null;
  }

  return (
    <div className="w-32 flex items-center">
      <Tooltip>
        <TooltipTrigger className="w-full">
          <LinkButton
            variant="link"
            href={`/admin/devices/${device.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-0 w-full"
          >
            <p className="truncate w-full overflow-hidden whitespace-nowrap">{device.deviceId}</p>
          </LinkButton>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-all">{device.deviceId}</p>
        </TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="sm"
        className="ml-2 shrink-0 opacity-50 hover:opacity-100"
        onClick={() => {
          if (device.deviceId) {
            navigator.clipboard.writeText(device.deviceId);
          }
        }}
      >
        <CopyIcon size="xs" />
      </Button>
    </div>
  );
};
