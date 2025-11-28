export enum ButtonVariant {
  DEFAULT = 'DEFAULT',
  OPERATOR = 'OPERATOR',
  ACTION = 'ACTION', // Clear, Delete
  EQUALS = 'EQUALS',
  SCIENTIFIC = 'SCIENTIFIC',
  AI = 'AI'
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operator: string | null;
  overwriteNext: boolean; // True if next number input should replace current display (e.g. after equals)
  history: HistoryItem[];
  isScientific: boolean;
  error: string | null;
}
