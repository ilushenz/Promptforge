import type { Weather } from '../../types';

interface Props {
  value: Weather;
  onChange: (v: Weather) => void;
}

const OPTIONS: { value: Weather; label: string; description: string }[] = [
  { value: 'clear', label: 'Clear sky', description: 'No clouds' },
  { value: 'partly_cloudy', label: 'Partly cloudy', description: 'Some scattered clouds' },
  { value: 'overcast', label: 'Overcast', description: 'Heavy grey cloud cover' },
  { value: 'after_rain', label: 'After rain', description: 'Wet surfaces, reflections' },
];

// Radio card group for selecting weather / sky conditions.
export function WeatherSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Season / weather</h3>
      <div className="grid grid-cols-2 gap-2">
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
