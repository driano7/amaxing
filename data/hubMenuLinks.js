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

// Desktop header items — nueva navegación: /home, /journeys, /maps, /guides, /about
const navItemsConfig = [
  { labelKey: 'nav.header.home', fallback: 'Home', href: '/', icon: 'Home' },
  {
    labelKey: 'nav.header.journeys',
    fallback: 'Journeys',
    href: '/journeys',
    icon: 'Compass',
  },
  { labelKey: 'nav.header.maps', fallback: 'Maps', href: '/maps', icon: 'MapPinned' },
  { labelKey: 'nav.header.guides', fallback: 'Guides', href: '/guides', icon: 'BookOpen' },
  { labelKey: 'nav.header.about', fallback: 'About Us', href: '/about', icon: 'Users' },
]

// Desktop "More" dropdown — empty for now (pricing & moodboard hidden).
const headerDropdownConfig = []

// Mobile drawer main list (HubMenu + MobileDock) — nueva navegación
const drawerItemsConfig = [
  { labelKey: 'header.nav.home', fallback: 'Home', href: '/', icon: 'Home' },
  {
    labelKey: 'header.nav.journeys',
    fallback: 'Journeys',
    href: '/journeys',
    icon: 'Compass',
  },
  { labelKey: 'header.nav.maps', fallback: 'Maps', href: '/maps', icon: 'MapPinned' },
  { labelKey: 'header.nav.guides', fallback: 'Guides', href: '/guides', icon: 'BookOpen' },
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
