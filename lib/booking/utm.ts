// Captura del canal de adquisición (first-touch) para CAC por canal.
// Lee utm_source / utm_medium / ref / gclid / fbclid de la URL una vez por
// sesión y lo guarda en sessionStorage; el checkout lo adjunta al crear la reserva.
// Sin UTM: 'organic'. Sin backend: 100% client-side.
const KEY = 'amaxing_acquisition_channel'

function channelFromParams(params: URLSearchParams): string | null {
  const source = (params.get('utm_source') || '').toLowerCase()
  if (source) return source
  if (params.get('gclid')) return 'google-ads'
  if (params.get('fbclid') || params.get('msclkid')) return 'meta-ads'
  const ref = (params.get('ref') || '').toLowerCase()
  if (ref) return ref
  return null
}

export function captureAcquisitionChannel(): string {
  if (typeof window === 'undefined') return 'organic'
  try {
    const existing = sessionStorage.getItem(KEY)
    if (existing) return existing
    const found = channelFromParams(new URLSearchParams(window.location.search))
    const channel = found || 'organic'
    sessionStorage.setItem(KEY, channel)
    return channel
  } catch {
    return 'organic'
  }
}

export function getAcquisitionChannel(): string {
  if (typeof window === 'undefined') return 'organic'
  try {
    return sessionStorage.getItem(KEY) || captureAcquisitionChannel()
  } catch {
    return 'organic'
  }
}
