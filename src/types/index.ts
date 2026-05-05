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
  selectedAngles: string[];
}
