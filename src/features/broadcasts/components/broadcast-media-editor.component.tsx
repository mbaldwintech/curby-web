import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ColorEditor,
  Input,
  Label,
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
import { MediaService } from '@core/services';
import { Broadcast, IconProps, ImageProps, LottieProps, MediaProps } from '@core/types';
import { createLogger } from '@core/utils';
import { createClientService } from '@supa/utils/client';
import { FileJson, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const logger = createLogger('MediaEditor');

export const MediaEditor = ({
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
