import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import type { Message } from '../types/mori';
import { ChatMessage } from './ChatMessage';

interface ChatListProps {
  messages: Message[];
  streamingText: string;
}

interface RowData {
  items: Message[];
}

const Row = ({ index, style, data }: ListChildComponentProps<RowData>) => {
  const message = data.items[index];
  return (
    <div style={{ ...style, padding: '6px 0' }}>
      <ChatMessage message={message} />
    </div>
  );
};

export const ChatList = ({ messages, streamingText }: ChatListProps) => {
  const merged = streamingText
    ? [
        ...messages,
        {
          id: 'streaming',
          role: 'assistant' as const,
          content: streamingText,
          createdAt: Date.now(),
          safetyTags: []
        }
      ]
    : messages;

  return (
    <div className="rounded-xl bg-appleCard p-3">
      <FixedSizeList
        height={420}
        width="100%"
        itemSize={132}
        itemCount={merged.length}
        itemData={{ items: merged }}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};
