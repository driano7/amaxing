/**
 * Minimal drop-in replacement for fast-equals' `deepEqual`.
 *
 * Why: Next 12.1.4's config disables package.json `exportsFields`, so
 * `fast-equals` resolves to a build whose format this old webpack can't
 * statically analyze → `import { deepEqual } from 'fast-equals'` becomes
 * undefined at runtime and crashes react-smooth chart animations.
 * react-smooth only uses `deepEqual` (to compare Animate props).
 *
 * Pure CommonJS on purpose so webpack treats it as a plain CJS module.
 */

function isNaNValue(value) {
  return typeof value === 'number' && value !== value
}

function deepEqual(a, b) {
  if (a === b) return true

  if (typeof a !== typeof b) return false

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    // NaN === NaN is false
    return isNaNValue(a) && isNaNValue(b)
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  // Dates
  if (a instanceof Date || b instanceof Date) {
    if (!(a instanceof Date) || !(b instanceof Date)) return false
    return a.getTime() === b.getTime()
  }

  // RegExps
  if (a instanceof RegExp || b instanceof RegExp) {
    if (!(a instanceof RegExp) || !(b instanceof RegExp)) return false
    return a.source === b.source && a.flags === b.flags
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

module.exports = { deepEqual }
