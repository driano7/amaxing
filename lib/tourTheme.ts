/**
 * Accent color per tour category — taken from the moodboard palette
 * (Rosa mexicano base + tonos del mercado, talavera, papel picado y cempasúchil).
 *
 *   gastronomy    → Turquesa talavera  #0E8C7A
 *   history       → Cempasúchil        #F2A03D
 *   neighborhoods → Terracota          #C1440E
 *   museums       → Terracota / barro  #C1440E
 */

export interface TourTheme {
  name: string
  hex: string
}

const CATEGORY_THEMES: Record<string, TourTheme> = {
  gastronomy: { name: 'Turquesa talavera', hex: '#0E8C7A' },
  history: { name: 'Cempasúchil', hex: '#F2A03D' },
  neighborhoods: { name: 'Terracota', hex: '#C1440E' },
  museums: { name: 'Terracota / barro', hex: '#C1440E' },
}

/** Fallback accent (rosa mexicano base from the moodboard) */
export const DEFAULT_ACCENT = '#E4007C'

/**
 * Returns the moodboard theme for a tour category.
 * Falls back to the rosa mexicano base when the category is unknown.
 */
export function getCategoryTheme(category?: string | null): TourTheme {
  if (!category) return { name: 'Rosa mexicano', hex: DEFAULT_ACCENT }
  return CATEGORY_THEMES[category.toLowerCase()] || { name: 'Rosa mexicano', hex: DEFAULT_ACCENT }
}

/**
 * CSS custom properties to spread on a container style so any child can use:
 *   text-[var(--accent)]  bg-[var(--accent)]  border-[var(--a30)]  etc.
 */
export function themeVars(theme: TourTheme): Record<string, string> {
  const { hex } = theme
  return {
    '--accent': hex,
    '--a05': `${hex}0D`, // 5%
    '--a10': `${hex}1A`, // 10%
    '--a20': `${hex}33`, // 20%
    '--a30': `${hex}4D`, // 30%
  }
}
