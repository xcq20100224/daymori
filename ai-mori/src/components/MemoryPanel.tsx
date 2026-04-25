import { useMemo } from 'react';
import { useMori } from '../context/MoriContext';

export const MemoryPanel = () => {
  const { state } = useMori();

  const summary = useMemo(() => {
    return [
      `昵称: ${state.memory.nickname || '未设置'}`,
      `核心目标数: ${state.memory.coreGoals.length}`,
      `关键事件数: ${state.memory.keyEvents.length}`,
      `习惯记录数: ${state.memory.habits.length}`
    ];
  }, [state.memory]);

  return (
    <section className="rounded-xl bg-white p-3 shadow-soft" aria-label="记忆面板">
      <h3 className="m-0 text-sm text-appleText">长程记忆</h3>
      <ul className="mb-0 mt-2 space-y-1 pl-5 text-xs text-appleSubText">
        {summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-appleSubText">说明: 记忆数据默认仅保存在本地设备，并加密存储。</p>
    </section>
  );
};
