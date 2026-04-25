import { useState } from 'react';
import { useMori } from '../context/MoriContext';
import { buildSmartBreakdown } from '../utils/goal';
import { createId } from '../utils/id';

export const TargetBreakdownCard = () => {
  const { state, actions } = useMori();
  const [goalTitle, setGoalTitle] = useState('');
  const [durationDays, setDurationDays] = useState(21);

  const createPlan = () => {
    const title = goalTitle.trim();
    if (!title) {
      return;
    }
    const smartPlan = buildSmartBreakdown({ goalTitle: title, durationDays });
    actions.dispatch({
      type: 'UPSERT_GOAL',
      payload: {
        id: createId(),
        title,
        deadline: `${durationDays}天`,
        category: 'study',
        smartPlan
      }
    });
    setGoalTitle('');
  };

  return (
    <section className="rounded-xl bg-white p-3 shadow-soft" aria-label="目标拆解">
      <h3 className="m-0 text-sm text-appleText">目标拆解 (SMART)</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          value={goalTitle}
          onChange={(event) => setGoalTitle(event.target.value)}
          placeholder="例如: 3个月A-level数学冲A*"
          className="rounded-lg border border-slate-200 p-2 text-xs text-appleText md:col-span-2"
        />
        <input
          type="number"
          min={1}
          max={365}
          value={durationDays}
          onChange={(event) => setDurationDays(Number(event.target.value))}
          className="rounded-lg border border-slate-200 p-2 text-xs text-appleText"
        />
      </div>
      <button type="button" onClick={createPlan} className="mt-2 rounded-lg bg-appleBlue px-3 py-2 text-xs text-white">
        生成可执行拆解
      </button>

      <div className="mt-3 space-y-2">
        {state.goals.map((goal) => (
          <article key={goal.id} className="rounded-lg border border-slate-200 p-2">
            <p className="m-0 text-xs font-medium text-appleText">{goal.title}</p>
            <ul className="mb-0 mt-1 list-disc space-y-1 pl-5 text-xs text-appleSubText">
              {goal.smartPlan.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
