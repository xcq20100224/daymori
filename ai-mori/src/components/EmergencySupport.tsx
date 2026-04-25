interface EmergencySupportProps {
  onQuickSend: (text: string) => void;
}

const quickActions = ['我现在很焦虑，帮我做5分钟稳定', '我又想熬夜了，给我一个立刻执行的方案', '我破防了，先帮我稳住'];

export const EmergencySupport = ({ onQuickSend }: EmergencySupportProps) => {
  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50 p-3" aria-label="应急支持">
      <h3 className="m-0 text-sm text-rose-600">应急支持</h3>
      <p className="mt-2 text-xs text-rose-500">冲动期先守住5分钟。点击一条，Mori会立即进入应急陪伴模式。</p>
      <div className="mt-2 space-y-2">
        {quickActions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onQuickSend(item)}
            className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-left text-xs text-rose-600"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};
