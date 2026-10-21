// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Journey editorial "Museo Nacional de Antropología".
 *
 * ---------------------------------------------------------------------------
 * ESTADO DEL CONTENIDO
 * Este journey es, sobre todo, una BASE DE MOVIMIENTO. El guion narrativo
 * completo esta pendiente: lo que hay aqui son
 *
 *   1. la estructura de momentos acordada (orden de visita, ids, tratamiento
 *      de movimiento de cada bloque), y
 *   2. las pocas lineas de OBSERVACION FISICA que se pueden escribir sin
 *      inventar: lo que el visitante ve de frente.
 *
 * NO se escribe historia nueva. Cada bloque separa explicitamente:
 *   - lo que se observa fisicamente (observaciones de la pieza),
 *   - lo que documentan las fuentes (pendiente, con la fuente a consultar),
 *   - la interpretacion narrativa (pendiente).
 *
 * Lo que no se ha verificado se marca como `pending` y aparece en la pagina
 * como tal. No se rellena con contenido ficticio.
 * ---------------------------------------------------------------------------
 *
 * ---------------------------------------------------------------------------
 * ORDEN DE VISITA
 * El orden sigue el recorrido acordado de las salas de arqueologia de planta
 * baja. La planta alta de etnografia es una extension opcional y NO forma
 * parte de este recorrido. El orden concreto esta pendiente de verificacion
 * fisica: las salas pueden reordenarse por montaje.
 * ---------------------------------------------------------------------------
 */

const IMG = '/static/images/journeys/antropologia'

/**
 * Fotografias verificadas. Todas de Wikimedia Commons, con licencia comprobada
 * y credito en public/static/images/journeys/antropologia/CREDITS.md
 *
 * `null` en una foto significa que no hay imagen verificada de esa pieza: el
 * sistema muestra el tratamiento de reserva y la pieza queda documentada como
 * recurso pendiente.
 */
export const ANTROPOLOGIA_PHOTOS = {
  patio: {
    src: `${IMG}/patio-exterior-1974.jpg`,
    alt: 'Exterior del Museo Nacional de Antropología en la Ciudad de México, en una fotografía de 1974.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  acceso: {
    src: `${IMG}/acceso-1974.jpg`,
    alt: 'Acceso al Museo Nacional de Antropología, en una fotografía de 1974.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  auditorio: {
    src: `${IMG}/auditorio-torres-bodet.jpg`,
    alt: 'Vestíbulo del Auditorio Jaime Torres Bodet con el mural Día y la noche, de Rufino Tamayo.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  dualidadBoceto: {
    src: `${IMG}/dualidad-boceto.png`,
    alt: 'Boceto de la obra Dualidad, de Rufino Tamayo, conservado por el Museo Nacional de Antropología.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  piedraSolSala: {
    src: `${IMG}/piedra-del-sol-sala-mexica.jpg`,
    alt: 'Piedra del Sol montada en la Sala Mexica del Museo Nacional de Antropología.',
    credit: 'Wikimedia Commons, CC BY 2.0',
  },
  piedraSol: {
    src: `${IMG}/piedra-del-sol.jpg`,
    alt: 'Monolito de la Piedra del Sol, visto de frente.',
    credit: 'Wikimedia Commons, CC BY-SA 3.0',
  },
  piedraSolCentro: {
    src: `${IMG}/piedra-del-sol-centro.jpg`,
    alt: 'Detalle del centro del monolito de la Piedra del Sol.',
    credit: 'Wikimedia Commons, CC BY-SA 3.0',
  },
}

export const ANTROPOLOGIA_DISCOVERY_KINDS = {
  documentado: { label: 'Documentado', tone: 'documentado' },
  observacion: { label: 'Lo que se observa', tone: 'curiosidad' },
  pendiente: { label: 'Pendiente de documentar', tone: 'tradicion' },
}

export const ANTROPOLOGIA_DISCOVERIES = [
  {
    id: 'codice-pintado-vs-tallado',
    kind: 'documentado',
    title: 'Dos objetos con el mismo nombre',
    body: 'El Códice Boturini circuló como documento pintado: un tirillo de amate con escenas pintadas, del que hay reproductions de dominio público. Lo que aparece en las salas del museo es otra cosa: un relieve tallado. No son el mismo objeto y conviene no confundirlos al escribir sobre la pieza.',
    source: 'Wikimedia Commons (Códice Boturini, painted codex)',
  },
  {
    id: 'piedra-sol-centro',
    kind: 'observacion',
    title: 'Una pieza para mirar de cerca',
    body: 'La Piedra del Sol se montó en la Sala Mexica y puede girarse alrededor. La fotografía temprana forma parte de la visita real: conviene ver el monolito completo y despues acercarse al disco central, que es donde la pieza concentrates su detalle.',
    source: 'Museo Nacional de Antropología, México',
  },
  {
    id: 'dualidad-tamayo',
    kind: 'observacion',
    title: 'Un boceto y una obra',
    body: 'El museo conserva el boceto de Dualidad, de Rufino Tamayo, y expone en el vestíbulo del Auditorio Jaime Torres Bodet su mural Día y la noche. El dibujo previo y la obra monumental se leen juntos: uno explica el trazo, el otro lo despliega.',
    source: 'Museo Nacional de Antropología, México',
  },
  {
    id: 'orden-salas',
    kind: 'pendiente',
    title: 'El recorrido está por confirmar',
    body: 'El orden de las salas de arqueología de planta baja sigue el recorrido acordado, pero está pendiente de verificación física: los montajes pueden reordenarse. La planta alta de etnografía queda como extensión opcional.',
    source: 'Pendiente',
  },
]

export const ANTROPOLOGIA_SOURCES = [
  {
    id: 'mna',
    label: 'Museo Nacional de Antropología — sitio institucional',
    url: 'https://www.mna.inah.gob.mx/',
  },
  {
    id: 'inah',
    label: 'INAH — Museo Nacional de Antropología',
    url: 'https://www.inah.gob.mx/recintos/museo-nacional-de-antropologia',
  },
]

/**
 * Los momentos del recorrido. Cada uno declara COMO se mueve (el id se
 * resuelve en components/journeys/motionConfig.ts) y QUE se puede observar.
 */
export const ANTROPOLOGIA_MOMENTS = [
  {
    id: 'mna-patio',
    number: 1,
    title: 'El patio: antes de entrar',
    title_en: 'The courtyard: before entering',
    location: 'Acceso y patio del Museo Nacional de Antropología',
    kicker: 'Bajar el ritmo',
    duration_min: 10,
    image: 'patio',
    secondaryImage: 'acceso',
    lead: 'El museo empieza antes de su primera sala. Este primer bloque no es una pieza: es el cambio de escala. Sirve para bajar el ritmo y para mirar el edificio como un objeto antes de entrar en él.',
    steps: [
      {
        title: 'El edificio por fuera',
        body: 'La fotografía que acompaña este bloque es de 1974. No es una curiosidad de archivo: es el mismo acceso, con otro paisaje urbano alrededor, y sirve para ver qué ha cambiado y qué no.',
        observe: [
          'La proporción del volumen del museo frente a la calle',
          'Lo que la foto de 1974 no muestra y el edificio sigue teniendo',
        ],
        pending:
          'Historia de la construcción del museo y del patio: por documentar con la ficha institucional.',
      },
    ],
    next_hint: 'Entra. La arqueología de planta baja empieza aquí.',
  },
  {
    id: 'mna-dualidad',
    number: 2,
    title: 'Dualidad',
    title_en: 'Duality',
    location: 'Acceso al Auditorio Jaime Torres Bodet',
    kicker: 'El trazo y la obra',
    duration_min: 15,
    image: 'auditorio',
    secondaryImage: 'dualidadBoceto',
    lead: 'Dos obras de Rufino Tamayo se encuentran en un mismo punto de la visita: el mural que saluda al acceso del auditorio y el boceto de Dualidad que el museo conserva. Una está a escala de pared; la otra, a escala de papel.',
    steps: [
      {
        title: 'Día y la noche',
        body: 'En el vestíbulo del Auditorio Jaime Torres Bodet, el mural Día y la noche de Rufino Tamayo recibe al visitante antes de que entre a la sala. La obra y su autor están documentados; lo que sigue pendiente es su lectura.',
        observe: [
          'Como el mural ocupa la pared completa y obliga a mirar de lejos',
          'El encuentro entre la luz del vestíbulo y la superficie pintada',
        ],
        pending: 'Ficha de la obra, fecha y programa iconográfico: por documentar con el museo.',
      },
      {
        title: 'El boceto de Dualidad',
        body: 'El museo conserva el boceto de Dualidad, de Tamayo. Un dibujo previo enseña las decisiones: dónde se concentra la figura, qué se sacrifica para que algo se lea. Es el mismo gesto de los talleres de oficios, visto desde dentro.',
        observe: [
          'El trazo rápido frente al trazo acabado del mural',
          'Que el boceto ya resuelve la composición final, antes de llevarla a la pared',
        ],
        pending:
          'Relación exacta entre Dualidad y Día y la noche, y la sala donde se exhibe el boceto: por verificar.',
      },
    ],
    next_hint: 'Sigue hacia las salas de arqueología.',
  },
  {
    id: 'mna-codice',
    number: 3,
    title: 'Códice Boturini',
    title_en: 'Boturini Codex',
    location: 'Sala mexica, planta baja',
    kicker: 'Un nombre, dos objetos',
    duration_min: 15,
    image: null,
    lead: 'Aquí el riesgo no es la pieza: es el nombre. El Códice Boturini Designa al menos dos objetos distintos, y confundirlos empobrece la visita.',
    steps: [
      {
        title: 'Pintado y tallado no son lo mismo',
        body: 'El Códice Boturini se conserva como documento pintado en amate, con escenas a color, y circuló en copia durante siglos. En las salas del museo se expone además un relieve tallado. Son dos objetos con el mismo nombre, y el que se ve en pared no es el que circulaba en papel.',
        observe: [
          'El material: piedra tallada frente a superficie pintada',
          'Qué se lee como relato y qué se lee como imagen',
        ],
        pending:
          'Fotografía verificada del relieve tallado, su sala exacta y su datación: por confirmar.',
      },
    ],
    next_hint: 'Sigue por la sala.',
  },
  {
    id: 'mna-fuente',
    number: 4,
    title: 'La fuente',
    title_en: 'The fountain',
    location: 'Sala mexica, planta baja',
    kicker: 'Agua y piedra',
    duration_min: 10,
    image: null,
    lead: 'Un bloque breve sobre un objeto que se reconoce por la forma antes que por la ficha.',
    steps: [
      {
        title: 'Antes de leer la etiqueta',
        body: 'Este momento está pensado para mirar primero y leer después. La secuencia de la visita lo permite: la pieza se ve de frente al entrar en la sala.',
        observe: [
          'La forma de la pieza y su escala respecto a quien la mira',
          'Qué parte de la sala ocupa y desde dónde se ve',
        ],
        pending: 'Identificación de la fuente, su contexto y su datación: por documentar.',
      },
    ],
    next_hint: 'Continúa hacia la pieza mayor de la sala.',
  },
  {
    id: 'mna-calendario',
    number: 5,
    title: 'Calendario Azteca',
    title_en: 'Aztec Calendar',
    location: 'Sala Mexica',
    kicker: 'El centro de la pieza',
    duration_min: 20,
    image: 'piedraSolSala',
    secondaryImage: 'piedraSolCentro',
    lead: 'La Piedra del Sol está montada en la Sala Mexica y puede rodearse. Es una pieza que no se entiende de una sola vez: se ve entera, luego se vuelve al centro, y solo después se lee.',
    steps: [
      {
        title: 'Ver la pieza entera',
        body: 'El monolito está pensado para girarse alrededor. La vista frontal muestra la composición circular; los costados, el grosor. La fotografía de la sala muestra la pieza ya montada, con la escala de la sala alrededor.',
        observe: [
          'El diámetro del monolito frente a una persona',
          'Que la pieza es un volumen, no una placa',
        ],
      },
      {
        title: 'Volver al centro',
        body: 'El detalle central concentra la iconografía. Es el momento en que la fotografía de la sala y el detalle dejan de ser dos imágenes distintas y pasan a ser la misma pieza a dos distancias.',
        observe: [
          'La figura central de frente y sus atributos',
          'El trabajo del relieve en los bordes del disco',
        ],
        pending:
          'Lectura del calendario y función del monolito: por documentar con la ficha del museo.',
      },
    ],
    next_hint: 'Las salas siguientes llevan a Teotihuacan.',
  },
  {
    id: 'mna-teotihuacan',
    number: 6,
    title: 'Teotihuacan',
    title_en: 'Teotihuacan',
    location: 'Salas de arqueología, planta baja',
    kicker: 'La ciudad planificada',
    duration_min: 15,
    image: null,
    lead: 'Un bloque breve sobre la cultura que la sala introduce, y que ordena buena parte de lo que viene después.',
    steps: [
      {
        title: 'Lo que la sala pone en fila',
        body: 'El contenido de esta sala está directamente relacionado con Teotihuacan y con las piezas que el museo ha reunido de ese sitio. Lo que se puede afirmar aquí sin apartarse de la observación es cómo están montadas.',
        observe: [
          'Qué piezas están expuestas y cómo se relacionan entre sí',
          'El criterio de la montaje: tamaño, material, función',
        ],
        pending: 'Cronología y piezas concretas de la sala: por documentar.',
      },
    ],
    next_hint: 'Sigue el recorrido. El juego de pelota viene después.',
  },
  {
    id: 'mna-juego-pelota',
    number: 7,
    title: 'Juego de pelota',
    title_en: 'The ballgame',
    location: 'Salas de arqueología, planta baja',
    kicker: 'Canchas, manos y pies',
    duration_min: 15,
    image: null,
    lead: 'El juego de pelota aparece en el museo en varios registros: la cancha, el utensilio, la representación. Este bloque sigue ese juego, de lo grande a lo pequeño.',
    steps: [
      {
        title: 'De la cancha al objeto',
        body: 'La representación concreta de la que habla este momento todavía no está identificada. La secuencia del bloque —cancha, reglas, utensilio— está pensada para que se complete cuando la pieza se confirme.',
        observe: [
          'La forma de la cancha y las marcas de sus límites',
          'La escala del utensilio frente a la mano',
        ],
        pending:
          'Representación concreta que abre el bloque, su sala y su numero de inventario: por identificar.',
      },
    ],
    next_hint: 'La sala siguiente abre el bloque más difícil del recorrido.',
  },
  {
    id: 'mna-mexicas',
    number: 8,
    title: 'Mexicas y Conquista',
    title_en: 'Mexica and the Conquest',
    location: 'Salas de arqueología, planta baja',
    kicker: 'La ruptura, en su sitio',
    duration_min: 25,
    image: null,
    lead: 'Este es el bloque más delicado del recorrido, y el que menos texto admite. La tensión no viene de un efecto: viene de poner una cosa al lado de la otra y dejar que el contraste pese.',
    steps: [
      {
        title: 'Lo que se ve, primero',
        body: 'La sala expone objetos y representaciones de dos mundos que conviven. El orden de la sala pone uno junto al otro; ese orden ya es una propuesta editorial que conviene observar antes de leer nada.',
        observe: [
          'Qué objetos de un lado y del otro, y a qué distancia',
          'Qué cambia de material, de técnica y de escala entre ambos bloques',
        ],
        pending:
          'Testimonios, fuentes y lectura del periodo: por documentar con el museo. Es el bloque donde el relato debe apoyarse en fuentes y no en el tono.',
      },
    ],
    next_hint: 'Un ultimo bloque, el más silencioso.',
  },
  {
    id: 'mna-tzompantli',
    number: 9,
    title: 'Tzompantli',
    title_en: 'Tzompantli',
    location: 'Salas de arqueología, planta baja',
    kicker: 'Pausa',
    duration_min: 15,
    image: null,
    lead: 'Este bloque baja el ritmo a propósito. La pieza pide quietud, y el texto tiene que estar a la altura de ese silencio.',
    steps: [
      {
        title: 'Mirar antes de leer',
        body: 'La representación de un tzompantli —la fila de cabezas de guerrero águila- es una de las piezas más difíciles de exponer y de escribir. El bloque está construido para que se le pueda dedicar tiempo sin encima.',
        observe: [
          'La altura de la pieza y la escala de quien la mira',
          'La repetición del motivo y lo que la repetición hace con la mirada',
        ],
        pending:
          'Pieza concreta, su estado de conservación y la historia de su excavación: por documentar. Ninguna afirmacion sobre este bloque debe publicarse sin fuente.',
      },
    ],
    next_hint: 'El cierre.',
  },
  {
    id: 'mna-xolo',
    number: 10,
    title: 'Xoloitzcuintle',
    title_en: 'Xoloitzcuintle',
    location: 'Cierre del recorrido',
    kicker: 'El companero',
    duration_min: 10,
    image: null,
    lead: 'El último bloque es el más pequeño y el más quieto. Un perro de piedra que miraba a su dueño: la escala del gesto compensa la escala del objeto.',
    steps: [
      {
        title: 'Una figura pequeña, un gesto enorme',
        body: 'La pieza que cierra el recorrido es una figura de xoloitzcuintle. La fuerza y la precisión del gesto están en la postura, no en el tamaño. El bloque está pensado para detenerse.',
        observe: [
          'La postura y la línea del lomo',
          'Qué hace la escala de la pieza con la distancia a la que se mira',
        ],
        pending:
          'Pieza concreta, ubicacion y datacion: por verificar antes de cerrar el contenido.',
      },
    ],
    closing:
      'Salir del museo es volver a la calle con una palabra de mas. Eso es todo lo que hace un buen cierre.',
  },
]

/** Notas operativas. */
export const ANTROPOLOGIA_NOTES = [
  'El orden de las salas de arqueología de planta baja está pendiente de verificación física: los montajes pueden reordenarse. La planta alta de etnografía es una extensión opcional.',
  'Las piezas de Dualidad, el Códice Boturini tallado, la fuente, la representación del juego de pelota, el tzompantli y el xoloitzcuintle están señaladas como recurso pendiente: no se publica nada sobre ellas sin fuente.',
  'El Museo Nacional de Antropología cierra los lunes. Confirma el horario y el acceso el día de la visita.',
]

/** Fecha de verificacion de los datos operativos. */
export const ANTROPOLOGIA_VERIFIED_ON = '2026-10-21'

export const ANTROPOLOGIA_JOURNEY = {
  id: 'antropologia',
  slug: 'antropologia',
  experience: 'antropologia',
  title_es:
    'Museo Nacional de Antropología — Un viaje por el tiempo y las costumbres mexicanas en la actualidad',
  title_en: 'National Museum of Anthropology — A journey through time and Mexican customs today',
  subtitle_es:
    'Diez salas, una capa cada vez: lo que se ve de frente, lo que las fuentes cuentan y lo que todavía no está verificado.',
  subtitle_en:
    'Ten rooms, one layer at a time: what is seen in the flesh, what the sources tell, and what is still unverified.',
  intro_es:
    'El Museo Nacional de Antropología se recorre como se lee una publicación: por capas. Cada bloque separa lo que el visitante tiene delante, lo que la institución documenta y lo que todavía no se ha verificado. Este recorrido está en construcción: la estructura, el orden y el movimiento ya están; el relato, no.',
  intro_en:
    'The National Museum of Anthropology is walked like a publication is read: in layers. Each block separates what the visitor has in front of them, what the institution documents, and what is still unverified. This route is under construction: the structure, the order and the movement are done; the story is not.',
  eyebrow_es: 'Museo Nacional de Antropología · Chapultepec, Ciudad de México',
  eyebrow_en: 'National Museum of Anthropology · Chapultepec, Mexico City',
  heroTitleLines: [
    'Museo Nacional de Antropología',
    'Un viaje por el tiempo y las costumbres mexicanas en la actualidad',
  ],
  duration_note_es:
    'Diez momentos. El recorrido de arqueología de planta baja es el base; la planta alta de etnografía queda como extensión opcional.',
  duration_note_en:
    'Ten moments. The ground-floor archaeology route is the base; the upper-floor ethnography wing is an optional extension.',
  meta: ['Planta baja · arqueología', 'Diez momentos', 'Contenido editorial en construcción'],
  accents: ['talavera', 'cempasuchil'],
  heroImage: `${IMG}/patio-exterior-1974.jpg`,
  // Calificacion: null mientras el journey no tenga reseñas.
  rating: null,
  reviewCount: 0,
  photos: ANTROPOLOGIA_PHOTOS,
  moments: ANTROPOLOGIA_MOMENTS,
  discoveries: ANTROPOLOGIA_DISCOVERIES,
  notes: ANTROPOLOGIA_NOTES,
  sources: ANTROPOLOGIA_SOURCES,
  verified_on: ANTROPOLOGIA_VERIFIED_ON,
}
