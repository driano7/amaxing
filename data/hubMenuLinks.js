/**
 * Centralized Hub Menu Links Configuration
 * ----------------------------------------
 * This file documents all header navigation options for both
 * desktop and mobile (drawer) views.
 *
 * Each item has:
 *   - labelKey:  i18n key for translation (or null for hardcoded labels)
 *   - fallback:  fallback label if translation is missing
 *   - href:      route or URL
 *   - icon:      optional icon name (only for desktop category items)
 *   - isCategory: whether this item is a tour category (styled differently on desktop)
 *
 * Usage in Navbar.tsx:
 *   import { navItemsConfig, drawerItemsConfig } from '@/data/hubMenuLinks'
 *   const navItems = navItemsConfig.map((item) => ({
 *     ...item,
 *     label: item.labelKey ? getLabel(item.labelKey, item.fallback) : item.fallback,
 *   }))
 */

// Icon imports are handled in the component that uses this config.
// We store the icon name as a string and map it in the component.
// This keeps this file free of JSX/TSX dependencies.

const navItemsConfig = [
  { labelKey: 'header.nav.home', fallback: 'Home', href: '/' },
  { labelKey: 'header.nav.tours', fallback: 'Tours', href: '/tours' },
  {
    label: 'Culinary Underworld',
    href: '/tours?category=gastronomy',
    icon: 'Utensils',
    isCategory: true,
  },
  { label: 'Uncensored History', href: '/tours?category=history', icon: 'Skull', isCategory: true },
  {
    label: 'Neighborhood Deep Dives',
    href: '/tours?category=neighborhoods',
    icon: 'MapPin',
    isCategory: true,
  },
  { label: 'Art & Museums', href: '/tours?category=museums', icon: 'Palette', isCategory: true },
  { labelKey: 'header.nav.experiences', fallback: 'Experiences', href: '/experiences' },
  { labelKey: 'header.nav.stories', fallback: 'Stories', href: '/stories' },
  { labelKey: 'header.nav.news', fallback: 'News', href: '/news' },
  { labelKey: 'header.nav.pricing', fallback: 'Pricing', href: '/pricing' },
  { labelKey: 'header.nav.contact', fallback: 'Contact', href: '/contact' },
]

// Mobile drawer items (same as desktop but without icons)
const drawerItemsConfig = [
  { labelKey: 'header.nav.home', fallback: 'Home', href: '/' },
  { labelKey: 'header.nav.tours', fallback: 'Tours', href: '/tours' },
  { label: 'Culinary Underworld', href: '/tours?category=gastronomy' },
  { label: 'Uncensored History', href: '/tours?category=history' },
  { label: 'Neighborhood Deep Dives', href: '/tours?category=neighborhoods' },
  { label: 'Art & Museums', href: '/tours?category=museums' },
  { labelKey: 'header.nav.experiences', fallback: 'Experiences', href: '/experiences' },
  { labelKey: 'header.nav.stories', fallback: 'Stories', href: '/stories' },
  { labelKey: 'header.nav.news', fallback: 'News', href: '/news' },
  { labelKey: 'header.nav.pricing', fallback: 'Pricing', href: '/pricing' },
  { labelKey: 'header.nav.contact', fallback: 'Contact', href: '/contact' },
]

// Map icon names to components (used by Navbar)
const iconMap = {
  Utensils: 'Utensils',
  Skull: 'Skull',
  MapPin: 'MapPin',
  Palette: 'Palette',
}

module.exports = {
  navItemsConfig,
  drawerItemsConfig,
  iconMap,
}
