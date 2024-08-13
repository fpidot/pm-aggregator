export const CATEGORIES = ['Elections', 'Economy', 'Geopolitics'] as const;

export type Category = typeof CATEGORIES[number];