export type ObjectType = 'flat' | 'freestanding';
export type ObjectSize = 'small' | 'medium' | 'large' | 'monumental';
export type Placement = 'centre' | 'left' | 'right' | 'background' | 'foreground' | 'wall';
export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'golden_hour' | 'dusk' | 'overcast';
export type Weather = 'clear' | 'partly_cloudy' | 'overcast' | 'after_rain';

// Annotation coordinate stored as fractions (0–1) of the canvas width/height.
// This makes coordinates resolution-independent and correct on any display size.
export interface Point {
  x: number;
  y: number;
}

// One continuous brush stroke. brushSize is a reference pixel value at 600px canvas width.
export interface Stroke {
  points: Point[];
  brushSize: number;
  isEraser: boolean;
}

// A straight placement line defined by its two endpoint coordinates.
export interface PlacementLine {
  start: Point;
  end: Point;
}

// All canvas annotation data stored with the form parameters.
export interface AnnotationState {
  strokes: Stroke[];
  placementLine: PlacementLine | null;
}

export interface FormParams {
  objectType: ObjectType;
  objectSize: ObjectSize;
  placement: Placement;
  timeOfDay: TimeOfDay;
  weather: Weather;
  freeNote: string;
  selectedAngles: string[];
  annotations: AnnotationState;
}
