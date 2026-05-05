import type { ObjectType } from '../../types';

interface Props {
  value: ObjectType;
  onChange: (v: ObjectType) => void;
}

const OPTIONS: { value: ObjectType; label: string; description: string }[] = [
  { value: 'freestanding', label: 'Freestanding 3D object', description: 'Sculptures, furniture, large objects' },
  { value: 'flat', label: 'Flat / wall-mounted', description: 'Paintings, panels, reliefs' },
];

// Radio card group for selecting the object type.
export function ObjectTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Object type</h3>
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
            <div className="font-medium text-sm leading-tight">{opt.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
