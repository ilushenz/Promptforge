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

// Builds all 4 prompts at once, returning angle name + prompt text for each.
export function buildAllPrompts(params: FormParams): { angleName: string; prompt: string }[] {
  return params.selectedAngles.map((angleName) => ({
    angleName,
    prompt: buildPrompt(params, angleName),
  }));
}

// Formats all 4 prompts into one string for "Copy all" functionality.
export function buildCombinedPrompt(params: FormParams): string {
  const prompts = buildAllPrompts(params);
  return prompts
    .map(
      ({ angleName, prompt }, index) =>
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPROMPT ${index + 1} — ${angleName}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${prompt}`
    )
    .join('\n\n\n');
}
