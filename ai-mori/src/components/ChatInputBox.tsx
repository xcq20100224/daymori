import { useState } from 'react';

interface ChatInputBoxProps {
  onSend: (text: string) => void;
  onStop: () => void;
  disabled: boolean;
}

export const ChatInputBox = ({ onSend, onStop, disabled }: ChatInputBoxProps) => {
  const [text, setText] = useState('');

  const submit = () => {
    const value = text.trim();
    if (!value) {
      return;
    }
    onSend(value);
    setText('');
  };

  return (
    <div className="rounded-xl bg-white p-3 shadow-soft">
      <label htmlFor="mori-input" className="mb-2 block text-xs text-appleSubText">
        和Mori说说你现在的状态
      </label>
      <textarea
        id="mori-input"
        className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-appleText outline-none focus:border-appleBlue"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="例如：我今晚总想刷短视频，帮我撑过这30分钟"
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onStop}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-appleSubText"
        >
          停止
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={submit}
          className="rounded-lg bg-appleBlue px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </div>
  );
};
