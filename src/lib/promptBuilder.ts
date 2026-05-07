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

  // Append detailed placement instructions when the user has drawn annotations on the space photo.
  const hasLine = params.annotations.placementLine !== null;
  const hasBrush = params.annotations.strokes.length > 0;

  if (hasLine || hasBrush) {
    lines.push('', 'Placement instructions (CRITICAL — follow exactly):');
  }

  if (hasLine) {
    lines.push(
      '- The FIRST image contains a red straight line drawn directly on the space photograph. This line marks the exact rear bottom edge of the object — the ground-contact line along which the back of the object\'s base must sit.',
      "- Place the object so that its rear base edge lies precisely along this red line. Do not approximate — the alignment must be exact. The object's base should contact the floor or surface right at this line, as if the line were a physical chalk mark on the ground.",
      '- Use the angle, position, and length of the line to infer the surface perspective and depth. The object must be foreshortened and scaled consistently with how the surface recedes at the point where the line is drawn.',
      '- The red line must not be visible in the final output — it is a positioning guide only.',
    );
  }

  if (hasBrush) {
    lines.push(
      '- The FIRST image contains a red semi-transparent painted region. This region marks the exact area of the floor or surface where the object must be placed.',
      '- Position the object so that its base footprint sits fully within the painted region. The object should occupy that zone — do not place it outside, beside, or overlapping the boundary of the marked area.',
      '- Use the shape, size, and perspective of the painted region to determine the correct scale and orientation of the object relative to the surrounding space.',
      '- The red overlay must not be visible in the final output — it is a positioning guide only.',
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
