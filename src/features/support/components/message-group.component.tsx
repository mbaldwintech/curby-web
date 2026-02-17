'use client';

import { SupportRequestMessageSenderType, SupportRequestMessageType, UserRole } from '@core/enumerations';
import { Device, Media, Profile, SupportRequestMessage, SupportRequestMessageRead } from '@core/types';
import { cn } from '@core/utils';
import Image from 'next/image';

function formatMessageDate(createdAt: string | Date): string {
  if (!createdAt) return '';
  const d = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  if (!d || isNaN(d.getTime())) return '';
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface MessageGroupProps {
  group: (SupportRequestMessage & { media?: Media[] })[];
  groupIdx: number;
  profiles: Record<string, Profile>;
  devices: Record<string, Device>;
  messageReads: Record<string, SupportRequestMessageRead[]>;
  currentProfile: Profile | null;
  supportRequestUserId?: string | null;
  isAdmin: boolean;
  focusedMsgId: string | null;
  onFocusMsg: (msgId: string) => void;
  onBlurMsg: (msgId: string) => void;
}

export function MessageGroup({
  group,
  groupIdx,
  profiles,
  devices,
  messageReads,
  currentProfile,
  supportRequestUserId,
  isAdmin,
  focusedMsgId,
  onFocusMsg,
  onBlurMsg
}: MessageGroupProps) {
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
    currentProfile &&
    firstMsg.senderType === SupportRequestMessageSenderType.User &&
    firstMsg.senderId === currentProfile.userId;
  const isSupport =
    senderProfile &&
    (senderProfile.role === UserRole.Support || senderProfile.role === UserRole.Admin) &&
    senderProfile.userId !== supportRequestUserId;

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
          {formatMessageDate(firstMsg.createdAt)}
        </div>
      </div>
    );
  }

  // Handle internal notes
  const isInternalNote = firstMsg.messageType === SupportRequestMessageType.InternalNote;

  return (
    <div key={firstMsg.id + '-' + groupIdx} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
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
      <div className={cn('w-full min-w-0 flex flex-col mb-2', isCurrentUser ? 'items-end' : 'items-start')}>
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
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">(Internal Note)</span>
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
              currentProfile && msgReads.some((read) => read.userId === currentProfile.userId);
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
                  onFocus={() => onFocusMsg(msg.id)}
                  onBlur={() => onBlurMsg(msg.id)}
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
                        <div key={m.id} className="w-24 h-24 relative rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image src={m.url} alt={m.filename} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {showTimestamp && (
                    <div
                      className={cn(
                        'flex text-xs mt-1',
                        isMsgInternalNote ? 'text-amber-600 dark:text-amber-400' : 'text-primary-foreground/75',
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {formatMessageDate(msg.createdAt)}
                    </div>
                  )}
                  {showTimestamp && isCurrentUser && readCount > 0 && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs mt-1',
                        isMsgInternalNote ? 'text-amber-600 dark:text-amber-400' : 'text-primary-foreground/75',
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
}
