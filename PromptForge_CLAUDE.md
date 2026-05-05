# CLAUDE.md — PromptForge Build Instructions

> **Who operates this file:** Claude Code, working autonomously. The human has no coding knowledge. Every phase must be fully self-contained: Claude Code writes all the code, installs dependencies, and verifies the build. The human's only job is to open the app in a browser and confirm the described experience works. Claude Code must never ask the human to run commands, edit files, or do anything beyond clicking in a web browser.
>
> There is no backend in this project. No API keys. No `.env` file. Everything runs in the browser.

---

## Project Overview

PromptForge is a single-page React + TypeScript web app. The user fills in a parameter form, selects 4 viewing angles, clicks a button, and instantly receives 4 ready-to-paste AI image generation prompts. No API calls are made — prompt generation is pure string construction in the browser.

**Stack:** React + TypeScript (Vite), Tailwind CSS, no backend, no external APIs, no database.

---

## Repository Structure

```
promptforge/
├── src/
│   ├── components/
│   │   ├── ParameterForm/
│   │   │   ├── ObjectTypeSelector.tsx
│   │   │   ├── ObjectSizeSelector.tsx
│   │   │   ├── PlacementSelector.tsx
│   │   │   ├── TimeOfDaySelector.tsx
│   │   │   ├── WeatherSelector.tsx
│   │   │   └── FreeNoteInput.tsx
│   │   ├── AngleSelector/
│   │   │   └── AngleSelector.tsx
│   │   ├── PromptOutput/
│   │   │   ├── PromptBlock.tsx
│   │   │   └── PromptOutput.tsx
│   │   └── HowToUse.tsx
│   ├── lib/
│   │   ├── promptBuilder.ts   ← Core logic: assembles prompt strings
│   │   ├── constants.ts       ← All parameter maps and angle definitions
│   │   └── useLocalStorage.ts ← Hook for persisting form state
│   ├── types/
│   │   └── index.ts           ← TypeScript types for all parameters
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## How to Run (Claude Code documents this in README.md)

README must contain these steps in plain language:

1. Open a terminal in the `promptforge` folder
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173`

To deploy for free: run `npm run build`, then drag the `dist/` folder into netlify.com/drop. Done — no account required for Netlify Drop.

---

## The Core Logic — promptBuilder.ts

This is the most important file in the project. Claude Code must implement it exactly as specified here.

### Types (src/types/index.ts)

```typescript
export type ObjectType = 'flat' | 'freestanding';
export type ObjectSize = 'small' | 'medium' | 'large' | 'monumental';
export type Placement = 'centre' | 'left' | 'right' | 'background' | 'foreground' | 'wall';
export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'golden_hour' | 'dusk' | 'overcast';
export type Weather = 'clear' | 'partly_cloudy' | 'overcast' | 'after_rain';

export interface FormParams {
  objectType: ObjectType;
  objectSize: ObjectSize;
  placement: Placement;
  timeOfDay: TimeOfDay;
  weather: Weather;
  freeNote: string;
  selectedAngles: string[]; // array of angle names, exactly 4 when valid
}
```

### Constants (src/lib/constants.ts)

```typescript
export const OBJECT_TYPE_MAP: Record<ObjectType, string> = {
  flat: 'a flat, wall-mounted object (such as a painting, panel, or relief)',
  freestanding: 'a freestanding three-dimensional object',
};

export const SIZE_MAP: Record<ObjectSize, string> = {
  small: 'small — less than 50 centimetres in its largest dimension',
  medium: 'medium — between 50 centimetres and 1.5 metres tall',
  large: 'large — between 1.5 and 3 metres tall',
  monumental: 'monumental — over 3 metres tall, dominating the space',
};

export const PLACEMENT_MAP: Record<Placement, string> = {
  centre: 'positioned at the centre of the space',
  left: 'positioned toward the left side of the space',
  right: 'positioned toward the right side of the space',
  background: 'positioned in the far background of the space',
  foreground: 'positioned in the near foreground of the space',
  wall: 'mounted on or positioned directly against a wall',
};

export const TIME_OF_DAY_MAP: Record<TimeOfDay, string> = {
  dawn: 'Dawn light — very soft, warm orange-pink light just above the horizon; long dramatic shadows',
  morning: 'Morning light — bright directional light from a low sun, warm golden tone, medium-length shadows',
  midday: 'Midday light — overhead sunlight, strong and neutral-white, short shadows directly beneath objects',
  golden_hour: 'Golden hour light — very warm, low-angle amber sunlight from the side; long soft shadows',
  dusk: 'Dusk light — fading warm light near the horizon, deep blue-purple sky beginning, very long shadows',
  overcast: 'Overcast light — diffuse, even, shadowless lighting from a uniformly cloudy sky; no directional shadows',
};

export const WEATHER_MAP: Record<Weather, string> = {
  clear: 'Clear sky with no clouds',
  partly_cloudy: 'Partly cloudy sky with some clouds casting occasional shadow',
  overcast: 'Completely overcast sky, heavy grey clouds',
  after_rain: 'After recent rain — wet surfaces, slight reflections on the ground, moist vegetation',
};

export interface AnglePreset {
  name: string;
  shortLabel: string; // shown on the card
  description: string; // inserted into the prompt
}

export const ANGLE_PRESETS: AnglePreset[] = [
  {
    name: 'Straight-on front view',
    shortLabel: 'Front',
    description: 'Camera at eye level directly in front of the object, facing it head-on. The viewer stands facing the object straight ahead.',
  },
  {
    name: 'Slightly elevated front view',
    shortLabel: 'Elevated front',
    description: 'Camera raised to approximately 1.5× average head height, angled slightly downward toward the object from the front.',
  },
  {
    name: 'Low ground-level view',
    shortLabel: 'Low angle',
    description: 'Camera at knee height, angled slightly upward toward the object. The object appears imposing from this low vantage point.',
  },
  {
    name: '45° left front',
    shortLabel: '45° left front',
    description: "Camera at eye level, positioned diagonally in front of and to the left of the object. The object's left front corner faces the camera.",
  },
  {
    name: '45° right front',
    shortLabel: '45° right front',
    description: "Camera at eye level, positioned diagonally in front of and to the right of the object. The object's right front corner faces the camera.",
  },
  {
    name: 'Side view (left)',
    shortLabel: 'Left side',
    description: 'Camera directly to the left of the object at eye level, showing the complete left side profile.',
  },
  {
    name: 'Side view (right)',
    shortLabel: 'Right side',
    description: 'Camera directly to the right of the object at eye level, showing the complete right side profile.',
  },
  {
    name: '45° left rear',
    shortLabel: '45° left rear',
    description: "Camera at eye level, positioned diagonally behind and to the left of the object. The object's left rear corner faces the camera.",
  },
  {
    name: '45° right rear',
    shortLabel: '45° right rear',
    description: "Camera at eye level, positioned diagonally behind and to the right of the object. The object's right rear corner faces the camera.",
  },
  {
    name: 'Wide establishing shot',
    shortLabel: 'Wide shot',
    description: 'Camera pulled back to a wide vantage point showing the object small within the full context of the entire space. The environment dominates the frame.',
  },
  {
    name: 'Aerial / bird\'s-eye',
    shortLabel: 'Aerial',
    description: 'Camera elevated significantly above the scene, looking nearly straight down at the object and surrounding space.',
  },
  {
    name: 'Close-up detail',
    shortLabel: 'Close-up',
    description: 'Camera very close to the object, filling most of the frame with surface texture and material detail. Only a small portion of the surrounding space is visible.',
  },
];
```

### The prompt builder function (src/lib/promptBuilder.ts)

```typescript
import {
  OBJECT_TYPE_MAP,
  SIZE_MAP,
  PLACEMENT_MAP,
  TIME_OF_DAY_MAP,
  WEATHER_MAP,
  ANGLE_PRESETS,
} from './constants';
import type { FormParams } from '../types';

// Builds a single prompt string for one viewing angle.
// Takes the full form parameters and an angle name.
// Returns a plain string ready to paste into any AI image tool.
export function buildPrompt(params: FormParams, angleName: string): string {
  const angle = ANGLE_PRESETS.find((a) => a.name === angleName);
  if (!angle) throw new Error(`Unknown angle: ${angleName}`);

  const lines = [
    'You are a photorealistic architectural and spatial visualisation assistant.',
    '',
    'Place the object shown in the SECOND image into the space shown in the FIRST image.',
    '',
    'Object details:',
    `- Type: ${OBJECT_TYPE_MAP[params.objectType]}`,
    `- Size: ${SIZE_MAP[params.objectSize]}`,
    `- Placement: ${PLACEMENT_MAP[params.placement]}`,
    '',
    'Lighting and atmosphere:',
    `- ${TIME_OF_DAY_MAP[params.timeOfDay]}`,
    `- ${WEATHER_MAP[params.weather]}`,
    '- The object must cast a shadow consistent with this lighting — correct direction, length, and softness.',
    '',
    'Viewing angle:',
    angle.description,
    '',
    'Output requirements:',
    '- A single photorealistic composite photograph',
    '- Must look like a real photograph taken on location — not a render, illustration, or collage',
    '- Correct perspective, depth, and scale throughout',
    '- No text, watermarks, captions, or borders',
  ];

  if (params.freeNote.trim().length > 0) {
    lines.push(`- Additional instruction: ${params.freeNote.trim()}`);
  }

  return lines.join('\n');
}

// Builds all 4 prompts at once.
// Returns an array of { angleName, prompt } objects in the same order as selectedAngles.
export function buildAllPrompts(params: FormParams): { angleName: string; prompt: string }[] {
  return params.selectedAngles.map((angleName) => ({
    angleName,
    prompt: buildPrompt(params, angleName),
  }));
}

// Formats all 4 prompts into a single string for "Copy all" functionality.
// Separates prompts with a clear visual divider.
export function buildCombinedPrompt(params: FormParams): string {
  const prompts = buildAllPrompts(params);
  return prompts
    .map(
      ({ angleName, prompt }, index) =>
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPROMPT ${index + 1} — ${angleName}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${prompt}`
    )
    .join('\n\n\n');
}
```

---

## Default Form Values

When the app first loads (or after a reset), these defaults are pre-selected:

```typescript
const DEFAULT_PARAMS: FormParams = {
  objectType: 'freestanding',
  objectSize: 'medium',
  placement: 'centre',
  timeOfDay: 'golden_hour',
  weather: 'clear',
  freeNote: '',
  selectedAngles: [],
};
```

---

## Development Phases

Each phase is complete and testable on its own. Claude Code finishes the entire phase before moving on. At the end of each phase, Claude Code updates `TESTING.md` with plain-language browser-only test instructions.

---

### Phase 1 — Scaffold, Layout & Parameter Form

**Goal:** The app loads with the correct two-panel layout and a fully functional parameter form.

**Claude Code must:**
- Initialise Vite + React + TypeScript
- Install and configure Tailwind CSS
- Create the two-panel layout: left panel (Parameters), right panel (Your Prompts — placeholder for now)
- Implement all parameter selectors as radio card grids:
  - **Object type:** 2 cards — "Flat / wall-mounted" (description: "Paintings, panels, reliefs") and "Freestanding 3D object" (description: "Sculptures, furniture, large objects")
  - **Object size:** 4 cards — Small, Medium, Large, Monumental — each showing the dimension range in smaller text
  - **Placement:** 6 cards with short names and a one-line description each
  - **Time of day:** 6 cards with a short lighting mood description on each
  - **Weather:** 4 cards
  - **Additional note:** Textarea, max 300 characters, with live character counter below
- All defaults pre-selected as specified above
- A disabled grey "Generate Prompts" button at the bottom of the left panel
- The right panel shows: "Your prompts will appear here" placeholder text, and below it the "How to Use" panel with these 4 steps written out permanently:
  1. Fill in the parameters and select 4 viewing angles
  2. Click "Generate Prompts"
  3. Open Gemini (or any AI image tool) in a new tab
  4. Upload your space photo and object photo, then paste one prompt per generation

**TESTING.md checklist for Phase 1:**
- Open `http://localhost:5173` — does the app load without errors?
- Is the screen split into two panels?
- Can you see and click each radio card in all 5 parameter sections?
- Does clicking a card highlight it and deselect the previous one?
- Is the Additional note textarea visible with a character counter?
- Is the Generate Prompts button visible but greyed out?
- Does the right panel show the placeholder text and the How to Use steps?

---

### Phase 2 — Angle Selector & Generate Button Activation

**Goal:** The 12-card angle selector is functional and the Generate button activates when exactly 4 are selected.

**Claude Code must:**
- Add the angle selector grid below the parameter form in the left panel
- Each card shows: the short label in bold, a one-line description in smaller text
- Clicking selects (highlighted border + background tint); clicking again deselects
- A counter "X of 4 selected" updates live below the grid:
  - 0–3 selected: shows in amber/orange — "Select [N] more"
  - Exactly 4: shows in green — "4 of 4 selected ✓"
  - If user tries to click a 5th card, automatically deselect the earliest-selected one (so the count never exceeds 4)
- The Generate Prompts button activates (changes to primary colour) only when exactly 4 angles are selected
- Implement `useLocalStorage` hook and wire it to the full form state so selections persist across page refresh
- Add a "Reset" button in the top bar that clears selectedAngles and freeNote but keeps all other parameter selections intact (don't clear the parameter form — only clear outputs and angle selections)

**TESTING.md checklist for Phase 2:**
- Is the 12-card angle grid visible below the parameters?
- Does clicking a card highlight it?
- Does the counter show "Select 3 more" after clicking 1 card?
- Does the counter turn green and show "4 of 4 selected ✓" after clicking 4 cards?
- When you click a 5th card, does the first-selected card automatically deselect?
- Does the Generate Prompts button change colour when exactly 4 are selected?
- Refresh the page — do your parameter selections and angle selections persist?
- Click Reset — do the angle selections clear, while Object type / Size etc. stay the same?

---

### Phase 3 — Prompt Generation & Output

**Goal:** Clicking Generate instantly produces 4 formatted prompt blocks with copy functionality.

**Claude Code must:**
- Implement `src/lib/constants.ts` and `src/lib/promptBuilder.ts` exactly as specified in this file
- Wire the Generate button: on click, call `buildAllPrompts(params)` and store results in state
- Replace the right panel placeholder with 4 prompt blocks, each containing:
  - A header: "Prompt [N] — [Angle Name]" in bold
  - A read-only textarea (or `<pre>` block) containing the full prompt text — styled with a monospace-adjacent font, good line height, easy to read
  - A "Copy" button: on click, calls `navigator.clipboard.writeText(prompt)`, then briefly shows "Copied ✓" for 1.5 seconds before reverting to "Copy"
- Below the 4 blocks: a "Copy all 4 prompts" button that calls `buildCombinedPrompt(params)` and copies the result, with the same "Copied ✓" feedback
- On mobile (< 768px): after clicking Generate, smoothly scroll to the top of the right panel so the prompts are in view
- Prompts regenerate instantly when the user changes a parameter and clicks Generate again (no confirm dialog needed)
- The Reset button (from Phase 2) also clears the prompt output back to the placeholder state

**TESTING.md checklist for Phase 3 (end-to-end test):**
- Select all parameters and 4 angles, click Generate — do 4 prompt blocks appear instantly?
- Does each block show the correct angle name in the header?
- Does the prompt text look correct and readable?
- Click "Copy" under the first prompt — does "Copied ✓" appear briefly?
- Open a text editor, paste — is the full prompt text there?
- Click "Copy all 4 prompts" — paste into a text editor — are all 4 prompts there with separators between them?
- Change "Time of day" to a different option, click Generate again — does the lighting description in the prompts change?
- Click Reset — do the prompts disappear and the placeholder return?
- Refresh the page — do your parameter selections persist? (Prompts themselves don't need to persist — only parameters)

---

## Coding Standards

1. **TypeScript everywhere.** No `any` types.
2. **`promptBuilder.ts` is pure.** No side effects, no imports from React. Input → string output only. This makes it trivial to test and iterate.
3. **Comments on all functions.** A plain-English sentence at the top of every function explaining what it does.
4. **No unnecessary dependencies.** This app needs only React, TypeScript, Vite, and Tailwind. Do not add any other npm packages unless there is no reasonable alternative.
5. **Clipboard API with fallback.** `navigator.clipboard` requires HTTPS in some browsers. Add a fallback: if it fails, select the textarea text and use `document.execCommand('copy')`.
6. **Accessible radio cards.** Each parameter card must be keyboard-accessible: Tab to focus, Space/Enter to select. The selected state must be communicated via `aria-pressed` or equivalent.

---

## What "Done" Means for Each Phase

A phase is complete when:
1. `npm run dev` starts without errors
2. `npx tsc --noEmit` passes with zero TypeScript errors
3. No errors in the browser console during normal use
4. All items in that phase's TESTING.md checklist pass with browser-only actions
5. `npm run build` succeeds and produces a `dist/` folder (check this in Phase 3)
