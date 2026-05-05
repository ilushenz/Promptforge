const MAX_CHARS = 300;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

// Textarea for an optional extra instruction, with live character counter.
export function FreeNoteInput({ value, onChange }: Props) {
  const remaining = MAX_CHARS - value.length;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Additional note <span className="normal-case font-normal text-slate-500">(optional)</span></h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        maxLength={MAX_CHARS}
        rows={3}
        placeholder="Any extra instruction for the AI — e.g. 'keep the original floor texture', 'no people in the scene'…"
        className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 text-sm leading-relaxed resize-none focus:outline-none focus:border-amber-500 transition-colors"
      />
      <div className={`text-xs mt-1 text-right ${remaining < 50 ? 'text-amber-400' : 'text-slate-500'}`}>
        {remaining} characters remaining
      </div>
    </div>
  );
}
