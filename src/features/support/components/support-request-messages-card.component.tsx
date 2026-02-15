'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Textarea
} from '@core/components';
import {
  SupportRequestMessageSenderType,
  SupportRequestMessageType,
  SupportRequestStatus,
  UserRole
} from '@core/enumerations';
import {
  DeviceService,
  ProfileService,
  SupportRequestMessageReadService,
  SupportRequestMessageService
} from '@core/services';
import { Device, Media, Profile, SupportRequest, SupportRequestMessage, SupportRequestMessageRead } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { ChevronDown, HeartHandshake } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn, createLogger } from '@core/utils';

const logger = createLogger('SupportRequestMessagesCard');

interface SupportRequestMessagesCardProps {
  supportRequest: SupportRequest;
}

export function SupportRequestMessagesCard({ supportRequest }: SupportRequestMessagesCardProps) {
  const { profile } = useProfile();
  const supportRequestMessageService = useRef(createClientService(SupportRequestMessageService)).current;
  const supportRequestMessageReadService = useRef(createClientService(SupportRequestMessageReadService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const deviceService = useRef(createClientService(DeviceService)).current;

  const [messages, setMessages] = useState<(SupportRequestMessage & { media?: Media[] })[]>([]);
  const [messageReads, setMessageReads] = useState<Record<string, SupportRequestMessageRead[]>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedMessageType, setSelectedMessageType] = useState<SupportRequestMessageType>(
    SupportRequestMessageType.Reply
  );
  const [focusedMsgId, setFocusedMsgId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supportRequest.id) {
      setError('No support request ID provided.');
      setLoading(false);
      return;
    }
    let unsubscribe: (() => void) | null = null;

    try {
      setLoading(true);
      setError(null);

      const msgs = await supportRequestMessageService.getMessagesBySupportRequestId(supportRequest.id);
      setMessages(msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const { userIds, deviceIds } = msgs.reduce(
        (acc, m) => {
          if (m.senderType === SupportRequestMessageSenderType.User && m.senderId) {
            acc.userIds.add(m.senderId);
          } else if (m.senderType === SupportRequestMessageSenderType.Device && m.senderId) {
            acc.deviceIds.add(m.senderId);
          }
          return acc;
        },
        { userIds: new Set<string>(), deviceIds: new Set<string>() }
      );
      const profilesArray =
        userIds.size > 0
          ? await profileService.getAll([{ column: 'userId', operator: 'in', value: Array.from(userIds) }])
          : [];
      const devicesArray =
        deviceIds.size > 0
          ? await deviceService.getAll([{ column: 'id', operator: 'in', value: Array.from(deviceIds) }])
          : [];

      const profileMap = profilesArray.reduce(
        (acc, p) => {
          acc[p.userId] = p;
          return acc;
        },
        {} as Record<string, Profile>
      );
      setProfiles(profileMap);

      const deviceMap = devicesArray.reduce(
        (acc, d) => {
          acc[d.id] = d;
          return acc;
        },
        {} as Record<string, Device>
      );
      setDevices(deviceMap);

      // Load read receipts for all messages
      const messageIds = msgs.map((m) => m.id);
      if (messageIds.length > 0) {
        const reads = await supportRequestMessageReadService.getAll([
          { column: 'messageId', operator: 'in', value: messageIds }
        ]);
        const readsByMessageId = reads.reduce(
          (acc, read) => {
            if (!acc[read.messageId]) acc[read.messageId] = [];
            acc[read.messageId].push(read);
            return acc;
          },
          {} as Record<string, SupportRequestMessageRead[]>
        );
        setMessageReads(readsByMessageId);

        // Subscribe to new read receipts
        const unsubscribeReads = supportRequestMessageReadService.subscribeToReads(messageIds, (newRead) => {
          setMessageReads((prev) => ({
            ...prev,
            [newRead.messageId]: [...(prev[newRead.messageId] || []), newRead]
          }));
        });

        // Combine unsubscribe functions
        const messageUnsubscribe = supportRequestMessageService.subscribeToMessages(supportRequest.id, (newMsg) => {
          if (
            newMsg.senderType === SupportRequestMessageSenderType.User &&
            newMsg.senderId &&
            !profileMap[newMsg.senderId]
          ) {
            profileService.findByUserId(newMsg.senderId).then((p) => {
              setProfiles((prev) => ({ ...prev, [p.userId]: p }));
            });
          } else if (
            newMsg.senderType === SupportRequestMessageSenderType.Device &&
            newMsg.senderId &&
            !deviceMap[newMsg.senderId]
          ) {
            deviceService.getById(newMsg.senderId).then((d) => {
              setDevices((prev) => ({ ...prev, [d.id]: d }));
            });
          }
          setMessages((prev) => {
            // avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        });

        unsubscribe = () => {
          messageUnsubscribe();
          unsubscribeReads();
        };
      } else {
        unsubscribe = supportRequestMessageService.subscribeToMessages(supportRequest.id, (newMsg) => {
          if (
            newMsg.senderType === SupportRequestMessageSenderType.User &&
            newMsg.senderId &&
            !profileMap[newMsg.senderId]
          ) {
            profileService.findByUserId(newMsg.senderId).then((p) => {
              setProfiles((prev) => ({ ...prev, [p.userId]: p }));
            });
          } else if (
            newMsg.senderType === SupportRequestMessageSenderType.Device &&
            newMsg.senderId &&
            !deviceMap[newMsg.senderId]
          ) {
            deviceService.getById(newMsg.senderId).then((d) => {
              setDevices((prev) => ({ ...prev, [d.id]: d }));
            });
          }
          setMessages((prev) => {
            // avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        });
      }
    } catch (err) {
      logger.error('Failed to load support request:', err);
      setError('Failed to load support request.');
    } finally {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    supportRequest.id,
    supportRequestMessageService,
    supportRequestMessageReadService,
    profileService,
    deviceService
  ]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim()) return;
    try {
      const msg = await supportRequestMessageService.sendMessage({
        supportRequestId: supportRequest.id,
        message: newMessage.trim(),
        messageType: selectedMessageType
      });
      setMessages((prev) =>
        [...prev, msg].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      setNewMessage('');
    } catch (err) {
      logger.error('Failed to send message:', err);
    }
  }, [supportRequest, newMessage, selectedMessageType, supportRequestMessageService]);

  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!profile) return;

      // Check if already marked as read by this user
      const existingReads = messageReads[messageId] || [];
      const alreadyRead = existingReads.some((read) => read.userId === profile.userId);

      if (alreadyRead) return;

      try {
        const read = await supportRequestMessageReadService.create({
          messageId,
          userId: profile.userId,
          readAt: new Date().toISOString()
        });

        setMessageReads((prev) => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), read]
        }));
      } catch (err) {
        logger.error('Failed to mark message as read:', err);
      }
    },
    [profile, messageReads, supportRequestMessageReadService]
  );

  // Auto-mark messages as read when they come into view
  useEffect(() => {
    if (!profile || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              markMessageAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.5 } // Mark as read when 50% visible
    );

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, profile, markMessageAsRead]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    refresh().then((unsub) => {
      unsubscribe = unsub;
    });
    return () => {
      unsubscribe?.();
    };
  }, [refresh]);

  const isAdmin = profile?.role === UserRole.Admin;

  return (
    <Card className="flex flex-col min-h-0 min-w-0 overflow-hidden pb-0">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>

      {/* CardContent fills the available height */}
      <CardContent className="flex flex-1 flex-col h-full min-h-0 min-w-0 overflow-hidden p-0">
        {loading ? (
          <div className="flex flex-1 items-center justify-center min-h-[200px]">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center min-h-[200px] p-4">
            <div className="text-center space-y-2">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable messages container fills available height, scrolls if needed */}
            <div className="flex flex-col-reverse flex-1 min-h-100 min-w-0 max-h-150 h-full overflow-y-auto border-t border-input bg-background/80 p-4 space-y-4">
              {messages
                .reduce(
                  (acc, msg) => {
                    if (!msg.message && (!msg.media || msg.media.length === 0)) {
                      return acc; // skip empty messages
                    }
                    if (acc.length === 0) {
                      acc.push([msg]);
                    } else if (
                      msg.messageType !== SupportRequestMessageType.Reply &&
                      msg.messageType !== SupportRequestMessageType.InternalNote
                    ) {
                      // System messages are not grouped
                      acc.push([msg]);
                    } else {
                      const lastGroup = acc[acc.length - 1];
                      const lastMsg = lastGroup[lastGroup.length - 1];
                      if (
                        lastMsg.messageType !== SupportRequestMessageType.Reply &&
                        lastMsg.messageType !== SupportRequestMessageType.InternalNote
                      ) {
                        acc.push([msg]);
                        return acc;
                      }
                      const timeDiff = new Date(msg.createdAt).getTime() - new Date(lastMsg.createdAt).getTime();
                      // If same sender and within 5 minutes, group together
                      if (
                        msg.senderId === lastMsg.senderId &&
                        msg.senderType === lastMsg.senderType &&
                        timeDiff <= 5 * 60 * 1000
                      ) {
                        lastGroup.push(msg);
                      } else {
                        acc.push([msg]);
                      }
                    }
                    return acc;
                  },
                  [] as Array<Array<SupportRequestMessage & { media?: Media[] }>>
                )
                .map((group, groupIdx) => {
                  const firstMsg = group[0];
                  const senderProfile =
                    firstMsg.senderId && firstMsg.senderType === SupportRequestMessageSenderType.User
                      ? profiles[firstMsg.senderId]
                      : undefined;
                  const senderDevice =
                    firstMsg.senderId && firstMsg.senderType === SupportRequestMessageSenderType.Device
                      ? devices[firstMsg.senderId]
                      : undefined;
                  const isCurrentUser =
                    profile &&
                    firstMsg.senderType === SupportRequestMessageSenderType.User &&
                    firstMsg.senderId === profile.userId;
                  const isSupport =
                    senderProfile &&
                    (senderProfile.role === UserRole.Support || senderProfile.role === UserRole.Admin) &&
                    senderProfile.userId !== supportRequest.userId;

                  // Handle system messages (status changes, assignment changes)
                  const isSystemMessage =
                    firstMsg.messageType === SupportRequestMessageType.StatusChange ||
                    firstMsg.messageType === SupportRequestMessageType.AssignmentChange;

                  if (isSystemMessage) {
                    return (
                      <div key={firstMsg.id + '-' + groupIdx} className="flex justify-center my-2">
                        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
                          {firstMsg.message}
                          {' • '}
                          {(() => {
                            if (!firstMsg.createdAt) return '';
                            const d =
                              typeof firstMsg.createdAt === 'string'
                                ? new Date(firstMsg.createdAt)
                                : firstMsg.createdAt;
                            if (!d || isNaN(d.getTime())) return '';
                            if (d.toDateString() === new Date().toDateString()) {
                              return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                            } else {
                              return d.toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            }
                          })()}
                        </div>
                      </div>
                    );
                  }

                  // Handle internal notes
                  const isInternalNote = firstMsg.messageType === SupportRequestMessageType.InternalNote;

                  return (
                    <div
                      key={firstMsg.id + '-' + groupIdx}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar/Initials (only once per group, left side) */}
                      {!isCurrentUser && (
                        <div className="self-end flex flex-col items-center mr-2">
                          {senderProfile?.avatarUrl ? (
                            <Image
                              src={senderProfile.avatarUrl}
                              alt={senderProfile.username || 'User'}
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8 object-cover"
                            />
                          ) : senderDevice ? (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {senderDevice?.deviceId ? senderDevice.deviceId.charAt(0).toUpperCase() : '?'}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {senderProfile?.username ? senderProfile.username.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={cn('w-full min-w-0 flex flex-col mb-2', isCurrentUser ? 'items-end' : 'items-start')}
                      >
                        {/* Username (only once per group, left side) */}
                        {!isCurrentUser && (
                          <div className="flex items-center gap-2 mb-1 ml-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {senderProfile
                                ? `${senderProfile.username} (${isAdmin ? 'Admin' : isSupport ? 'Support' : 'User'})`
                                : senderDevice
                                  ? `${senderDevice.deviceId} (Device)`
                                  : isSupport
                                    ? 'Support'
                                    : 'User'}
                            </span>
                            {isInternalNote && (
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                (Internal Note)
                              </span>
                            )}
                          </div>
                        )}
                        {/* Render all messages in the group */}
                        {group
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map((msg, idx) => {
                            const isLast = idx === group.length - 1;
                            const showTimestamp = isLast || focusedMsgId === msg.id;
                            const isMsgInternalNote = msg.messageType === SupportRequestMessageType.InternalNote;
                            const msgReads = messageReads[msg.id] || [];
                            const readCount = msgReads.length;
                            const isReadByCurrentUser =
                              profile && msgReads.some((read) => read.userId === profile.userId);
                            return (
                              <div key={msg.id} className="max-w-[70%] min-w-0 mb-1 last:mb-0" data-message-id={msg.id}>
                                <div
                                  className={cn(
                                    'rounded-xl px-3 py-1.5 min-w-0 text-sm whitespace-pre-line shadow-sm focus:outline-none focus:ring-2 focus:ring-ring',
                                    isMsgInternalNote
                                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800'
                                      : isCurrentUser
                                        ? 'bg-primary text-primary-foreground border border-primary/20'
                                        : isSupport
                                          ? 'bg-secondary text-secondary-foreground border border-secondary/20'
                                          : 'bg-muted/50 text-foreground border border-muted/30',
                                    isCurrentUser && idx === group.length - 1 ? 'rounded-br-xs' : '',
                                    !isCurrentUser && idx === group.length - 1 ? 'rounded-bl-xs' : ''
                                  )}
                                  tabIndex={0}
                                  onFocus={() => setFocusedMsgId(msg.id)}
                                  onBlur={() => setFocusedMsgId((prev) => (prev === msg.id ? null : prev))}
                                >
                                  {msg.message}
                                  {msg.media && msg.media.length > 0 && (
                                    <div
                                      className={cn(
                                        'w-full flex flex-row gap-2 overflow-x-auto whitespace-nowrap',
                                        msg.message?.length > 0 ? 'mt-2' : ''
                                      )}
                                    >
                                      {msg.media.map((m) => (
                                        <div
                                          key={m.id}
                                          className="w-24 h-24 relative rounded overflow-hidden bg-muted flex-shrink-0"
                                        >
                                          <Image src={m.url} alt={m.filename} fill className="object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {showTimestamp && (
                                    <div
                                      className={cn(
                                        'flex text-xs mt-1',
                                        isMsgInternalNote
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-primary-foreground/75',
                                        isCurrentUser ? 'justify-end' : 'justify-start'
                                      )}
                                    >
                                      {(() => {
                                        if (!msg.createdAt) return;
                                        const d =
                                          typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt;
                                        if (!d || isNaN(d.getTime())) return;
                                        // If the date is today, show time only, else show date and time
                                        if (d.toDateString() === new Date().toDateString()) {
                                          return d.toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          });
                                        } else {
                                          return d.toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          });
                                        }
                                      })()}
                                    </div>
                                  )}
                                  {showTimestamp && isCurrentUser && readCount > 0 && (
                                    <div
                                      className={cn(
                                        'flex items-center gap-1 text-xs mt-1',
                                        isMsgInternalNote
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-primary-foreground/75',
                                        'justify-end'
                                      )}
                                    >
                                      <span>{readCount === 1 ? 'Read' : `Read by ${readCount}`}</span>
                                      {isReadByCurrentUser && <span>✓</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Fixed footer (send message bar) */}
            <div className="border-t border-input bg-background/95 rounded-b-lg p-3 flex gap-2 items-end shrink-0">
              <Textarea
                className="w-full resize-none min-h-10"
                rows={1}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      handleSend();
                    }
                  }
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shrink-0 h-10">
                    {selectedMessageType === SupportRequestMessageType.Reply ? 'Reply' : 'Internal Note'}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => setSelectedMessageType(SupportRequestMessageType.Reply)}
                      className="cursor-pointer"
                    >
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSelectedMessageType(SupportRequestMessageType.InternalNote)}
                      className="cursor-pointer"
                    >
                      Internal Note
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleSend}
                disabled={
                  !newMessage.trim() ||
                  (selectedMessageType === SupportRequestMessageType.Reply &&
                    supportRequest.status !== SupportRequestStatus.InProgress)
                }
                className="shrink-0 h-10"
              >
                Send
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
