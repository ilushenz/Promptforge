import type { ObjectType, ObjectSize, Placement, TimeOfDay, Weather } from '../types';

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
  shortLabel: string;
  description: string;
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
    name: "Aerial / bird's-eye",
    shortLabel: 'Aerial',
    description: 'Camera elevated significantly above the scene, looking nearly straight down at the object and surrounding space.',
  },
  {
    name: 'Close-up detail',
    shortLabel: 'Close-up',
    description: 'Camera very close to the object, filling most of the frame with surface texture and material detail. Only a small portion of the surrounding space is visible.',
  },
];
