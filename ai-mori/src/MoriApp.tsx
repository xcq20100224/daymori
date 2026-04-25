import { ChatInputBox } from './components/ChatInputBox';
import { ChatList } from './components/ChatList';
import { EmergencySupport } from './components/EmergencySupport';
import { MemoryPanel } from './components/MemoryPanel';
import { SettingDrawer } from './components/SettingDrawer';
import { TargetBreakdownCard } from './components/TargetBreakdownCard';
import { MoriProvider, useMori } from './context/MoriContext';
import { useMoriChat } from './hooks/useMoriChat';

const MoriBoard = () => {
  const { state } = useMori();
  const { canSend, sendMessage, stopStreaming } = useMoriChat();

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 lg:grid-cols-3" aria-label="AI Mori伙伴">
      <section className="space-y-3 lg:col-span-2">
        <header className="rounded-xl bg-white p-4 shadow-soft">
          <h1 className="m-0 text-xl text-appleText">AI Mori伙伴</h1>
          <p className="mt-1 text-sm text-appleSubText">全免费、无广告、专注现实行动。你说状态，我给你可执行下一步。</p>
        </header>

        <ChatList messages={state.messages} streamingText={state.streamingText} />

        <ChatInputBox onSend={(text) => void sendMessage(text)} onStop={stopStreaming} disabled={!canSend} />

        {state.errorText ? <p className="m-0 text-xs text-rose-500">{state.errorText}</p> : null}
      </section>

      <aside className="space-y-3">
        <SettingDrawer />
        <MemoryPanel />
        <EmergencySupport onQuickSend={(text) => void sendMessage(text)} />
        <TargetBreakdownCard />
      </aside>
    </main>
  );
};

export const MoriApp = () => {
  return (
    <MoriProvider>
      <MoriBoard />
    </MoriProvider>
  );
};
