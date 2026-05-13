export const DEFAULT_THEME_ID = 'nuclear:rebirth';

export const BUILTIN_BASIC_THEME_IDS = [
  DEFAULT_THEME_ID,
  'nuclear:default',
  'nuclear:aurora',
  'nuclear:ember',
  'nuclear:lagoon',
  'nuclear:arctic-moss',
] as const;

export type BuiltinBasicThemeId = (typeof BUILTIN_BASIC_THEME_IDS)[number];
