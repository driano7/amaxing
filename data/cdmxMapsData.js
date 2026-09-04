export const CDMX_PAGE_HEADER = {
  badge: 'Guía Interactiva CDMX 2026',
  title: 'Explora la Ciudad de México: Datos, Gastronomía y Zonas Clave',
  description:
    'Cinco mapas curados para descubrir la CDMX sin clichés: desde fondas tradicionales sin tacos hasta datos oficiales de seguridad, coctelería de autor y joyas que solo los locales conocen. Cada punto está verificado y pensado para visitantes de 2 a 7 días.',
}

export const CDMX_MAPS_DATA = [
  {
    id: 'comida-tradicional',
    eyebrow: 'Gastronomía',
    dockLabel: 'Comida',
    dockIcon: 'food',
    title: 'Comida Tradicional',
    cardDescription:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas. De $ a $$, con historia.',
    summary:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas.',
    highlights: [
      'El Vilsito — Narvarte — $ 25-35 MXN, taller de día / pastor de noche 2pm-5am',
      'El Gato Volador — Narvarte — $ 22-30 MXN, pastor/suadero/bistec salsas caseras',
      'Los Cocuyos — Centro — 24h — $ 22-30 MXN, suadero confitado Bourdain',
      'El Borrego Viudo — Tacubaya — 24h — $ 20-28 MXN, drive-in + tepache',
      'El Manantial — Condesa — $ 30-45 MXN, al carbón costilla/chuleta',
    ],
    accentColor: '#C1440E',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1B3HejFh6kx-pLcEQ-iS0xY61kd1DjsA',
  },
  {
    id: 'zonas-precaucion',
    eyebrow: 'Seguridad',
    dockLabel: 'Precaución',
    dockIcon: 'safety',
    title: 'Zonas de Precaución',
    cardDescription:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar — para moverte con información.',
    summary:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar.',
    highlights: [
      'Tepito (Eje 1 Norte) — Riesgo Alto — evitar de noche, de día solo con contacto local',
      'Mercado de la Merced y callejones — Medio-Alto — de día con precaución (7am-2pm), evitar de noche',
      'Colonia Doctores (interiores) — Medio-Alto nocturno — avenidas bien, calles interiores no de noche',
      'Iztapalapa oriente profundo — Alto en periferia — parques centrales de día sí, colonias oriente no',
      'Nezahualcóyotl franja oriente — Medio-Alto — zona conurbada no turística, sin motivo de visita',
    ],
    accentColor: '#DC2626',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1ZhnbDuiuHIjYOsNo5N0rXDiDsXkqxlY',
  },
  {
    id: 'vida-nocturna',
    eyebrow: 'Vida Nocturna',
    dockLabel: 'Noche',
    dockIcon: 'nightlife',
    title: 'Vida Nocturna — Bares Relax',
    cardDescription:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer. Sin antros, sin filas.',
    summary:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer.',
    highlights: [
      'La Clandestina — Condesa — $$ 130-190 MXN, mezcales silvestres en garrafón',
      'Bósforo — Centro — $$ 110-170 MXN, ancestral + jazz cerca de Alameda',
      'La Bipo Condesa — $$ 60-90 MXN, cantina pop + terraza diario 1pm-2am',
      'Salón Tenampa — Garibaldi — $$ 80-160 MXN, cantina 1925 + mariachis',
      'Salón Corona Bolívar — $ 45-75 MXN, cervecería 1928, tarro helado',
    ],
    accentColor: '#7B2BD9',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1ypoMFdu_ULDPn_BxqEqcASo5R2kxd-o',
  },
  {
    id: 'joyas-escondidas',
    eyebrow: 'Joyas',
    dockLabel: 'Joyas',
    dockIcon: 'gem',
    title: 'Joyas Escondidas',
    cardDescription:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    summary:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    highlights: [
      'Biblioteca Vasconcelos — Buenavista — Gratis, ballena de Orozco y estanterías flotantes',
      'Kiosco Morisco Santa María — Gratis, pabellón 1884 + danzón domingos',
      'Casa Luis Barragán — $$$ 450-550 MXN, reserva previa, Pritzker UNESCO',
      'Anahuacalli — $$ 100 MXN, templo volcánico de Rivera, 50k piezas',
      'Casa León Trotsky — $$ 90 MXN, casa fortificada y tumba en jardín',
    ],
    accentColor: '#0E8C7A',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1Uz45Dp8d64SJTwNpAj9Ol97q6qIE290',
  },
  {
    id: 'top-atracciones',
    eyebrow: 'Imperdibles',
    dockLabel: 'Imperdibles',
    dockIcon: 'attraction',
    title: 'Top Atracciones',
    cardDescription:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán. Curaduría local, datos reales y trucos para evitar filas.',
    summary:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán.',
    highlights: [
      'Museo Nacional de Antropología — Chapultepec — 95 MXN, domingos gratis nacionales',
      'Castillo de Chapultepec & Museo Nacional de Historia — 95 MXN, terrazas al atardecer',
      'Bosque de Chapultepec (Lago Mayor & Calzada Flotante) — Gratis, remo y calzada flotante',
      'Museo Soumaya (Plaza Carso) — Gratis todos los días, colección Rodin',
      'Museo Tamayo — 85 MXN, brutalismo entre árboles + brunch con vista',
    ],
    accentColor: '#F2A03D',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1nWouNurCJnhDUsyOgskLVIjDUsPFZ5U',
  },
]
