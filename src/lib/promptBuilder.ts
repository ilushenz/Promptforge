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
    `- Placement: ${
      params.annotations.placementLine !== null || params.annotations.strokes.length > 0
        ? 'as indicated by the annotation drawn on the uploaded space image'
        : PLACEMENT_MAP[params.placement]
    }`,
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

  // Append annotation reference sentences when the user has drawn on the space photo.
  const hasLine = params.annotations.placementLine !== null;
  const hasBrush = params.annotations.strokes.length > 0;

  if (hasLine || hasBrush) {
    lines.push('');
  }
  if (hasLine) {
    lines.push(
      "Placement reference: a line is marked on the uploaded space image indicating the rear bottom edge where the object's base should sit. Align the object so its back base edge follows this line precisely."
    );
  }
  if (hasBrush) {
    lines.push(
      'Placement reference: a highlighted region is marked on the uploaded space image indicating the area where the object should be placed. Position the object within this highlighted region.'
    );
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
