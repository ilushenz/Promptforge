import { useState } from 'react';

interface Props {
  index: number;
  angleName: string;
  prompt: string;
}

// A single labelled prompt block with a one-click copy button.
export function PromptBlock({ index, angleName, prompt }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Fallback for HTTP or older browsers
      const el = document.createElement('textarea');
      el.value = prompt;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
        <h3 className="font-semibold text-sm text-slate-200">
          <span className="text-amber-400 mr-1.5">Prompt {index + 1}</span>
          <span className="text-slate-400">—</span>
          <span className="ml-1.5">{angleName}</span>
        </h3>
        <button
          type="button"
          onClick={handleCopy}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
        {prompt}
      </pre>
    </div>
  );
}
