// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Reglas de contraseña. Mismo criterio que en XocoCafé: longitud primero,
// y comprobaciones legibles para que la persona entienda qué falta.

export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'lower',
    label: 'Una minúscula',
    test: (value: string) => /[a-záéíóúñü]/.test(value),
  },
  {
    id: 'upper',
    label: 'Una mayúscula',
    test: (value: string) => /[A-ZÁÉÍÓÚÑÜ]/.test(value),
  },
  {
    id: 'number',
    label: 'Un número',
    test: (value: string) => /\d/.test(value),
  },
] as const

export interface PasswordCheck {
  valid: boolean
  failed: { id: string; label: string }[]
  passed: number
  total: number
}

export function checkPassword(value: string): PasswordCheck {
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => ({
    id: rule.id,
    label: rule.label,
  }))
  return {
    valid: failed.length === 0,
    failed,
    passed: PASSWORD_RULES.length - failed.length,
    total: PASSWORD_RULES.length,
  }
}

export function validatePassword(value: string): string | null {
  const { valid, failed } = checkPassword(value)
  if (valid) return null
  return `La contraseña necesita: ${failed.map((f) => f.label.toLowerCase()).join(', ')}`
}

/** El backend usa la misma regla; aquí evitamos el viaje de ida y vuelta. */
export function validateConfirmation(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirma tu contraseña'
  if (password !== confirm) return 'Las contraseñas no coinciden'
  return null
}
