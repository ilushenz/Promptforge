import type { ObjectSize } from '../../types';

interface Props {
  value: ObjectSize;
  customSizeText: string;
  onChange: (v: ObjectSize) => void;
  onCustomTextChange: (v: string) => void;
}

const PRESETS: { value: ObjectSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: '< 50 cm' },
  { value: 'medium', label: 'Medium', description: '50 cm – 1.5 m' },
  { value: 'large', label: 'Large', description: '1.5 – 3 m' },
  { value: 'monumental', label: 'Monumental', description: '> 3 m' },
];

// Radio card group for selecting object size, with an optional custom size input.
export function ObjectSizeSelector({ value, customSizeText, onChange, onCustomTextChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Object size</h3>

      {/* Four preset cards */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {PRESETS.map((opt) => (
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

      {/* Custom size — full-width card that expands into a text input when selected */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'custom'}
        onClick={() => onChange('custom')}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange('custom'); }}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          value === 'custom'
            ? 'border-amber-500 bg-amber-500/10 text-slate-100'
            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
        }`}
      >
        <div className="font-medium text-sm">Custom size</div>
        <div className="text-xs text-slate-400 mt-0.5">Enter exact dimensions</div>
      </button>

      {value === 'custom' && (
        <input
          type="text"
          value={customSizeText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="e.g. 80 × 60 × 40 cm, or roughly 1.2 m tall"
          className="mt-2 w-full px-3 py-2.5 rounded-lg border-2 border-amber-500/50 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          autoFocus
        />
      )}
    </div>
  );
}
