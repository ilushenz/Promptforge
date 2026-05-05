import { ANGLE_PRESETS } from '../../lib/constants';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

// 12-card grid for selecting exactly 4 viewing angles.
// If the user tries to select a 5th, the earliest-selected one is automatically dropped.
export function AngleSelector({ selected, onChange }: Props) {
  const count = selected.length;

  function toggleAngle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((a) => a !== name));
    } else if (count < 4) {
      onChange([...selected, name]);
    } else {
      // Drop the earliest-selected and add the new one
      onChange([...selected.slice(1), name]);
    }
  }

  const remaining = 4 - count;
  const statusText =
    count === 4 ? '4 of 4 selected ✓' : remaining === 1 ? 'Select 1 more' : `Select ${remaining} more`;
  const statusColor = count === 4 ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Viewing angles <span className="normal-case font-normal text-slate-500">— select exactly 4</span>
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {ANGLE_PRESETS.map((angle) => {
          const isSelected = selected.includes(angle.name);
          const order = selected.indexOf(angle.name);
          return (
            <button
              key={angle.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleAngle(angle.name)}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggleAngle(angle.name); }}
              className={`relative text-left p-3 rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 text-slate-100'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center leading-none">
                  {order + 1}
                </span>
              )}
              <div className="font-medium text-sm pr-5">{angle.shortLabel}</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-tight line-clamp-2">{angle.description.split('.')[0]}.</div>
            </button>
          );
        })}
      </div>
      <p className={`text-sm font-medium mt-3 ${statusColor}`}>{statusText}</p>
    </div>
  );
}
