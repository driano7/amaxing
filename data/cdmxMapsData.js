export const CDMX_PAGE_HEADER = {
  es: {
    badge: 'Guía Interactiva CDMX 2026',
    title: 'Explora la Ciudad de México: Datos, Gastronomía y Zonas Clave',
    description:
      'Cinco mapas curados para descubrir la CDMX sin clichés: desde fondas tradicionales sin tacos hasta datos oficiales de seguridad, coctelería de autor y joyas que solo los locales conocen. Cada punto está verificado y pensado para visitantes de 2 a 7 días.',
  },
  en: {
    badge: 'CDMX Interactive Guide 2026',
    title: 'Explore Mexico City: Data, Food & Key Zones',
    description:
      'Five curated maps to discover CDMX without clichés: from traditional fondas beyond tacos to official safety data, signature cocktails and hidden gems only locals know. Every point verified for 2- to 7-day visitors.',
  },
}

export const CDMX_MAPS_DATA = [
  {
    id: 'comida-tradicional',
    eyebrow: 'Gastronomía',
    eyebrow_es: 'Gastronomía',
    eyebrow_en: 'Gastronomy',
    dockLabel: 'Comida',
    dockLabel_es: 'Comida',
    dockLabel_en: 'Food',
    dockIcon: 'food',
    title: 'Comida Tradicional',
    title_es: 'Comida Tradicional',
    title_en: 'Traditional Food',
    cardDescription:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas. De $ a $$, con historia.',
    cardDescription_es:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas. De $ a $$, con historia.',
    cardDescription_en:
      '20 neighborhood fondas and late-night taquerias: trompo pastor, 24h suadero, pozole, pit barbacoa and historic tortas. $ to $$, with history.',
    summary:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas.',
    summary_es:
      '20 fondas y taquerías de barrio: pastor de trompo, suadero 24h, pozole, barbacoa de hoyo y tortas históricas.',
    summary_en:
      '20 neighborhood spots: trompo pastor, 24h suadero, pozole, pit barbacoa and historic tortas.',
    highlights: [
      'El Vilsito — Narvarte — $ 25-35 MXN, taller de día / pastor de noche 2pm-5am',
      'El Gato Volador — Narvarte — $ 22-30 MXN, pastor/suadero/bistec salsas caseras',
      'Los Cocuyos — Centro — 24h — $ 22-30 MXN, suadero confitado Bourdain',
      'El Borrego Viudo — Tacubaya — 24h — $ 20-28 MXN, drive-in + tepache',
      'El Manantial — Condesa — $ 30-45 MXN, al carbón costilla/chuleta',
    ],
    highlights_es: [
      'El Vilsito — Narvarte — $ 25-35 MXN, taller de día / pastor de noche 2pm-5am',
      'El Gato Volador — Narvarte — $ 22-30 MXN, pastor/suadero/bistec salsas caseras',
      'Los Cocuyos — Centro — 24h — $ 22-30 MXN, suadero confitado Bourdain',
      'El Borrego Viudo — Tacubaya — 24h — $ 20-28 MXN, drive-in + tepache',
      'El Manantial — Condesa — $ 30-45 MXN, al carbón costilla/chuleta',
    ],
    highlights_en: [
      'El Vilsito — Narvarte — $25-35 MXN, auto shop by day / pastor by night 2pm-5am',
      'El Gato Volador — Narvarte — $22-30 MXN, pastor/suadero/steak with salsas',
      'Los Cocuyos — Centro — 24h — $22-30 MXN, confit suadero, Bourdain’s favorite',
      'El Borrego Viudo — Tacubaya — 24h — $20-28 MXN, drive-in + tepache',
      'El Manantial — Condesa — $30-45 MXN, charcoal costilla/chuleta',
    ],
    accentColor: '#C1440E',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1B3HejFh6kx-pLcEQ-iS0xY61kd1DjsA',
  },
  {
    id: 'zonas-precaucion',
    eyebrow: 'Seguridad',
    eyebrow_es: 'Seguridad',
    eyebrow_en: 'Safety',
    dockLabel: 'Precaución',
    dockLabel_es: 'Precaución',
    dockLabel_en: 'Caution',
    dockIcon: 'safety',
    title: 'Zonas de Precaución',
    title_es: 'Zonas de Precaución',
    title_en: 'Caution Zones',
    cardDescription:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar — para moverte con información.',
    cardDescription_es:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar — para moverte con información.',
    cardDescription_en:
      '8 zones verified with SESNSP/C5 data: where to be extra careful by time and risk type, without alarm — move informed.',
    summary:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar.',
    summary_es:
      '8 zonas verificadas con datos SESNSP/C5: dónde extremar precauciones por horario y tipo de riesgo, sin alarmar.',
    summary_en:
      '8 verified zones with SESNSP/C5 data: where to be extra careful by time and risk type.',
    highlights: [
      'Tepito (Eje 1 Norte) — Riesgo Alto — evitar de noche, de día solo con contacto local',
      'Mercado de la Merced y callejones — Medio-Alto — de día con precaución (7am-2pm), evitar de noche',
      'Colonia Doctores (interiores) — Medio-Alto nocturno — avenidas bien, calles interiores no de noche',
      'Iztapalapa oriente profundo — Alto en periferia — parques centrales de día sí, colonias oriente no',
      'Nezahualcóyotl franja oriente — Medio-Alto — zona conurbada no turística, sin motivo de visita',
    ],
    highlights_es: [
      'Tepito (Eje 1 Norte) — Riesgo Alto — evitar de noche, de día solo con contacto local',
      'Mercado de la Merced y callejones — Medio-Alto — de día con precaución (7am-2pm), evitar de noche',
      'Colonia Doctores (interiores) — Medio-Alto nocturno — avenidas bien, calles interiores no de noche',
      'Iztapalapa oriente profundo — Alto en periferia — parques centrales de día sí, colonias oriente no',
      'Nezahualcóyotl franja oriente — Medio-Alto — zona conurbada no turística, sin motivo de visita',
    ],
    highlights_en: [
      'Tepito (Eje 1 Norte) — High — avoid at night, by day only with local contact',
      'La Merced market & alleys — Medium-High — caution by day (7am-2pm), avoid at night',
      'Doctores (inner streets) — Medium-High at night — main avenues ok, inner streets not at night',
      'Iztapalapa deep east — High in periphery — central parks by day yes, outer colonies no',
      'Nezahualcóyotl eastern fringe — Medium-High — non-tourist conurbation, no reason to visit',
    ],
    accentColor: '#DC2626',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1ZhnbDuiuHIjYOsNo5N0rXDiDsXkqxlY',
  },
  {
    id: 'vida-nocturna',
    eyebrow: 'Vida Nocturna',
    eyebrow_es: 'Vida Nocturna',
    eyebrow_en: 'Nightlife',
    dockLabel: 'Noche',
    dockLabel_es: 'Noche',
    dockLabel_en: 'Night',
    dockIcon: 'nightlife',
    title: 'Vida Nocturna — Bares Relax',
    title_es: 'Vida Nocturna — Bares Relax',
    title_en: 'Nightlife — Relax Bars',
    cardDescription:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer. Sin antros, sin filas.',
    cardDescription_es:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer. Sin antros, sin filas.',
    cardDescription_en:
      '20 bars to talk without shouting: neighborhood mezcalerias, pulquerias, historic cantinas and sunset terraces. No clubs, no lines.',
    summary:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer.',
    summary_es:
      '20 bares para platicar sin gritar: mezcalerías de barrio, pulquerías, cantinas históricas y terrazas al atardecer.',
    summary_en: '20 bars to chat: mezcalerias, pulquerias, historic cantinas and sunset terraces.',
    highlights: [
      'La Clandestina — Condesa — $$ 130-190 MXN, mezcales silvestres en garrafón',
      'Bósforo — Centro — $$ 110-170 MXN, ancestral + jazz cerca de Alameda',
      'La Bipo Condesa — $$ 60-90 MXN, cantina pop + terraza diario 1pm-2am',
      'Salón Tenampa — Garibaldi — $$ 80-160 MXN, cantina 1925 + mariachis',
      'Salón Corona Bolívar — $ 45-75 MXN, cervecería 1928, tarro helado',
    ],
    highlights_es: [
      'La Clandestina — Condesa — $$ 130-190 MXN, mezcales silvestres en garrafón',
      'Bósforo — Centro — $$ 110-170 MXN, ancestral + jazz cerca de Alameda',
      'La Bipo Condesa — $$ 60-90 MXN, cantina pop + terraza diario 1pm-2am',
      'Salón Tenampa — Garibaldi — $$ 80-160 MXN, cantina 1925 + mariachis',
      'Salón Corona Bolívar — $ 45-75 MXN, cervecería 1928, tarro helado',
    ],
    highlights_en: [
      'La Clandestina — Condesa — $$130-190 MXN, wild mezcals in demijohn',
      'Bósforo — Centro — $$110-170 MXN, ancestral + jazz near Alameda',
      'La Bipo Condesa — $$60-90 MXN, pop cantina + terrace daily 1pm-2am',
      'Salón Tenampa — Garibaldi — $$80-160 MXN, 1925 cantina + mariachis',
      'Salón Corona Bolívar — $45-75 MXN, 1928 brewery, frosty mug',
    ],
    accentColor: '#7B2BD9',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1ypoMFdu_ULDPn_BxqEqcASo5R2kxd-o',
  },
  {
    id: 'joyas-escondidas',
    eyebrow: 'Joyas',
    eyebrow_es: 'Joyas',
    eyebrow_en: 'Gems',
    dockLabel: 'Joyas',
    dockLabel_es: 'Joyas',
    dockLabel_en: 'Gems',
    dockIcon: 'gem',
    title: 'Joyas Escondidas',
    title_es: 'Joyas Escondidas',
    title_en: 'Hidden Gems',
    cardDescription:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    cardDescription_es:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    cardDescription_en:
      '20 hidden gems: Vasconcelos, Morisco Kiosk, Barragán, Anahuacalli and Trotsky. Architecture, silence and no lines.',
    summary:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    summary_es:
      '20 joyas poco visitadas: Vasconcelos, Kiosco Morisco, Barragán, Anahuacalli y Trotsky. Arquitectura, silencio y fotos sin filas.',
    summary_en: '20 hidden gems: Vasconcelos, Morisco Kiosk, Barragán, Anahuacalli and Trotsky.',
    highlights: [
      'Biblioteca Vasconcelos — Buenavista — Gratis, ballena de Orozco y estanterías flotantes',
      'Kiosco Morisco Santa María — Gratis, pabellón 1884 + danzón domingos',
      'Casa Luis Barragán — $$$ 450-550 MXN, reserva previa, Pritzker UNESCO',
      'Anahuacalli — $$ 100 MXN, templo volcánico de Rivera, 50k piezas',
      'Casa León Trotsky — $$ 90 MXN, casa fortificada y tumba en jardín',
    ],
    highlights_es: [
      'Biblioteca Vasconcelos — Buenavista — Gratis, ballena de Orozco y estanterías flotantes',
      'Kiosco Morisco Santa María — Gratis, pabellón 1884 + danzón domingos',
      'Casa Luis Barragán — $$$ 450-550 MXN, reserva previa, Pritzker UNESCO',
      'Anahuacalli — $$ 100 MXN, templo volcánico de Rivera, 50k piezas',
      'Casa León Trotsky — $$ 90 MXN, casa fortificada y tumba en jardín',
    ],
    highlights_en: [
      'Vasconcelos Library — Buenavista — Free, Orozco whale & floating shelves',
      'Morisco Kiosk Sta. María — Free, 1884 pavilion + Sunday danzón',
      'Luis Barragán House — $$$450-550 MXN, advance booking, Pritzker UNESCO',
      'Anahuacalli — $$100 MXN, Rivera volcanic temple, 50k pieces',
      'Leon Trotsky House — $$90 MXN, fortified house & garden tomb',
    ],
    accentColor: '#0E8C7A',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1Uz45Dp8d64SJTwNpAj9Ol97q6qIE290',
  },
  {
    id: 'top-atracciones',
    eyebrow: 'Imperdibles',
    eyebrow_es: 'Imperdibles',
    eyebrow_en: 'Must-See',
    dockLabel: 'Imperdibles',
    dockLabel_es: 'Imperdibles',
    dockLabel_en: 'Top',
    dockIcon: 'attraction',
    title: 'Top Atracciones',
    title_es: 'Top Atracciones',
    title_en: 'Top Attractions',
    cardDescription:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán. Curaduría local, datos reales y trucos para evitar filas.',
    cardDescription_es:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán. Curaduría local, datos reales y trucos para evitar filas.',
    cardDescription_en:
      'What’s really worth it among tourist classics: 40 verified points — from Anthropology to Bosque, Soumaya and Teotihuacán. Local curation, real data and line-skipping tips.',
    summary:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán.',
    summary_es:
      'Lo que sí vale la pena entre lo turístico: 40 puntos verificados — de Antropología al Bosque, Soumaya y Teotihuacán.',
    summary_en: '40 verified must-sees: from Anthropology to Bosque, Soumaya and Teotihuacán.',
    highlights: [
      'Museo Nacional de Antropología — Chapultepec — 95 MXN, domingos gratis nacionales',
      'Castillo de Chapultepec & Museo Nacional de Historia — 95 MXN, terrazas al atardecer',
      'Bosque de Chapultepec (Lago Mayor & Calzada Flotante) — Gratis, remo y calzada flotante',
      'Museo Soumaya (Plaza Carso) — Gratis todos los días, colección Rodin',
      'Museo Tamayo — 85 MXN, brutalismo entre árboles + brunch con vista',
    ],
    highlights_es: [
      'Museo Nacional de Antropología — Chapultepec — 95 MXN, domingos gratis nacionales',
      'Castillo de Chapultepec & Museo Nacional de Historia — 95 MXN, terrazas al atardecer',
      'Bosque de Chapultepec (Lago Mayor & Calzada Flotante) — Gratis, remo y calzada flotante',
      'Museo Soumaya (Plaza Carso) — Gratis todos los días, colección Rodin',
      'Museo Tamayo — 85 MXN, brutalismo entre árboles + brunch con vista',
    ],
    highlights_en: [
      'National Anthropology Museum — Chapultepec — 95 MXN, Sundays free for nationals',
      'Chapultepec Castle & National History Museum — 95 MXN, sunset terraces',
      'Chapultepec Forest (Mayor Lake & Floating Causeway) — Free, rowing & causeway',
      'Soumaya Museum (Plaza Carso) — Free daily, Rodin collection',
      'Tamayo Museum — 85 MXN, brutalism among trees + brunch with a view',
    ],
    accentColor: '#F2A03D',
    embedUrl: 'https://www.google.com/maps/d/embed?mid=1nWouNurCJnhDUsyOgskLVIjDUsPFZ5U',
  },
]
