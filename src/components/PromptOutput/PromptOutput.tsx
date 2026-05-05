import { useState } from 'react';
import { PromptBlock } from './PromptBlock';
import { buildCombinedPrompt } from '../../lib/promptBuilder';
import type { FormParams } from '../../types';

interface Props {
  prompts: { angleName: string; prompt: string }[] | null;
  params: FormParams;
}

// The right panel — shows placeholder before generation, prompt blocks after.
export function PromptOutput({ prompts, params }: Props) {
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleCopyAll() {
    const combined = buildCombinedPrompt(params);
    try {
      await navigator.clipboard.writeText(combined);
    } catch {
      const el = document.createElement('textarea');
      el.value = combined;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Your prompts</h2>

        {prompts === null ? (
          <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 flex items-center justify-center min-h-48 px-6 py-10">
            <p className="text-slate-500 text-sm text-center leading-relaxed">
              Your prompts will appear here.<br />
              Select 4 viewing angles and click <strong className="text-slate-400">Generate Prompts</strong>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {prompts.map((p, i) => (
              <PromptBlock key={p.angleName} index={i} angleName={p.angleName} prompt={p.prompt} />
            ))}
            <button
              type="button"
              onClick={handleCopyAll}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                copiedAll
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'
              }`}
            >
              {copiedAll ? 'All 4 prompts copied ✓' : 'Copy all 4 prompts'}
            </button>
          </div>
        )}
      </div>

      {/* How to Use — always visible */}
      <HowToUse />
    </div>
  );
}

function HowToUse() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">How to use</h3>
      <ol className="space-y-2">
        {[
          'Fill in the parameters and select 4 viewing angles',
          'Click "Generate Prompts"',
          'Open Gemini (or any AI image tool) in a new tab',
          'Upload your space photo and object photo, then paste one prompt per generation',
        ].map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-400 leading-snug">
            <span className="shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
