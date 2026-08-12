/**
 * Centralized Hub Menu Links Configuration
 * ----------------------------------------
 * This file documents all header navigation options for both
 * desktop and mobile (drawer) views.
 *
 * Layout split (desktop):
 *   - navItemsConfig        -> Header bar (compact 1-word category labels)
 *   - headerDropdownConfig  -> Header secondary dropdown
 *
 * Mobile:
 *   - drawerItemsConfig     -> HubMenu drawer list + MobileDock nav
 *   - tourCategoriesConfig  -> HubMenu "Categories" section
 */

// Desktop header items — one-word labels to keep the bar compact.
const navItemsConfig = [
  { labelKey: 'nav.header.tours', fallback: 'Tours', href: '/tours', icon: 'LayoutGrid' },
  {
    labelKey: 'nav.header.culinary',
    fallback: 'Culinary',
    href: '/tours?category=gastronomy',
    icon: 'Utensils',
  },
  {
    labelKey: 'nav.header.history',
    fallback: 'History',
    href: '/tours?category=history',
    icon: 'Skull',
  },
  {
    labelKey: 'nav.header.neighborhoods',
    fallback: 'Neighborhoods',
    href: '/tours?category=neighborhoods',
    icon: 'MapPin',
  },
  {
    labelKey: 'nav.header.museums',
    fallback: 'Museums',
    href: '/tours?category=museums',
    icon: 'Palette',
  },
]

// Desktop "More" dropdown — secondary pages (Experiences, Stories, News, Contact + Pricing + All Tours).
const headerDropdownConfig = [
  {
    labelKey: 'header.nav.experiences',
    fallback: 'Experiences',
    href: '/experiences',
    icon: 'Compass',
  },
  { labelKey: 'header.nav.stories', fallback: 'Stories', href: '/stories', icon: 'BookOpen' },
  { labelKey: 'header.nav.news', fallback: 'News', href: '/news', icon: 'Newspaper' },
  { labelKey: 'header.nav.contact', fallback: 'Contact', href: '/contact', icon: 'Mail' },
  { labelKey: 'header.nav.pricing', fallback: 'Pricing', href: '/pricing', icon: 'Tag' },
  { labelKey: 'tourCategories.all', fallback: 'All Tours', href: '/tours', icon: 'LayoutGrid' },
]

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
  { labelKey: 'header.nav.contact', fallback: 'Contact', href: '/contact', icon: 'Mail' },
  { labelKey: 'header.nav.pricing', fallback: 'Pricing', href: '/pricing', icon: 'Tag' },
  { labelKey: 'tourCategories.all', fallback: 'All Tours', href: '/tours', icon: 'LayoutGrid' },
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
