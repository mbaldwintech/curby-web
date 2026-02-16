'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { SupportRequestMessageSenderType, SupportRequestMessageType, UserRole } from '@core/enumerations';
import {
  DeviceService,
  ProfileService,
  SupportRequestMessageReadService,
  SupportRequestMessageService
} from '@core/services';
import { Device, Media, Profile, SupportRequest, SupportRequestMessage, SupportRequestMessageRead } from '@core/types';
import { createLogger } from '@core/utils';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { HeartHandshake } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageGroup } from './message-group.component';
import { MessageInput } from './message-input.component';

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
                .map((group, groupIdx) => (
                  <MessageGroup
                    key={group[0].id + '-' + groupIdx}
                    group={group}
                    groupIdx={groupIdx}
                    profiles={profiles}
                    devices={devices}
                    messageReads={messageReads}
                    currentProfile={profile}
                    supportRequestUserId={supportRequest.userId}
                    isAdmin={isAdmin}
                    focusedMsgId={focusedMsgId}
                    onFocusMsg={(msgId) => setFocusedMsgId(msgId)}
                    onBlurMsg={(msgId) => setFocusedMsgId((prev) => (prev === msgId ? null : prev))}
                  />
                ))}
            </div>

            {/* Fixed footer (send message bar) */}
            <MessageInput
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              onSend={handleSend}
              selectedMessageType={selectedMessageType}
              onMessageTypeChange={setSelectedMessageType}
              supportRequestStatus={supportRequest.status}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
