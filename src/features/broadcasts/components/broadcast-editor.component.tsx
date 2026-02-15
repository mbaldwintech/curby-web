import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ColorEditor,
  EditableField,
  Input,
  Label,
  LinkButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@core/components';
import { BroadcastMediaType } from '@core/enumerations';
import { BroadcastService, MediaService } from '@core/services';
import { Broadcast, IconProps, ImageProps, LottieProps, MediaProps } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { ArrowRight, FileJson, Image as ImageIcon, Settings as SettingsIcon, Sparkles, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoDesktopOutline, IoPhonePortraitOutline, IoTabletPortraitOutline } from 'react-icons/io5';
import { BroadcastMedia } from './broadcast-media.component';
import { cn, createLogger } from '@core/utils';

const logger = createLogger('BroadcastEditor');

const MediaEditor = ({
  broadcast,
  onMediaChange,
  onClose
}: {
  broadcast: Broadcast;
  onMediaChange: (updates: Partial<Broadcast>) => Promise<void>;
  onClose: () => void;
}) => {
  const mediaService = useRef(createClientService(MediaService)).current;
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Local state for all media fields
  const [mediaType, setMediaType] = useState<BroadcastMediaType | null>(broadcast.mediaType ?? null);
  const [mediaId, setMediaId] = useState<string | null>(broadcast.mediaId ?? null);
  const [newMediaId, setNewMediaId] = useState<string | null>(null); // Track newly uploaded media
  const [mediaProps, setMediaProps] = useState<MediaProps>(broadcast.mediaProps || {});
  const [useMediaInNotification, setUseMediaInNotification] = useState(broadcast.useMediaInNotification || false);
  const [mediaPropsText, setMediaPropsText] = useState('');
  const [mediaPropsError, setMediaPropsError] = useState<string | null>(null);
  const [advancedEditing, setAdvancedEditing] = useState(false);

  // Initialize state when broadcast changes
  useEffect(() => {
    setMediaType(broadcast.mediaType ?? null);
    setMediaId(broadcast.mediaId ?? null);
    setNewMediaId(null);
    setMediaProps(broadcast.mediaProps || {});
    setUseMediaInNotification(broadcast.useMediaInNotification || false);
    if (broadcast.mediaProps && typeof broadcast.mediaProps === 'object') {
      setMediaPropsText(JSON.stringify(broadcast.mediaProps, null, 2));
    } else {
      setMediaPropsText('');
    }
    setMediaPropsError(null);
  }, [broadcast]);

  const handleMediaUpload = useCallback(
    async (type: BroadcastMediaType) => {
      // If there's a previously uploaded media that hasn't been saved, delete it
      if (newMediaId) {
        try {
          await mediaService.remove(newMediaId);
        } catch (error) {
          logger.error('Failed to delete previous new media file:', error);
        }
      }

      // For Icon type, just set the media type and show configuration
      if (type === BroadcastMediaType.Icon) {
        setMediaType(type);
        setMediaId(null);
        setNewMediaId(null);
        const props: IconProps = {
          lib: 'MaterialCommunityIcons',
          name: 'bell',
          size: 64,
          color: '#000000',
          style: {},
          containerStyle: {}
        };
        setMediaProps(props);
        setMediaPropsText(JSON.stringify(props, null, 2));
        setAdvancedEditing(false);
        return;
      }

      setUploadingMedia(true);
      try {
        let file: File | null = null;

        if (type === BroadcastMediaType.Image) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          file = await new Promise<File | null>((resolve) => {
            input.onchange = (e: Event) => {
              const target = e.target as HTMLInputElement;
              resolve(target.files?.[0] || null);
            };
            input.click();
          });
        } else if (type === BroadcastMediaType.Lottie) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/json,.json';
          file = await new Promise<File | null>((resolve) => {
            input.onchange = (e: Event) => {
              const target = e.target as HTMLInputElement;
              resolve(target.files?.[0] || null);
            };
            input.click();
          });
        }

        if (!file) {
          setUploadingMedia(false);
          return;
        }

        const extension = file.name.split('.').pop() || '';
        const path = `broadcasts/${crypto.randomUUID()}_${file.name}`;

        const [media] = await mediaService.upload({ file, path, extension }, false);

        setNewMediaId(media.id);
        setMediaId(media.id);
        setMediaType(type);
        if (type === BroadcastMediaType.Image) {
          const props: ImageProps = {
            width: 200,
            height: 200,
            contentFit: 'contain',
            style: {},
            containerStyle: {
              borderRadius: 0
            }
          };
          setMediaProps(props);
          setMediaPropsText(JSON.stringify(props, null, 2));
          setAdvancedEditing(false);
        } else {
          const props: LottieProps = {
            width: 200,
            height: 200,
            style: {},
            containerStyle: {}
          };
          setMediaProps(props);
          setMediaPropsText(JSON.stringify(props, null, 2));
          setAdvancedEditing(false);
        }
      } catch (error) {
        logger.error('Failed to upload media:', error);
      } finally {
        setUploadingMedia(false);
      }
    },
    [mediaService, newMediaId]
  );

  const handleRemoveMedia = useCallback(async () => {
    // If there's a newly uploaded media that hasn't been saved, delete it immediately
    if (newMediaId) {
      try {
        await mediaService.remove(newMediaId);
      } catch (error) {
        logger.error('Failed to delete new media file:', error);
      }
    }

    setMediaId(null);
    setNewMediaId(null);
    setMediaType(null);
    setMediaProps({});
    setUseMediaInNotification(false);
    setMediaPropsText('');
    setAdvancedEditing(false);
  }, [newMediaId, mediaService]);

  // Sync mediaPropsText when mediaProps changes (for Icon type)
  useEffect(() => {
    if (mediaType === BroadcastMediaType.Icon && mediaProps) {
      setMediaPropsText(JSON.stringify(mediaProps, null, 2));
    }
  }, [mediaProps, mediaType]);

  const updateMediaPropsJSON = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      setMediaPropsText(JSON.stringify(parsed, null, 2));
      setMediaProps(parsed);
      setMediaPropsError(null);
    } catch (error) {
      setMediaPropsError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }, []);

  const handleSave = async () => {
    // Validate JSON before saving
    if (mediaPropsError) {
      return;
    }

    // Delete old media if it's being replaced
    if (broadcast.mediaId && newMediaId && broadcast.mediaId !== newMediaId) {
      try {
        await mediaService.remove(broadcast.mediaId);
      } catch (error) {
        logger.error('Failed to delete old media file:', error);
      }
    }

    // Save the changes
    await onMediaChange({
      mediaType,
      mediaId,
      mediaProps,
      useMediaInNotification
    });

    onClose();
  };

  const handleCancel = async () => {
    // If there's a newly uploaded media that wasn't saved, delete it
    if (newMediaId && newMediaId !== broadcast.mediaId) {
      try {
        await mediaService.remove(newMediaId);
      } catch (error) {
        logger.error('Failed to delete unsaved media file:', error);
      }
    }

    onClose();
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Media Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Media Type</Label>
          <div className="grid grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={mediaType === BroadcastMediaType.Image ? 'default' : 'outline'}
                  onClick={() => handleMediaUpload(BroadcastMediaType.Image)}
                  disabled={uploadingMedia}
                >
                  <ImageIcon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Image</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={mediaType === BroadcastMediaType.Lottie ? 'default' : 'outline'}
                  onClick={() => handleMediaUpload(BroadcastMediaType.Lottie)}
                  disabled={uploadingMedia}
                >
                  <FileJson className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lottie Animation</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={mediaType === BroadcastMediaType.Icon ? 'default' : 'outline'}
                  onClick={async () => {
                    await handleMediaUpload(BroadcastMediaType.Icon);
                  }}
                  disabled={uploadingMedia}
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Icon</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {mediaId && (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-green-500">
                <Upload className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Media uploaded successfully
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveMedia}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="relative">
          <div className="flex flex-col max-h-96 overflow-y-auto gap-4 pr-2">
            {mediaId && mediaType === BroadcastMediaType.Image && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced-image" className="font-medium">
                    Advanced Editor
                  </Label>
                  <Switch
                    id="advanced-image"
                    checked={advancedEditing}
                    onCheckedChange={(checked) => setAdvancedEditing(checked)}
                  />
                </div>
                {advancedEditing && (
                  <div className="space-y-2">
                    <Label className="font-medium">JSON Configuration</Label>
                    <Textarea
                      value={mediaPropsText}
                      onChange={(e) => setMediaPropsText(e.target.value)}
                      onBlur={() => updateMediaPropsJSON(mediaPropsText)}
                      placeholder='{\n  "width": 200,\n  "height": 200\n}'
                      rows={6}
                      className="font-mono text-xs"
                    />
                    {mediaPropsError && <p className="text-xs text-destructive mt-1">{mediaPropsError}</p>}
                  </div>
                )}
                {!advancedEditing && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="image-width" className="font-medium">
                          Width (px)
                        </Label>
                        <Input
                          id="image-width"
                          type="number"
                          value={mediaProps?.width || 200}
                          onChange={(e) =>
                            setMediaProps((prev) => ({
                              ...(prev || {}),
                              width: parseInt(e.target.value) || 200
                            }))
                          }
                          placeholder="200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image-height" className="font-medium">
                          Height (px)
                        </Label>
                        <Input
                          id="image-height"
                          type="number"
                          value={mediaProps?.height || 200}
                          onChange={(e) =>
                            setMediaProps((prev) => ({
                              ...(prev || {}),
                              height: parseInt(e.target.value) || 200
                            }))
                          }
                          placeholder="200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-radius" className="font-medium">
                        Border Radius (px)
                      </Label>
                      <Input
                        id="image-radius"
                        type="number"
                        value={(mediaProps?.containerStyle as { borderRadius?: number } | undefined)?.borderRadius || 0}
                        onChange={(e) =>
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            containerStyle: {
                              ...((prev?.containerStyle as Record<string, unknown> | undefined) || {}),
                              borderRadius: parseInt(e.target.value) || 0
                            }
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-fit" className="font-medium">
                        Content Fit
                      </Label>
                      <Select
                        value={mediaProps?.contentFit || 'contain'}
                        onValueChange={(value) =>
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            contentFit: value as MediaProps['contentFit']
                          }))
                        }
                      >
                        <SelectTrigger id="image-fit">
                          <SelectValue placeholder="Select fit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contain">Contain</SelectItem>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="fill">Fill</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="scale-down">Scale Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}
            {mediaType === BroadcastMediaType.Icon && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced-icon" className="font-medium">
                    Advanced Editor
                  </Label>
                  <Switch
                    id="advanced-icon"
                    checked={advancedEditing}
                    onCheckedChange={(checked) => setAdvancedEditing(checked)}
                  />
                </div>
                {advancedEditing && (
                  <div className="space-y-2">
                    <Label className="font-medium">JSON Configuration</Label>
                    <Textarea
                      value={mediaPropsText}
                      onChange={(e) => setMediaPropsText(e.target.value)}
                      onBlur={() => updateMediaPropsJSON(mediaPropsText)}
                      placeholder='{\n  "lib": "MaterialCommunityIcons",\n  "name": "bell",\n  "size": 64\n}'
                      rows={6}
                      className="font-mono text-xs"
                    />
                    {mediaPropsError && <p className="text-xs text-destructive mt-1">{mediaPropsError}</p>}
                  </div>
                )}
                {!advancedEditing && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="icon-lib" className="font-medium">
                          Icon Library
                        </Label>
                        <Select
                          value={mediaProps?.lib || 'MaterialCommunityIcons'}
                          onValueChange={(lib) =>
                            setMediaProps((prev) => ({
                              ...(prev || {}),
                              lib: lib as IconProps['lib']
                            }))
                          }
                        >
                          <SelectTrigger id="icon-lib">
                            <SelectValue placeholder="Select library" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MaterialIcons">Material Icons</SelectItem>
                            <SelectItem value="MaterialCommunityIcons">Material Community</SelectItem>
                            <SelectItem value="Ionicons">Ionicons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon-name" className="font-medium">
                          Icon Name
                        </Label>
                        <Input
                          id="icon-name"
                          value={mediaProps?.name}
                          onChange={(e) =>
                            setMediaProps((prev) => ({
                              ...(prev || {}),
                              name: e.target.value as IconProps['name']
                            }))
                          }
                          placeholder="e.g., bell"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon-size" className="font-medium">
                        Icon Size (px)
                      </Label>
                      <Input
                        id="icon-size"
                        type="number"
                        value={mediaProps?.size || 64}
                        onChange={(e) =>
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            size: parseInt(e.target.value) || 64
                          }))
                        }
                        placeholder="64"
                        className="w-32"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Icon Color</Label>
                      <ColorEditor
                        value={
                          (mediaProps?.color as string) ||
                          ((mediaProps?.style as Record<string, unknown> | undefined)?.color as string) ||
                          '#000000'
                        }
                        onChange={(color) => {
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            color: color,
                            style: {
                              ...((prev?.style as Record<string, unknown> | undefined) || {}),
                              color: color
                            }
                          }));
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            )}{' '}
            {mediaId && mediaType === BroadcastMediaType.Lottie && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced-lottie" className="font-medium">
                    Advanced Editor
                  </Label>
                  <Switch
                    id="advanced-lottie"
                    checked={advancedEditing}
                    onCheckedChange={(checked) => setAdvancedEditing(checked)}
                  />
                </div>
                {advancedEditing && (
                  <div className="w-full flex flex-col gap-2">
                    <span className="font-medium text-sm">Advanced Settings</span>
                    <Textarea
                      value={mediaPropsText}
                      onChange={(e) => setMediaPropsText(e.target.value)}
                      onBlur={() => updateMediaPropsJSON(mediaPropsText)}
                      placeholder='{\n  "width": 200,\n  "height": 200\n}'
                      rows={4}
                      className="font-mono text-xs"
                    />
                    {mediaPropsError && <p className="text-xs text-destructive">{mediaPropsError}</p>}
                  </div>
                )}
                {!advancedEditing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lottie-width" className="font-medium">
                        Width (px)
                      </Label>
                      <Input
                        id="lottie-width"
                        type="number"
                        value={mediaProps?.width || 200}
                        onChange={(e) =>
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            width: parseInt(e.target.value) || 200
                          }))
                        }
                        placeholder="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lottie-height" className="font-medium">
                        Height (px)
                      </Label>
                      <Input
                        id="lottie-height"
                        type="number"
                        value={mediaProps?.height || 200}
                        onChange={(e) =>
                          setMediaProps((prev) => ({
                            ...(prev || {}),
                            height: parseInt(e.target.value) || 200
                          }))
                        }
                        placeholder="200"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!mediaPropsError}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CTAEditor = ({
  broadcast,
  onCTAChange,
  onClose
}: {
  broadcast: Broadcast;
  onCTAChange: (updates: Partial<Broadcast>) => Promise<void>;
  onClose: () => void;
}) => {
  const [ctaLabel, setCtaLabel] = useState(broadcast.ctaLabel || '');
  const [actionType, setActionType] = useState<'url' | 'path'>(
    broadcast.ctaUrl && broadcast.ctaUrl.length > 0 ? 'url' : 'path'
  );
  const [ctaUrl, setCtaUrl] = useState(broadcast.ctaUrl || '');
  const [ctaPath, setCtaPath] = useState(broadcast.ctaPath || '');

  useEffect(() => {
    setCtaLabel(broadcast.ctaLabel || '');
    setCtaUrl(broadcast.ctaUrl || '');
    setCtaPath(broadcast.ctaPath || '');
  }, [broadcast.ctaLabel, broadcast.ctaUrl, broadcast.ctaPath]);

  const handleSave = async () => {
    await onCTAChange({ ctaLabel, ctaUrl, ctaPath });
    onClose();
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Call To Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cta-label" className="font-medium">
            Button Label
          </Label>
          <Input
            id="cta-label"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="e.g., Learn More"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Action Type</Label>
          <div className="flex flex-row bg-muted text-muted-foreground rounded-md overflow-hidden border-1 border-border w-fit">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActionType('url');
                    setCtaPath('');
                  }}
                  className={cn(
                    'flex items-center justify-center p-1 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                    actionType === 'url' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  Link
                </button>
              </TooltipTrigger>
              <TooltipContent>Use external link</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActionType('path');
                    setCtaUrl('');
                  }}
                  className={cn(
                    'flex items-center justify-center p-1 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground',
                    actionType === 'path' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  In-App Path
                </button>
              </TooltipTrigger>
              <TooltipContent>Use in-app path</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {actionType === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="cta-url" className="font-medium">
              External Link URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <LinkButton variant="outline" size="icon-sm" href={ctaUrl} target="_blank" rel="noopener noreferrer">
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        )}

        {actionType === 'path' && (
          <div className="space-y-2">
            <Label htmlFor="cta-path" className="font-medium">
              In-App Path
            </Label>
            <Input id="cta-path" value={ctaPath} onChange={(e) => setCtaPath(e.target.value)} placeholder="/app/home" />
          </div>
        )}

        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export interface BroadcastEditorProps {
  broadcast: Broadcast;
  refresh?: () => void;
}

export const BroadcastEditor = ({ broadcast, refresh }: BroadcastEditorProps) => {
  const broadcastService = useRef(createClientService(BroadcastService)).current;
  const mediaService = useRef(createClientService(MediaService)).current;

  const [includeMedia, setIncludeMedia] = useState(broadcast.mediaType !== null);
  const [mediaPopoverOpen, setMediaPopoverOpen] = useState(false);
  const [ctaPopoverOpen, setCtaPopoverOpen] = useState(false);

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const update = useCallback(
    async (updates: Partial<Broadcast>) => {
      try {
        await broadcastService.update(broadcast.id, updates);
        refresh?.();
      } catch (error) {
        logger.error('Failed to update broadcast:', error);
      }
    },
    [broadcast.id, broadcastService, refresh]
  );

  const handleRemoveMedia = useCallback(async () => {
    // Delete the media file from storage (only if there's a mediaId, icons don't have one)
    if (broadcast.mediaId) {
      try {
        await mediaService.remove(broadcast.mediaId);
      } catch (error) {
        logger.error('Failed to delete media file:', error);
      }
    }

    await update({ mediaId: null, mediaType: null, mediaProps: {}, useMediaInNotification: false });
  }, [broadcast.mediaId, mediaService, update]);

  return (
    <Card className="flex flex-1 flex-col gap-0 py-0">
      <CardHeader className="border-b py-6 flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <SettingsIcon className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-base">Content Editor</CardTitle>
      </CardHeader>
      <div className="flex-1 flex flex-row">
        <div className="p-4 flex flex-col justify-start gap-4 border-r-1 border-border min-w-[240px] bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dismissible" className="font-medium">
                Dismissible
              </Label>
              <Switch
                id="dismissible"
                checked={broadcast.isDismissible}
                onCheckedChange={(val) => {
                  update({ isDismissible: val });
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="include-media" className="font-medium">
                Include Media
              </Label>
              <Switch
                id="include-media"
                checked={includeMedia}
                onCheckedChange={async (val) => {
                  setIncludeMedia(val);
                  if (!val) {
                    await handleRemoveMedia();
                  }
                }}
              />
            </div>
            {includeMedia && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="media-in-notification" className="font-medium text-sm">
                    Show in Notification
                  </Label>
                  <Switch
                    id="media-in-notification"
                    checked={broadcast.useMediaInNotification || false}
                    onCheckedChange={(val) => update({ useMediaInNotification: val })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center p-6">
          <div className="absolute top-4 right-4 z-10">
            <div className="w-full flex justify-center mb-4">
              <div className="flex bg-muted text-muted-foreground rounded-md overflow-hidden border-1 border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('mobile')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                        deviceType === 'mobile' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoPhonePortraitOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('tablet')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                        deviceType === 'tablet' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoTabletPortraitOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('desktop')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground',
                        deviceType === 'desktop' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoDesktopOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="relative bg-background rounded-lg overflow-hidden shadow-xl">
            {/* Close Button */}
            {broadcast.isDismissible && (
              <button
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/60 flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            {/* Content */}
            <div
              className={cn(
                'p-2.75 flex flex-col items-center gap-1.5',
                deviceType === 'mobile' && 'max-w-[350px] max-h-[667px]',
                deviceType === 'tablet' && 'max-w-[768px] max-h-[1024px]',
                deviceType === 'desktop' && 'max-w-[1024px] max-h-[768px]'
              )}
            >
              {/* Media */}
              {includeMedia && (
                <Popover open={mediaPopoverOpen} onOpenChange={setMediaPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'rounded-md border-1 border-transparent hover:border-highlight hover:shadow-sm transition-all cursor-pointer overflow-hidden',
                        !broadcast.mediaId &&
                          broadcast.mediaType !== BroadcastMediaType.Icon &&
                          'border-dotted border-2 p-10 border-border text-muted-foreground'
                      )}
                    >
                      {(broadcast.mediaType === BroadcastMediaType.Icon || broadcast.mediaId) && (
                        <BroadcastMedia broadcast={broadcast} />
                      )}
                      {!broadcast.mediaId && broadcast.mediaType !== BroadcastMediaType.Icon && (
                        <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Click to add media</span>
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="center" className="w-[450px] p-0">
                    <MediaEditor
                      broadcast={broadcast}
                      onMediaChange={update}
                      onClose={() => setMediaPopoverOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Title */}
              <div className="w-full">
                <EditableField
                  value={broadcast.title}
                  onChange={(newValue) => update({ title: newValue })}
                  className="text-[22px] font-bold text-center leading-tight"
                />
              </div>

              {/* Body */}
              <div className="w-full">
                <EditableField
                  value={broadcast.body}
                  onChange={(newValue) => update({ body: newValue })}
                  className="text-base leading-6 text-muted-foreground text-center"
                />
              </div>

              {/* Actions */}
              <div className="w-full flex flex-row justify-end gap-2 mt-2">
                {broadcast.isDismissible && (
                  <Button variant="ghost" className="text-primary">
                    Got it
                  </Button>
                )}
                {broadcast.ctaLabel && (
                  <Popover open={ctaPopoverOpen} onOpenChange={setCtaPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="default"
                        className="border-1 border-transparent hover:border-highlight hover:shadow-sm transition-all cursor-pointer"
                      >
                        {broadcast.ctaLabel}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-[400px] p-0">
                      <CTAEditor broadcast={broadcast} onCTAChange={update} onClose={() => setCtaPopoverOpen(false)} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
