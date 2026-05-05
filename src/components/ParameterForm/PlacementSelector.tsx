import type { Placement } from '../../types';

interface Props {
  value: Placement;
  onChange: (v: Placement) => void;
}

const OPTIONS: { value: Placement; label: string; description: string }[] = [
  { value: 'centre', label: 'Centre', description: 'Middle of the space' },
  { value: 'left', label: 'Left', description: 'Left side of space' },
  { value: 'right', label: 'Right', description: 'Right side of space' },
  { value: 'background', label: 'Background', description: 'Far back of space' },
  { value: 'foreground', label: 'Foreground', description: 'Near the camera' },
  { value: 'wall', label: 'On a wall', description: 'Mounted or against wall' },
];

// Radio card group for selecting placement within the space.
export function PlacementSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Placement</h3>
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
