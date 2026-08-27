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

// Desktop header items.
const navItemsConfig = [
  {
    labelKey: 'nav.header.experiences',
    fallback: 'Experiences',
    href: '/experiences',
    icon: 'Compass',
  },
  { labelKey: 'nav.header.stories', fallback: 'Stories', href: '/stories', icon: 'BookOpen' },
  { labelKey: 'nav.header.news', fallback: 'News', href: '/news', icon: 'Newspaper' },
  { labelKey: 'nav.header.about', fallback: 'About Us', href: '/about', icon: 'Users' },
]

// Desktop "More" dropdown — empty for now (pricing & moodboard hidden).
const headerDropdownConfig = []

// Mobile drawer main list (HubMenu + MobileDock).
const drawerItemsConfig = [
  {
    labelKey: 'header.nav.experiences',
    fallback: 'Experiences',
    href: '/experiences',
    icon: 'Compass',
  },
  { labelKey: 'header.nav.stories', fallback: 'Stories', href: '/stories', icon: 'BookOpen' },
  { labelKey: 'header.nav.news', fallback: 'News', href: '/news', icon: 'Newspaper' },
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
