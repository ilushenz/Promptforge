import type { TimeOfDay } from '../../types';

interface Props {
  value: TimeOfDay;
  onChange: (v: TimeOfDay) => void;
}

const OPTIONS: { value: TimeOfDay; label: string; description: string }[] = [
  { value: 'dawn', label: 'Dawn', description: 'Soft pink-orange, long shadows' },
  { value: 'morning', label: 'Morning', description: 'Warm gold, directional' },
  { value: 'midday', label: 'Midday', description: 'Harsh overhead, short shadows' },
  { value: 'golden_hour', label: 'Golden hour', description: 'Amber side light, long soft shadows' },
  { value: 'dusk', label: 'Dusk', description: 'Fading warm, blue-purple sky' },
  { value: 'overcast', label: 'Overcast', description: 'Diffuse, even, shadowless' },
];

// Radio card group for selecting time of day / lighting mood.
export function TimeOfDaySelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Time of day</h3>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(opt.value); }}
            className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              value === opt.value
                ? 'border-amber-500 bg-amber-500/10 text-slate-100'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="font-medium text-sm">{opt.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
