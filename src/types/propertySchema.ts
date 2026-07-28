/**
 * PROPERTY CONTROL SCHEMA TYPES (STRICT TYPES - ZERO ANY)
 */

export type PropertyControlType = 
  | 'text' 
  | 'number' 
  | 'color' 
  | 'select' 
  | 'date' 
  | 'slider';

export interface PropertyOption {
  label: string;
  value: string | number;
}

export interface PropertyFieldSchema {
  key: string;
  label: string;
  type: PropertyControlType;
  target: 'props' | 'style';
  defaultValue?: string | number | boolean;
  options?: PropertyOption[];
  min?: number;
  max?: number;
  step?: number;
}
