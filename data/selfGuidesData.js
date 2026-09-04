// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
export const GUIDES_PAGE_HEADER = {
  es: {
    badge: '5 Journeys de Cultura Fácil',
    title: 'Recorre la CDMX a tu ritmo: cultura fácil, sin guía',
    description:
      'Cinco recorridos autoguiados para curiosos de 60 a 90 minutos. Contexto ligero, datos que se cuentan, y ruta clara para caminar solo con tu celular.',
  },
  en: {
    badge: '5 Easy Culture Journeys',
    title: 'Explore CDMX at your pace: easy culture, no guide needed',
    description:
      'Five self-guided walks (60–90 min) for the curious. Light context, story-worthy facts, and a clear step-by-step route you can follow with just your phone.',
  },
}

export const SELF_GUIDES_DATA = [
  {
    id: 'condesa-hipodromo',
    slug_es: 'condesa-a-pie',
    slug_en: 'condesa-walk',
    title_es: 'Condesa a Pie — Art Deco & Jacarandas',
    title_en: 'Condesa Walk — Art Deco & Jacarandas',
    neighborhood_es: 'Condesa · Hipódromo',
    neighborhood_en: 'Condesa · Hipódromo',
    dockLabel_es: 'Condesa',
    dockLabel_en: 'Condesa',
    duration_es: '60 min · 2.1 km · plano',
    duration_en: '60 min · 2.1 km · flat',
    summary_es:
      'El trazo del antiguo hipódromo, sus edificios de los años 30 y el corredor de jacarandas de Ámsterdam. Ideal al atardecer, entre cafés y parques.',
    summary_en:
      'The former racetrack layout, its 1930s architecture, and the jacaranda corridor of Amsterdam. Perfect at dusk, between cafés and parks.',
    highlights_es: [
      'Parque México trazado sobre curva del hipódromo (1927) + Foro Lindbergh Art Deco',
      'Edificio Basurto & casas funcionalistas de Juan O’Gorman en la Roma-Condesa',
      'Ámsterdam sin tráfico: balcones franceses y bugambilias en cada esquina',
    ],
    highlights_en: [
      'Parque México laid on the racetrack oval (1927) + Art Deco Lindbergh Forum',
      'Basurto Building & functionalist houses by Juan O’Gorman in Roma-Condesa',
      'Car-free Amsterdam: French balconies and bougainvilleas on every corner',
    ],
    accentColor: '#0E8C7A',
    dockIcon: 'racetrack',
    image: '/static/images/polanco.jpeg',
  },
  {
    id: 'centro-palacios',
    slug_es: 'centro-palacios',
    slug_en: 'historic-center-palaces',
    title_es: 'Centro de Palacios — 400 años en 1 km',
    title_en: 'Palace District — 400 Years in 1 km',
    neighborhood_es: 'Centro Histórico',
    neighborhood_en: 'Historic Center',
    dockLabel_es: 'Centro',
    dockLabel_en: 'Centro',
    duration_es: '75 min · 1.4 km · adoquín',
    duration_en: '75 min · 1.4 km · cobblestone',
    summary_es:
      'De Bellas Artes al Zócalo por Madero y Regina: palacios virreinales, cantera rosa y el contraste entre la traza mexica y la neoclásica.',
    summary_en:
      'From Bellas Artes to Zócalo via Madero and Regina: viceregal palaces, pink quarry stone, and the clash of Mexica and neoclassical grids.',
    highlights_es: [
      'Casa de los Azulejos (1737) talavera poblana + mural de Orozco en el patio',
      'Palacio Postal (1907) herrería dorada + Palacio de Minería (1813) meteoritos',
      'Catedral (1573–1813) tres siglos de estilos sobre templo mexica; Templo Mayor al lado',
    ],
    highlights_en: [
      'House of Tiles (1737) Puebla Talavera + Orozco mural in the patio',
      'Postal Palace (1907) gilded iron + Mining Palace (1813) meteorites',
      'Cathedral (1573–1813) three centuries of styles atop Mexica temple; Templo Mayor next door',
    ],
    accentColor: '#C1440E',
    dockIcon: 'palace',
    image: '/static/images/bellas.jpeg',
  },
  {
    id: 'chapultepec-ii',
    slug_es: 'chapultepec-agua',
    slug_en: 'chapultepec-agua',
    title_es: 'Chapultepec II — Agua, Bosque y Murales',
    title_en: 'Chapultepec II — Water, Forest & Murals',
    neighborhood_es: 'Chapultepec · 2ª Sección',
    neighborhood_en: 'Chapultepec · 2nd Section',
    dockLabel_es: 'Chapultepec',
    dockLabel_en: 'Chapultepec',
    duration_es: '80 min · 3.0 km · bosque',
    duration_en: '80 min · 3.0 km · forest',
    summary_es:
      'La parte menos visitada del bosque: hidráulica, murales bajo agua y la fuente de Tláloc. Silencio y sombra para caminar sin prisa.',
    summary_en:
      'The forest’s quiet side: waterworks, underwater murals and the Tláloc fountain. Shade and silence for an unhurried walk.',
    highlights_es: [
      'Cárcamo de Dolores: mural submarino de Rivera “El agua, origen de la vida” + fuente Tláloc',
      'Jardín Botánico & Audiorama: 5 hectáreas de sombra entre Antropología y Castillo',
      'Calzada Flotante (Chapultepec) puente elevado entre copas de árboles',
    ],
    highlights_en: [
      'Cárcamo de Dolores: Rivera’s underwater mural “Water, Origin of Life” + Tláloc fountain',
      'Botanical Garden & Audiorama: 5 hectares of shade between Anthropology and Castle',
      'Floating Causeway: elevated bridge through the canopy',
    ],
    accentColor: '#2E86AB',
    dockIcon: 'water',
    image: '/static/images/chapu.jpeg',
  },
  {
    id: 'chimalistac-puentes',
    slug_es: 'chimalistac-puentes',
    slug_en: 'chimalistac-bridges',
    title_es: 'Chimalistac — Puentes de Piedra y Acequias',
    title_en: 'Chimalistac — Stone Bridges & Canals',
    neighborhood_es: 'Chimalistac · Coyoacán',
    neighborhood_en: 'Chimalistac · Coyoacán',
    dockLabel_es: 'Chimalistac',
    dockLabel_en: 'Chimalistac',
    duration_es: '60 min · 1.8 km · empedrado',
    duration_en: '60 min · 1.8 km · cobblestone',
    summary_es:
      'Un barrio del siglo XVII congelado: puentes jorobados, capilla del Carmen y el sonido del agua entre ahuehuetes.',
    summary_en:
      'A 17th-century village frozen in time: humpback bridges, Carmen chapel and water murmuring among ahuehuetes.',
    highlights_es: [
      'Puente del Púlpito (siglo XVII) sobre antigua acequia del río Magdalena',
      'Iglesia del Carmen y jardín de San Sebastián: cantera y bugambilias',
      'Vecino a San Ángel: remate en Plaza San Jacinto + San Ángel Inn (bazar sábado)',
    ],
    highlights_en: [
      'Púlpito Bridge (17th c.) over the former Magdalena River canal',
      'Carmen Church and San Sebastián garden: quarry stone & bougainvillea',
      'Next to San Ángel: finish at San Jacinto Plaza + San Ángel Inn (Saturday bazaar)',
    ],
    accentColor: '#7B2BD9',
    dockIcon: 'bridge',
    image: '/static/images/fridaYDiego/Las-dos-fridas-autorretrato.png',
  },
  {
    id: 'unam-murals',
    slug_es: 'unam-murales',
    slug_en: 'unam-murals',
    title_es: 'CU UNAM — Murales de Piedra',
    title_en: 'UNAM Campus — Stone Murals',
    neighborhood_es: 'Ciudad Universitaria · UNAM',
    neighborhood_en: 'University City · UNAM',
    dockLabel_es: 'UNAM',
    dockLabel_en: 'UNAM',
    duration_es: '70 min · 2.4 km · campus',
    duration_en: '70 min · 2.4 km · campus',
    summary_es:
      'Patrimonio UNESCO: la Biblioteca Central de O’Gorman (mosaicos de piedra natural) y Rectoría de Siqueiros. Arquitectura + roca volcánica.',
    summary_en:
      'UNESCO World Heritage: O’Gorman’s Central Library (natural-stone mosaics) and Siqueiros at the Rectory. Architecture + volcanic rock.',
    highlights_es: [
      'Biblioteca Central (1952) mosaico de 4,000 m²: cosmos, Códice, México moderno',
      'Murales de Siqueiros en Rectoría + Museo MUAC + Espacio Escultórico (64 prismas)',
      'Las Islas: explanada donde se cruzan estudiantes, murales y lava del Xitle',
    ],
    highlights_en: [
      'Central Library (1952) 4,000 m² mosaic: cosmos, Codex, modern Mexico',
      'Siqueiros at the Rectory + MUAC museum + Sculptural Space (64 prisms)',
      'Las Islas lawn: where students, murals and Xitle lava meet',
    ],
    accentColor: '#F2A03D',
    dockIcon: 'university',
    image: '/static/images/BestMuseums2/muacc.jpg',
  },
]
