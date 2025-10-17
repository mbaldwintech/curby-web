'use client';

import { AdminPageContainer, DeviceTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DevicesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Devices">
      <DeviceTable
        onRowClick={(device) => {
          router.push(`/admin/devices/${device.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (device) => {
              router.push(`/admin/devices/${device.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
