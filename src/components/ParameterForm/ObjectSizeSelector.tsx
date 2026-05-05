import type { ObjectSize } from '../../types';

interface Props {
  value: ObjectSize;
  onChange: (v: ObjectSize) => void;
}

const OPTIONS: { value: ObjectSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: '< 50 cm' },
  { value: 'medium', label: 'Medium', description: '50 cm – 1.5 m' },
  { value: 'large', label: 'Large', description: '1.5 – 3 m' },
  { value: 'monumental', label: 'Monumental', description: '> 3 m' },
];

// Radio card group for selecting the object size.
export function ObjectSizeSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Object size</h3>
      <div className="grid grid-cols-4 gap-2">
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
