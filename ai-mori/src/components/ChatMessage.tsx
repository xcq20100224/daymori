import type { Message } from '../types/mori';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <article
      className={`w-full rounded-xl p-3 text-sm leading-6 shadow-soft ${
        isUser ? 'bg-appleBlue text-white' : 'bg-white text-appleText'
      }`}
      aria-label={isUser ? '用户消息' : 'Mori回复'}
    >
      <p className="m-0 whitespace-pre-wrap">{message.content}</p>
    </article>
  );
};
