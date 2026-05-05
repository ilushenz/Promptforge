import { useRef } from 'react';
import { useLocalStorage } from './lib/useLocalStorage';
import { buildAllPrompts } from './lib/promptBuilder';
import { ObjectTypeSelector } from './components/ParameterForm/ObjectTypeSelector';
import { ObjectSizeSelector } from './components/ParameterForm/ObjectSizeSelector';
import { PlacementSelector } from './components/ParameterForm/PlacementSelector';
import { TimeOfDaySelector } from './components/ParameterForm/TimeOfDaySelector';
import { WeatherSelector } from './components/ParameterForm/WeatherSelector';
import { FreeNoteInput } from './components/ParameterForm/FreeNoteInput';
import { AngleSelector } from './components/AngleSelector/AngleSelector';
import { PromptOutput } from './components/PromptOutput/PromptOutput';
import type { FormParams } from './types';

const DEFAULT_PARAMS: FormParams = {
  objectType: 'freestanding',
  objectSize: 'medium',
  placement: 'centre',
  timeOfDay: 'golden_hour',
  weather: 'clear',
  freeNote: '',
  selectedAngles: [],
};

export default function App() {
  const [params, setParams] = useLocalStorage<FormParams>('promptforge-params', DEFAULT_PARAMS);
  const [prompts, setPrompts] = useLocalStorage<{ angleName: string; prompt: string }[] | null>(
    'promptforge-prompts',
    null
  );
  const outputRef = useRef<HTMLDivElement>(null);

  function updateParam<K extends keyof FormParams>(key: K, value: FormParams[K]) {
    setParams({ ...params, [key]: value });
  }

  function handleGenerate() {
    const result = buildAllPrompts(params);
    setPrompts(result);
    // On mobile, scroll to output
    if (window.innerWidth < 768) {
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  function handleReset() {
    setParams({ ...params, selectedAngles: [], freeNote: '' });
    setPrompts(null);
  }

  const canGenerate = params.selectedAngles.length === 4;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Prompt<span className="text-amber-400">Forge</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate perfect AI image prompts — free &amp; instant</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
        >
          Reset
        </button>
      </header>

      {/* Two-panel layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8 md:items-start">
        {/* LEFT: Parameter form */}
        <div className="flex flex-col gap-6">
          <ObjectTypeSelector value={params.objectType} onChange={(v) => updateParam('objectType', v)} />
          <ObjectSizeSelector value={params.objectSize} onChange={(v) => updateParam('objectSize', v)} />
          <PlacementSelector value={params.placement} onChange={(v) => updateParam('placement', v)} />
          <TimeOfDaySelector value={params.timeOfDay} onChange={(v) => updateParam('timeOfDay', v)} />
          <WeatherSelector value={params.weather} onChange={(v) => updateParam('weather', v)} />
          <FreeNoteInput value={params.freeNote} onChange={(v) => updateParam('freeNote', v)} />

          <div className="h-px bg-slate-800" />

          <AngleSelector
            selected={params.selectedAngles}
            onChange={(v) => updateParam('selectedAngles', v)}
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
              canGenerate
                ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
            }`}
          >
            Generate Prompts
          </button>
        </div>

        {/* RIGHT: Prompt output */}
        <div ref={outputRef} className="mt-8 md:mt-0">
          <PromptOutput prompts={prompts} params={params} />
        </div>
      </div>
    </div>
  );
}
