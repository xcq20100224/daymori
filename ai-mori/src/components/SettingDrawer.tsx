import { useRef, useState } from 'react';
import { useMori } from '../context/MoriContext';
import { exportAllMoriData, importAllMoriData, loadGoals, loadMemory, loadMessages, loadPreference } from '../services/storage';
import { defaultMemory, defaultPreference } from '../context/moriReducer';
import type { CompanionStyle } from '../types/mori';

const styles: Array<{ label: string; value: CompanionStyle }> = [
  { label: '温和坚定', value: 'warm_firm' },
  { label: '活泼元气', value: 'energetic' },
  { label: '沉稳理性', value: 'rational' }
];

export const SettingDrawer = () => {
  const { state, actions } = useMori();
  const [open, setOpen] = useState(false);
  const [tipText, setTipText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onExport = async () => {
    try {
      const payload = await exportAllMoriData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daymori-mori-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setTipText('导出成功，已下载到本地。');
    } catch {
      actions.dispatch({ type: 'SET_ERROR', payload: '导出失败，请重试。' });
    }
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const payload = (parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed) as {
      messages?: unknown;
      goals?: unknown;
      memory?: unknown;
      preference?: unknown;
    };

    await importAllMoriData({
      messages: Array.isArray(payload.messages) ? payload.messages : [],
      goals: Array.isArray(payload.goals) ? payload.goals : [],
      memory: payload.memory && typeof payload.memory === 'object' ? (payload.memory as never) : null,
      preference: payload.preference && typeof payload.preference === 'object' ? (payload.preference as never) : null
    });

    const [messages, goals, memory, preference] = await Promise.all([
      loadMessages(),
      loadGoals(),
      loadMemory(),
      loadPreference()
    ]);

    actions.dispatch({
      type: 'BOOTSTRAP',
      payload: {
        messages,
        goals,
        memory: memory ?? defaultMemory,
        preference: preference ?? defaultPreference
      }
    });
    setTipText('导入成功，已恢复本地数据。');
  };

  return (
    <section className="rounded-xl bg-white p-3 shadow-soft">
      <button type="button" className="text-sm text-appleBlue" onClick={() => setOpen((value) => !value)}>
        快捷设置
      </button>
      {open ? (
        <div className="mt-3 space-y-3 text-xs">
          <label className="block text-appleSubText">
            伙伴昵称
            <input
              value={state.preference.companionName}
              onChange={(event) =>
                actions.dispatch({
                  type: 'SET_PREFERENCE',
                  payload: { ...state.preference, companionName: event.target.value }
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-appleText"
            />
          </label>

          <label className="block text-appleSubText">
            语气风格
            <select
              value={state.preference.style}
              onChange={(event) =>
                actions.dispatch({
                  type: 'SET_PREFERENCE',
                  payload: { ...state.preference, style: event.target.value as CompanionStyle }
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-appleText"
            >
              {styles.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between text-appleSubText">
            记忆开关
            <input
              type="checkbox"
              checked={state.preference.memoryEnabled}
              onChange={(event) =>
                actions.dispatch({
                  type: 'SET_PREFERENCE',
                  payload: { ...state.preference, memoryEnabled: event.target.checked }
                })
              }
            />
          </label>

          <label className="flex items-center justify-between text-appleSubText">
            应急模式
            <input
              type="checkbox"
              checked={state.preference.emergencyModeEnabled}
              onChange={(event) =>
                actions.dispatch({
                  type: 'SET_PREFERENCE',
                  payload: { ...state.preference, emergencyModeEnabled: event.target.checked }
                })
              }
            />
          </label>

          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-appleSubText"
            onClick={() => {
              void onExport();
            }}
          >
            一键导出本地数据
          </button>

          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-appleSubText"
            onClick={() => fileInputRef.current?.click()}
          >
            导入本地数据文件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              void onImportFile(file).catch(() => actions.dispatch({ type: 'SET_ERROR', payload: '导入失败，请检查文件格式。' }));
              event.target.value = '';
            }}
          />

          <button
            type="button"
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-rose-500"
            onClick={() =>
              actions
                .clearData()
                .then(() => setTipText('本地数据已清空。'))
                .catch(() => actions.dispatch({ type: 'SET_ERROR', payload: '清空失败' }))
            }
          >
            一键清空本地数据
          </button>

          {tipText ? <p className="m-0 text-[11px] text-emerald-600">{tipText}</p> : null}
        </div>
      ) : null}
    </section>
  );
};
