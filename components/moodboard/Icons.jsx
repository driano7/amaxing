export function OjosOscuridad({ className = '', size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="5" y="5" width="90" height="90" rx="24" fill="#2E2E33" />
      <path d="M30 50 Q38 30 46 50 Q38 70 30 50 Z" fill="#FFF6F1" />
      <path d="M54 50 Q62 30 70 50 Q62 70 54 50 Z" fill="#FFF6F1" />
      <circle cx="38" cy="50" r="3.5" fill="#E4007C" />
      <circle cx="62" cy="50" r="3.5" fill="#E4007C" />
    </svg>
  )
}

export function RosetaAbstracta({ className = '', size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="46" fill="#FFF6F1" />
      <circle cx="50" cy="30" r="7" fill="#0E8C7A" />
      <circle cx="68" cy="38" r="7" fill="#0E8C7A" />
      <circle cx="72" cy="58" r="7" fill="#0E8C7A" />
      <circle cx="58" cy="72" r="7" fill="#0E8C7A" />
      <circle cx="38" cy="70" r="7" fill="#0E8C7A" />
      <circle cx="28" cy="52" r="6" fill="#0E8C7A" />
      <circle cx="50" cy="50" r="10" fill="#E4007C" />
    </svg>
  )
}

export function CabezaFacetada({ className = '', size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <polygon points="50,10 30,5 38,28 15,45 25,75 50,90 75,75 85,45 62,28 70,5" fill="#2E2E33" />
      <polygon points="50,10 85,45 50,50" fill="#E4007C" opacity="0.9" />
      <polygon points="50,50 85,45 75,75" fill="#0E8C7A" opacity="0.9" />
      <polygon points="50,50 75,75 50,90" fill="#F2A03D" opacity="0.9" />
      <polygon points="50,90 25,75 50,50" fill="#C1440E" opacity="0.9" />
      <polygon points="50,50 25,75 15,45" fill="#B5006A" opacity="0.9" />
      <polygon points="50,50 15,45 50,10" fill="#FAF3EA" opacity="0.5" />
    </svg>
  )
}

export function GrecaOjoFelino({ className = '', size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="4" y="4" width="92" height="92" fill="#FAF3EA" />
      <path
        d="M10,25 L10,15 L20,15 L20,25 L30,25 L30,15 L40,15 L40,25 L60,25 L60,15 L70,15 L70,25 L80,25 L80,15 L90,15 L90,25"
        fill="none"
        stroke="#C1440E"
        strokeWidth="4"
      />
      <path
        d="M10,75 L10,85 L20,85 L20,75 L30,75 L30,85 L40,85 L40,75 L60,75 L60,85 L70,85 L70,75 L80,75 L80,85 L90,85 L90,75"
        fill="none"
        stroke="#C1440E"
        strokeWidth="4"
      />
      <path d="M50 38 Q60 50 50 62 Q40 50 50 38 Z" fill="#2E2E33" />
      <circle cx="50" cy="50" r="4" fill="#E4007C" />
    </svg>
  )
}
