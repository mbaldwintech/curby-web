'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Textarea
} from '@core/components';
import { SupportRequestMessageType, SupportRequestStatus } from '@core/enumerations';
import { ChevronDown } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSend: () => void;
  selectedMessageType: SupportRequestMessageType;
  onMessageTypeChange: (type: SupportRequestMessageType) => void;
  supportRequestStatus: SupportRequestStatus;
}

export function MessageInput({
  newMessage,
  onNewMessageChange,
  onSend,
  selectedMessageType,
  onMessageTypeChange,
  supportRequestStatus
}: MessageInputProps) {
  return (
    <div className="border-t border-input bg-background/95 rounded-b-lg p-3 flex gap-2 items-end shrink-0">
      <Textarea
        className="w-full resize-none min-h-10"
        rows={1}
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => onNewMessageChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage.trim()) {
              onSend();
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
              onSelect={() => onMessageTypeChange(SupportRequestMessageType.Reply)}
              className="cursor-pointer"
            >
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onMessageTypeChange(SupportRequestMessageType.InternalNote)}
              className="cursor-pointer"
            >
              Internal Note
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={onSend}
        disabled={
          !newMessage.trim() ||
          (selectedMessageType === SupportRequestMessageType.Reply &&
            supportRequestStatus !== SupportRequestStatus.InProgress)
        }
        className="shrink-0 h-10"
      >
        Send
      </Button>
    </div>
  );
}
