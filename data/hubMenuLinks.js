/**
 * Centralized Hub Menu Links Configuration
 * ----------------------------------------
 * This file documents all header navigation options for both
 * desktop and mobile (drawer) views.
 *
 * Layout split (desktop):
 *   - navItemsConfig        -> Header bar
 *   - headerDropdownConfig  -> Header secondary dropdown ("More")
 *
 * Mobile:
 *   - drawerItemsConfig     -> HubMenu drawer list + MobileDock nav
 *   - tourCategoriesConfig  -> HubMenu "Categories" section
 */

// Desktop header items — orden: /journeys, /maps, /guides, /local, /about
const navItemsConfig = [
  {
    labelKey: 'nav.header.journeys',
    fallback: 'Caminatas',
    href: '/journeys',
    icon: 'Compass',
  },
  { labelKey: 'nav.header.maps', fallback: 'Maps', href: '/maps', icon: 'MapPinned' },
  { labelKey: 'nav.header.guides', fallback: 'Guides', href: '/guides', icon: 'BookOpen' },
  {
    labelKey: 'nav.header.localPicks',
    fallback: 'Selección Local',
    href: '/local',
    icon: 'Star',
  },
  { labelKey: 'nav.header.about', fallback: 'About Us', href: '/about', icon: 'Users' },
]

// Desktop "More" dropdown — 3 Local que sustituyen a News (MDX por noticia)
const headerDropdownConfig = [
  {
    labelKey: 'localPicks.pick1',
    fallback: 'Night paddle + pulque',
    href: '/local/2026-09-08',
    icon: 'Star',
  },
  {
    labelKey: 'localPicks.pick2',
    fallback: 'Escandón',
    href: '/local/2026-09-07',
    icon: 'Star',
  },
  {
    labelKey: 'localPicks.pick3',
    fallback: 'El Maíz Invisible',
    href: '/local/2026-09-06',
    icon: 'Star',
  },
]

// Mobile drawer main list (HubMenu + MobileDock) — nueva navegación
const drawerItemsConfig = [
  { labelKey: 'header.nav.home', fallback: 'Home', href: '/', icon: 'Home' },
  {
    labelKey: 'header.nav.journeys',
    fallback: 'Caminatas',
    href: '/journeys',
    icon: 'Compass',
  },
  { labelKey: 'header.nav.maps', fallback: 'Maps', href: '/maps', icon: 'MapPinned' },
  { labelKey: 'header.nav.guides', fallback: 'Guides', href: '/guides', icon: 'BookOpen' },
  {
    labelKey: 'header.nav.localPicks',
    fallback: 'Selección Local',
    href: '/local',
    icon: 'Star',
  },
  { labelKey: 'header.nav.about', fallback: 'About Us', href: '/about', icon: 'Users' },
]

// Mobile drawer "Categories" section — the 4 tour categories with their icons.
const tourCategoriesConfig = [
  {
    labelKey: 'tourCategories.culinary',
    fallback: 'Culinary Underworld',
    href: '/tours?category=gastronomy',
    icon: 'Utensils',
  },
  {
    labelKey: 'tourCategories.history',
    fallback: 'Uncensored History',
    href: '/tours?category=history',
    icon: 'Skull',
  },
  {
    labelKey: 'tourCategories.neighborhoods',
    fallback: 'Neighborhood Deep Dives',
    href: '/tours?category=neighborhoods',
    icon: 'MapPin',
  },
  {
    labelKey: 'tourCategories.museums',
    fallback: 'Art & Museums',
    href: '/tours?category=museums',
    icon: 'Palette',
  },
]

module.exports = {
  navItemsConfig,
  drawerItemsConfig,
  headerDropdownConfig,
  tourCategoriesConfig,
}
