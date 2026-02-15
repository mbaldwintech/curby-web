'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, CopyableStringCell } from '@core/components';
import { ItemStatus, ItemType, ReviewStatus, ReviewTriggerType, UserRole } from '@core/enumerations';
import { ExtendedItemService, FalseTakingService, ItemReviewService, SavedItemService } from '@core/services';
import { ExtendedItem, FalseTaking, Item, SavedItem } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  EyeIcon,
  FileSearch2,
  FlagIcon,
  InfoIcon,
  MapPinIcon,
  PackageIcon,
  ShieldCheckIcon,
  UserIcon
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components';
import { useConfirmDialog } from '@core/providers';
import { ProfileCell } from '@features/users/components';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ItemStatusBadge } from './item-status-badge.component';
import { ItemTypeBadge } from './item-type-badge.component';
import { createLogger, formatDateTime } from '@core/utils';

const logger = createLogger('ItemDetails');

const itemSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title must be 100 characters or less' }),
  type: z.nativeEnum(ItemType),
  status: z.enum(ItemStatus),
  geoLocation: z.string().optional(),
  posterCurbyCoinCount: z.number().min(0),
  taken: z.boolean(),
  extendedCount: z.number().min(0).max(2)
});

type ItemFormValues = z.infer<typeof itemSchema>;

export interface ItemDetailsProps {
  id?: string | null;
}

export function ItemDetails({ id }: ItemDetailsProps) {
  const router = useRouter();
  const extendedItemService = useRef(createClientService(ExtendedItemService)).current;
  const savedItemService = useRef(createClientService(SavedItemService)).current;
  const falseTakingService = useRef(createClientService(FalseTakingService)).current;
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;

  const { user } = useAuth();
  const { profile: userProfile } = useProfile();

  const [item, setItem] = useState<ExtendedItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedByUsers, setSavedByUsers] = useState<SavedItem[]>([]);
  const [falseTakings, setFalseTakings] = useState<FalseTaking[]>([]);

  const formInstance = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      type: ItemType.Free,
      status: ItemStatus.Active,
      geoLocation: '',
      posterCurbyCoinCount: 0,
      taken: false,
      extendedCount: 0
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

  const isItemOwner = useMemo(() => user?.id === item?.postedBy, [user, item]);
  const isAdmin = useMemo(() => userProfile?.role === UserRole.Admin, [userProfile]);
  const isModerator = useMemo(() => userProfile?.role === UserRole.Moderator, [userProfile]);
  const canEdit = useMemo(() => isItemOwner || isAdmin, [isItemOwner, isAdmin]);

  const { open: openConfirmDialog } = useConfirmDialog();

  const loadItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Load item details
      const itemResult = await extendedItemService.getById(id);
      setItem(itemResult);

      // Reset form with loaded item data
      reset({
        title: itemResult.title || '',
        type: (itemResult.type as ItemType) || ItemType.Free,
        status: itemResult.status || ItemStatus.Active,
        geoLocation: itemResult.geoLocation || '',
        posterCurbyCoinCount: itemResult.posterCurbyCoinCount || 0,
        taken: itemResult.taken || false,
        extendedCount: itemResult.extendedCount || 0
      });

      // Load related data
      const savedData = await savedItemService.getAll({ column: 'itemId', operator: 'eq', value: id });
      setSavedByUsers(savedData);

      const falseTakingsData = await falseTakingService.getAll({ column: 'itemId', operator: 'eq', value: id });
      setFalseTakings(falseTakingsData);
    } catch (err) {
      logger.error('Failed to load item details', err);
      toast.error('Error fetching item details');
    } finally {
      setLoading(false);
    }
  }, [id, extendedItemService, savedItemService, falseTakingService, reset]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  // Save updates (admin or owner only)
  const onSubmit = useCallback(
    async (formData: ItemFormValues) => {
      if (!item || !id) return;

      // Security check: Only allow item owner or admin to edit
      if (!canEdit) {
        toast.error('You can only edit your own items');
        return;
      }

      setSaving(true);
      try {
        const updates: Partial<Item> = {
          title: formData.title,
          status: formData.status,
          posterCurbyCoinCount: formData.posterCurbyCoinCount,
          extendedCount: formData.extendedCount
        };

        // Only admins can update certain fields
        if (isAdmin) {
          updates.type = formData.type;
          updates.taken = formData.taken;
        }

        const updated = await extendedItemService.update(id, updates);
        setItem({ ...item, ...updated });
        reset(formData);
        toast.success('Item has been updated successfully!');
      } catch (err) {
        logger.error('Failed to save item', err);
        toast.error('Error saving item');
      } finally {
        setSaving(false);
      }
    },
    [id, item, extendedItemService, reset, canEdit, isAdmin]
  );

  const save = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const refresh = useCallback(async () => {
    await loadItem();
  }, [loadItem]);

  return (
    <div className="@container/main flex flex-1 flex-col p-4 md:p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
            {item?.media?.[0]?.url ? (
              <Image
                src={item.media[0].url}
                alt={item.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <PackageIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{item?.title ?? 'Loading...'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <ItemStatusBadge status={item?.status} />
              <ItemTypeBadge type={item?.type} />
            </div>
            {/* Item Status Subtext */}
            {item && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" />
                  <ProfileCell userId={item.postedBy} className="text-sm py-0 h-auto" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    <span>Posted {formatDateTime(new Date(item.createdAt))}</span>
                  </div>
                  {item.taken && (
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">
                        Taken {item.takenAt ? formatDateTime(new Date(item.takenAt)) : ''}
                      </span>
                    </div>
                  )}
                  {!item.taken && (
                    <div className="flex items-center gap-1">
                      <CircleAlertIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-600 dark:text-amber-400">
                        Expires {formatDateTime(new Date(item.expiresAt))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          {canEdit && formInstance.formState.isDirty && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
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

          {item && (isAdmin || isModerator) && (
            <Button
              variant="outline"
              onClick={() => {
                openConfirmDialog({
                  title: 'Launch Item Review',
                  message: `Are you sure you want to launch an item review for ${item?.title}?`,
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
                    if (!item) return;
                    itemReviewService
                      .create({
                        itemId: item.id,
                        triggerType: ReviewTriggerType.Manual,
                        triggerReason: data.reason || 'No reason provided',
                        triggerData: {},
                        status: ReviewStatus.Pending,
                        appealable: true
                      })
                      .then((newReview) => {
                        router.push(`/admin/moderation/item-reviews/${newReview.id}`);
                      });
                  }
                });
              }}
              className="min-w-[120px]"
              disabled={!item}
            >
              <FileSearch2 className="w-4 h-4 mr-2" />
              Launch Review
            </Button>
          )}

          {canEdit ? (
            <Button
              onClick={save}
              disabled={!item || saving || !formInstance.formState.isDirty || !formInstance.formState.isValid}
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
            <CardTitle>Item ID required</CardTitle>
          </CardHeader>
          <CardContent>An item ID is required to load item details.</CardContent>
        </Card>
      )}

      {item && !canEdit && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <EyeIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Viewing Item</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You can view this item but cannot make changes. Only the owner and admins can edit items.
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
                    <div className="w-28 h-28 rounded-lg bg-muted animate-pulse" />
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
          </div>
        </div>
      )}

      {!loading && !item && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 p-6">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <CircleAlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Item Not Found</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                The item with ID{' '}
                <code className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono">{id}</code>{' '}
                could not be found. This item may not exist or you may not have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {item && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: item info + media */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Item Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">Basic item information and media</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Main item image */}
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted/20">
                  {item.media?.[0]?.url ? (
                    <Image
                      src={item.media[0].url}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <PackageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    readOnly={!canEdit}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.title && (
                    <p id="title-error" className="text-sm text-red-500 mt-1" role="alert">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type
                  </Label>
                  {isAdmin ? (
                    <Select
                      onValueChange={(v) => setValue('type', v as ItemType, { shouldDirty: true })}
                      value={watch('type')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ItemType.Free}>Free</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={watch('type')} readOnly />
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  {canEdit ? (
                    <Select
                      onValueChange={(v) => setValue('status', v as ExtendedItem['status'], { shouldDirty: true })}
                      value={watch('status')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="extended">Extended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="restored">Restored</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={watch('status')} readOnly />
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="posterCurbyCoinCount" className="text-sm font-medium">
                    Poster Curby Coin Count
                  </Label>
                  <Input
                    id="posterCurbyCoinCount"
                    type="number"
                    {...register('posterCurbyCoinCount', { valueAsNumber: true })}
                    readOnly={!isAdmin}
                    className={errors.posterCurbyCoinCount ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.posterCurbyCoinCount && (
                    <p className="text-sm text-red-500 mt-1" role="alert">
                      {errors.posterCurbyCoinCount.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="extendedCount" className="text-sm font-medium">
                    Extended Count
                  </Label>
                  <Input
                    id="extendedCount"
                    type="number"
                    min="0"
                    max="2"
                    {...register('extendedCount', { valueAsNumber: true })}
                    readOnly={!canEdit}
                    className={errors.extendedCount ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.extendedCount && (
                    <p className="text-sm text-red-500 mt-1" role="alert">
                      {errors.extendedCount.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle column: item metadata */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  Item Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">Detailed information about this item</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Posted By</div>
                  <ProfileCell userId={item.postedBy} className="text-sm py-0 h-auto text-card-foreground" />
                  <div className="text-xs text-muted-foreground">
                    {item.createdAt ? formatDateTime(new Date(item.createdAt)) : '-'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="text-sm">{item.geoLocation || 'Not specified'}</div>
                  <div className="text-xs text-muted-foreground">GeoLocation (WKT format)</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Taken Status</div>
                  <div className="text-sm">
                    {item.taken ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="w-3 h-3" />
                        Taken
                        {item.takenBy && (
                          <>
                            {' by '}
                            <ProfileCell userId={item.takenBy} className="text-sm py-0 h-auto" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <CircleAlertIcon className="w-3 h-3" />
                        Available
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.taken && item.takenAt ? formatDateTime(new Date(item.takenAt)) : 'Available for taking'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Expiration</div>
                  <div className="text-sm">{formatDateTime(new Date(item.expiresAt))}</div>
                  <div className="text-xs text-muted-foreground">
                    Extended {item.extendedCount} time{item.extendedCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Item ID</div>
                  <CopyableStringCell value={item.id} className="text-sm break-all" />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Reports</div>
                  <div className="text-sm">
                    {item.reportedCount || 0} report{item.reportedCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {item.taken && item.confirmedTakenAt && (
                  <div>
                    <div className="text-xs text-muted-foreground">Confirmed Taken</div>
                    <div className="text-sm">{formatDateTime(new Date(item.confirmedTakenAt))}</div>
                  </div>
                )}

                {savedByUsers.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground">Saved by Users</div>
                    <div className="text-sm">
                      {savedByUsers.length} user{savedByUsers.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Location: {item?.location?.coordinates?.[1]?.toFixed(6)},{' '}
                  {item?.location?.coordinates?.[0].toFixed(6)}
                </p>
              </CardHeader>
              <CardContent>
                {/* {item.location && <ItemLocationMap location={item.location} containerClassName="h-64" />} */}
              </CardContent>
            </Card>

            {isAdmin && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Admin Data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Information only visible to admins for moderation and support purposes
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Created</div>
                        <div className="text-sm">{formatDateTime(new Date(item.createdAt))}</div>
                        <div className="text-xs text-muted-foreground">System generated</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Last Updated</div>
                        <div className="text-sm">
                          {item.updatedAt ? formatDateTime(new Date(item.updatedAt)) : 'Never'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">GeoLocation (Raw)</div>
                        <CopyableStringCell value={item.geoLocation || 'Not set'} className="text-xs break-all" />
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Feed Score</div>
                        <div className="text-sm">{item.feedScore || 'Not calculated'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {falseTakings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">False Takings</CardTitle>
                        <div className="text-sm text-muted-foreground mb-2">False takings reported for this item</div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {falseTakings.map((ft) => (
                            <div key={ft.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FlagIcon className="w-4 h-4 text-red-500" />
                                <div>
                                  <ProfileCell userId={ft.takerId} />
                                  <div className="text-xs text-muted-foreground">
                                    {formatDateTime(new Date(ft.takenAt))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
