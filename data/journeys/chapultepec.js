// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Journey editorial "Chapultepec — De los Dioses a Emperadores".
 *
 * ---------------------------------------------------------------------------
 * SEPARACIÓN DE CONTENIDO
 * Este archivo contiene SOLO el contenido editorial. La presentación vive en
 * components/journeys/ChapultepecJourney.tsx y en los componentes de apoyo.
 * ---------------------------------------------------------------------------
 *
 * ---------------------------------------------------------------------------
 * RIGOR HISTÓRICO
 * El guion distingue tres estados de un enunciado, y cada bloque lo declara:
 *
 *   'documentado' -> contrastado en las fuentes listadas en `SOURCES`.
 *   'tradicion'   -> relato o belief asociado al lugar. Se presenta como tal.
 *   'curiosidad'  -> dato o versión popular, señalada como tal.
 *
 * Reglas que se respetan aquí:
 *  - La cueva de Cincalco se presenta como lugar ASOCIADO al Mictlán, nunca
 *    como hallazgo arqueológico demostrado, y el acceso aparece como restringido.
 *  - No se afirma que Moctezuma se bañaba ahí. Se cuenta el nombre popular y
 *    se separa del depósito de agua prehispánico documentado.
 *  - No se dan horarios garantizados: el Audiorama y el Castillo se citan con
 *    el horario publicado por su operador, con la advertencia de verificar.
 *  - No se afirma una duración garantizada del recorrido.
 * ---------------------------------------------------------------------------
 */

const IMG = '/static/images/journeys/chapultepec'

/**
 * Fotografías verificadas. Todas provienen de Wikimedia Commons, con licencia
 * comprobada y crédito en public/static/images/journeys/chapultepec/CREDITS.md
 */
export const CHAPULTEPEC_PHOTOS = {
  metro: {
    src: `${IMG}/metro-chapultepec.jpg`,
    alt: 'Estación Chapultepec del Metro de la Ciudad de México, línea 1, tras la renovación 2022-2025.',
    credit: 'Gobierno de la Ciudad de México / Wikimedia Commons, CC BY-SA 4.0',
  },
  puerta: {
    src: `${IMG}/puerta-de-los-leones.jpg`,
    alt: 'Puerta de los Leones, entrada principal al Bosque de Chapultepec.',
    credit: 'Lasibris / Wikimedia Commons, CC BY-SA 4.0',
  },
  galeria: {
    src: `${IMG}/calzada-juventud-heroica.jpg`,
    alt: 'Interior del Bosque de Chapultepec con arbolado y áreas de descanso en la Primera Sección.',
    credit: 'Gobierno de la Ciudad de México / Wikimedia Commons, CC0',
  },
  altar: {
    src: `${IMG}/altar-a-la-patria.jpg`,
    alt: 'Altar a la Patria, monumento a los Niños Héroes, en la Primera Sección del Bosque de Chapultepec.',
    credit: 'José Luiz / Wikimedia Commons, CC BY-SA 4.0',
  },
  altarEscultura: {
    src: `${IMG}/altar-escultura-central.jpg`,
    alt: 'Escultura central del Altar a la Patria, con la figura de la Patria sosteniendo a un cadete caído.',
    credit: 'Wikimedia Commons, CC BY 4.0',
  },
  audiorama: {
    src: `${IMG}/audiorama.jpg`,
    alt: 'Audiorama del Bosque de Chapultepec, recinto construido en 1972 para escuchar música entre árboles.',
    credit: 'Gobierno de la Ciudad de México / Wikimedia Commons, CC0',
  },
  cincalco: {
    src: `${IMG}/cincalco-acceso.jpg`,
    alt: 'Entrada de la cueva conocida como Cincalco, con barrera que restringe el paso al público.',
    credit: 'Gobierno de la Ciudad de México / Wikimedia Commons, CC0',
  },
  banos: {
    src: `${IMG}/banos-de-moctezuma.jpg`,
    alt: 'Baños de Moctezuma en la Primera Sección del Bosque de Chapultepec.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  banosEscalinatas: {
    src: `${IMG}/banos-de-moctezuma-escalinatas.jpg`,
    alt: 'Escalinatas históricas de los Baños de Moctezuma en el Bosque de Chapultepec.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  castillo1880: {
    src: `${IMG}/castillo-1880.jpg`,
    alt: 'El Castillo de Chapultepec visto desde el poniente, hacia 1880-1900, con los agaves en primer plano.',
    credit: 'Wikimedia Commons, dominio público',
  },
  castilloBriquet: {
    src: `${IMG}/castillo-briquet.jpg`,
    alt: 'El Castillo de Chapultepec desde el poniente, impresion de albumina de Abel Briquet.',
    credit: 'Abel Briquet / Library of Congress, dominio público',
  },
  castillo: {
    src: `${IMG}/castillo-exterior.jpg`,
    alt: 'Fachada exterior del Castillo de Chapultepec.',
    credit: 'Wikimedia Commons, CC BY 4.0',
  },
  castilloAereo: {
    src: `${IMG}/castillo-aereo.jpg`,
    alt: 'Vista aérea del Castillo de Chapultepec y el cerco de árboles del bosque.',
    credit: 'ProtoplasmaKid / Wikimedia Commons, CC BY 4.0',
  },
  castilloDia: {
    src: `${IMG}/castillo-de-dia.jpg`,
    alt: 'Castillo de Chapultepec visto desde abajo en un día claro.',
    credit: 'Lasibris / Wikimedia Commons, CC BY 4.0',
  },
  lago: {
    src: `${IMG}/lago-chapultepec.jpg`,
    alt: 'Lago Mayor del Bosque de Chapultepec.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
  bosque: {
    src: `${IMG}/bosque-arboles.jpg`,
    alt: 'Arbolado del Bosque de Chapultepec.',
    credit: 'Wikimedia Commons, CC BY-SA 4.0',
  },
}

/**
 * Bloques de descubrimiento: separan el hecho documentado de la tradición.
 * `kind` decide el tratamiento visual y el encabezado.
 */
export const DISCOVERY_KINDS = {
  documentado: { label: 'Historia documentada', tone: 'documentado' },
  curiosidad: { label: 'Dato curioso', tone: 'curiosidad' },
  tradicion: { label: 'Tradición o leyenda', tone: 'tradicion' },
}

export const CHAPULTEPEC_DISCOVERIES = [
  {
    id: 'cincalco-mictlan',
    kind: 'tradicion',
    title: 'Cincalco y el inframundo',
    body: 'El sitio oficial del Bosque llama a esta cueva "lugar de la casa del maíz" y la asocia al Mictlán, el inframundo nahua. Es una relación de tradición: el sitio no la presenta como un hallazgo arqueológico demostrado, y el acceso al interior está restringido.',
    source: 'Pro Bosque de Chapultepec',
  },
  {
    id: 'moctezuma-debate',
    kind: 'curiosidad',
    title: 'El nombre popular y la evidencia',
    body: 'Los Baños de Moctezuma deben su nombre a un relato popular. En el lugar se documenta la existencia de un depósito de agua de origen prehispánico, con transformaciones posteriores. Que se asocie a un baño personal del soberano no está demostrado por una fuente sólida.',
    source: 'Baños de Moctezuma, Primera Sección',
  },
  {
    id: 'altar-1947',
    kind: 'documentado',
    title: 'Seis cadetes, seis columnas',
    body: 'El Altar a la Patria se levantó entre 1947 y 1952 con seis columnas de mármol. Conserva los restos del general Felipe Santiago Xicoténcatl y los de seis personas que en 1947 fueron identificadas como los Niños Héroes.',
    source: 'Altar a la Patria, Primera Sección',
  },
  {
    id: 'changuito-mion',
    kind: 'curiosidad',
    title: 'Los pequeños habitantes',
    body: 'En las copas de los árboles de la Primera Sección se puede observar al changuito mión, un primate pequeño de cola larga propio de la región. Conviene mirarlo con calma y a distancia: observar no es tocar.',
    source: 'Observación de campo',
  },
]

/**
 * Línea de tiempo del Castillo. Cada hito lleva la época y el hecho
 * contrastado. Es un recurso explorable, no un paso obligatorio.
 */
export const CASTILLO_TIMELINE = [
  {
    id: 'virreinato',
    period: '1785',
    title: 'Casa de descanso virreinal',
    body: 'Bernardo de Gálvez ordena la construcción de una casa de descanso en Chapultepec el 16 de agosto de 1785, sobre una antigua ermita dedicada al Arcángel Miguel. Participan los ingenieros Francisco Bambitelli y Manuel Agustín Mascaró. La obra queda inconclusa ese mismo año.',
    state: 'documentado',
  },
  {
    id: 'colegio-militar',
    period: '1833',
    title: 'Sede del Heroico Colegio Militar',
    body: 'El inmueble, deteriorado durante años, se convierte en sede del Heroico Colegio Militar en 1833, con inauguración en 1843. Se levanta el torreón "Caballero Alto", que dará al conjunto el aire de fortaleza y el nombre de castillo.',
    state: 'documentado',
  },
  {
    id: 'ano-1847',
    period: '1847',
    title: 'La batalla de Chapultepec',
    body: 'Durante la intervención estadounidense, el castillo resiste catorce horas de asedio al mando del general Nicolás Bravo y es considerado el último bastión de la defensa nacional. El edificio sufre daños considerables. La historia del lugar no se reduce a este episodio, pero forma parte de él.',
    state: 'documentado',
  },
  {
    id: 'imperio',
    period: '1864-1867',
    title: 'Maximiliano y Carlota',
    body: 'Durante el Segundo Imperio Mexicano, Maximiliano de Habsburgo y la emperatriz Carlota eligen el castillo como residencia, atraídos por la vista al valle de México. Se añaden arcadas neoclásicas, balcones en la fachada sur, un pórtico central y jardines, y el recinto pasa a ser conocido como "Palacio Imperial de Chapultepec" o "Miravalle".',
    state: 'documentado',
  },
  {
    id: 'porfiriato',
    period: '1872-1910',
    title: 'Porfiriato y residencia presidencial',
    body: 'Desde 1872 el castillo vuelve a ser residencia presidencial. En 1878 se inaugura el Observatorio Astronómico Nacional en el Caballero Alto y se construye la escalera de los leones. Porfirio Díaz lo usa primero como casa de veraneo y desde 1896 como residencia principal; se instalan ascensores, la Galería de Emplomados con vitrales procedentes de París y un boudoir en el antiguo salón de té de Carlota.',
    state: 'documentado',
  },
  {
    id: 'revolucion',
    period: '1911-1913',
    title: 'La Marcha de la Lealtad',
    body: 'Francisco I. Madero habita el castillo entre 1911 y 1913. En febrero de 1912, durante la Decena Trágica, marcha desde aquí hasta el Palacio Nacional. En 1916 Venustiano Carranza ordena demoler parte del edificio del Colegio Militar para ampliar las habitaciones residenciales de los presidentes.',
    state: 'documentado',
  },
  {
    id: 'museo',
    period: '1944',
    title: 'Museo Nacional de Historia',
    body: 'El 27 de septiembre de 1944, por decreto de Lázaro Cárdenas, el castillo se convierte en sede del Museo Nacional de Historia, que abre sus puertas al público ese mismo día. En 1934, Cárdenas ya había preferido Los Pinos como residencia presidencial. Hoy administra el recinto el INAH.',
    state: 'documentado',
  },
]

/**
 * Fuentes consultadas. Se conservan en el código para que cualquier corrección
 * futura tenga un punto de partida y no una suposición.
 */
export const SOURCES = [
  {
    id: 'inah-castillo',
    label: 'INAH — Museo Nacional de Historia, Castillo de Chapultepec',
    url: 'https://www.mnh.inah.gob.mx/',
  },
  {
    id: 'pro-bosque-audiorama',
    label: 'Pro Bosque de Chapultepec — Audiorama y cueva de Cincalco',
    url: 'http://bosquedechapultepec.mx:9000/bosquedechapultepec/espacios/audiorama-chapultepec/',
  },
  {
    id: 'pro-bosque-galeria',
    label: 'Pro Bosque de Chapultepec — Galería Abierta Juventud Heroica',
    url: 'http://bosquedechapultepec.mx:9000/bosquedechapultepec/espacios/calzada-juventud-heroica/',
  },
  {
    id: 'cdmx-turismo',
    label: 'Turismo Ciudad de México — Altar a la Patria',
    url: 'https://www.mexicocity.cdmx.gob.mx/venues/ninos-heroes-monument/',
  },
  {
    id: 'wiki-castillo',
    label: 'Wikipedia — Castillo de Chapultepec (con referencias al INAH)',
    url: 'https://es.wikipedia.org/wiki/Castillo_de_Chapultepec',
  },
]

/**
 * Los seis momentos del recorrido. El orden es el aprobado y no se altera:
 * Metro → Puerta de los Leones → Puente → Altar a la Patria → Audiorama y
 * Cincalco → Baños de Moctezuma → Castillo → lago → Metro.
 *
 * No se agregan Calzada Flotante, zoológico, Segunda Sección, Papalote,
 * Aztlán ni Casa del Lago.
 */
export const CHAPULTEPEC_MOMENTS = [
  {
    id: 'umbral',
    duration_min: 15,
    number: 1,
    title: 'El umbral de las épocas',
    location: 'Metro Chapultepec → Puerta de los Leones',
    kicker: 'Del ruido urbano al bosque',
    next_hint: 'Sigue al Puente del Tiempo, al otro lado de la avenida.',
    image: 'metro',
    secondaryImage: 'puerta',
    lead: 'Hay lugares que no pertenecen a una sola época. Chapultepec ha sido territorio sagrado, espacio de descanso, escenario de batallas y refugio de una ciudad que nunca deja de transformarse. Hoy vamos a recorrer algunas de las huellas que dejaron quienes pasaron por aquí.',
    steps: [
      {
        title: 'La puerta del bosque',
        body: 'Antes de entrar, detente en los leones. La Puerta de los Leones es la entrada principal al Bosque de Chapultepec y el paso desde el ruido de la avenida hacia el arbolado. Los leones y sus pedestales son el umbral: un lugar que anuncia que del otro lado cambia la escala.',
        observe: [
          'El gesto de los leones: la mirada y la postura anticipan el camino',
          'La escala del pedestal frente a la persona que lo cruza',
          'El contraste entre el tráfico de la avenida y el silencio del bosque',
        ],
      },
      {
        title: 'Una pregunta para comenzar',
        body: 'No hace falta responderla en voz alta ni seguir adelante de inmediato. Solo considera: ¿qué historias crees que podría guardar un mismo lugar durante siglos? El resto del recorrido es una forma de buscar respuesta.',
        observe: [],
      },
    ],
  },
  {
    id: 'puente',
    duration_min: 15,
    number: 2,
    title: 'El Puente del Tiempo',
    location: 'Acceso peatonal y galería fotográfica, rumbo al Altar a la Patria',
    kicker: 'Cruzar y comparar',
    next_hint: 'Continua al Altar a la Patria, en la entrada de la calzada.',
    image: 'galeria',
    lead: 'Cruzar este puente es más que cambiar de lado de la avenida. También es una oportunidad para mirar cómo se transforma el paisaje. Las fotografías nos permiten comparar distintas épocas y reconocer qué permanece, qué desaparece y qué cambia de significado.',
    steps: [
      {
        title: 'Mira el bosque con otros ojos',
        body: 'La Calzada Juventud Heroica cuenta con una galería fotográfica al aire libre, la Galería Abierta Juventud Heroica, donde se exhiben muestras temporales. El catálogo cambia, así que lo que puedes comparar hoy no será necesariamente lo que había hace un año. El acceso principal a esta calzada se hace por la Puerta de los Leones y por el Puente Metro.',
        observe: [
          'Qué época aparece en las imágenes y cuál no',
          'Qué edificios, árboles o terraceros ya no están',
          'Qué objeto se repite en varias de las fotografías',
        ],
      },
      {
        title: 'Antes y ahora',
        body: 'Comparar dos fotografías del mismo punto es un ejercicio de lenguaje visual: obliga a elegir qué se mira. En este journey todavía no hay un par histórico verificado del mismo punto, así que no te proponemos un comparador. En cuanto exista con procedencia comprobada, aparecerá aquí.',
        observe: [],
        pending:
          'Falta un par de fotografías históricas y actuales verificadas del mismo punto, con procedencia y crédito documentados.',
      },
    ],
  },
  {
    id: 'memoria',
    duration_min: 20,
    number: 3,
    title: 'La memoria de una nación',
    location: 'Altar a la Patria, monumento a los Niños Héroes',
    kicker: 'El bosque cambia de tono',
    next_hint: 'Baja hacia la zona del Audiorama, entre la arboleda.',
    image: 'altar',
    secondaryImage: 'altarEscultura',
    lead: 'En este punto, el bosque cambia de tono. El monumento recuerda a los cadetes vinculados con la defensa del Castillo durante la intervención estadounidense de 1847. Más allá de su presencia monumental, también invita a pensar cómo una sociedad conserva la memoria de sus acontecimientos.',
    steps: [
      {
        title: 'Seis columnas, una memoria',
        body: 'El Altar a la Patria se levantó entre 1947 y 1952. Obra del arquitecto Enrique Aragón Echegaray y del escultor Ernesto Tamariz, se compone de seis columnas de mármol en disposición semicircular, coronadas por águilas y antorchas de bronce. En el centro, la figura de la Patria sostiene a un cadete caído y una rama de olivo; junto a ella, un hombre en pie porta la bandera de la Primera República Federal. En la base se lee: "A los defensores de la Patria 1846-1847".',
        observe: [
          'Las seis columnas y la disposición semicircular',
          'Los remates de águila y antorcha de bronce',
          'La inscripción en la base del conjunto',
        ],
      },
      {
        title: 'La historia y su símbolo',
        body: 'El monumento guarda los restos del general Felipe Santiago Xicoténcatl y los de seis personas que en 1947 fueron identificadas como los Niños Héroes. Conviene separar los hechos: el episodio militar de 1847 está documentado, igual que la construcción del monumento. La categoría de "Niños Héroes", con su propia iconografía, se fue construyendo después, en la memoria conmemorativa del siglo XX. El monumento es documento de ambas cosas a la vez.',
        observe: [],
      },
    ],
    question: '¿Qué hace que un acontecimiento se convierta en símbolo para todo un país?',
  },
  {
    id: 'dioses',
    duration_min: 30,
    number: 4,
    title: 'El Chapultepec de los Dioses',
    location: 'Audiorama, cueva de Cincalco, Baños de Moctezuma',
    kicker: 'Paisaje, agua y memoria',
    next_hint: 'Empieza la subida al Castillo.',
    image: 'audiorama',
    secondaryImage: 'cincalco',
    lead: 'Antes de ser escenario de emperadores y presidentes, Chapultepec estuvo ligado a historias sagradas, al agua y a las tradiciones de los pueblos que habitaron el valle. Aquí conviene mirar con atención: algunas historias pertenecen a la documentación histórica; otras sobreviven como leyendas que han dado significado al paisaje.',
    steps: [
      {
        title: 'Audiorama: una pausa dentro del bosque',
        body: 'Inaugurado en 1972, el Audiorama es un recinto pensado para escuchar música rodeado de árboles, con un género distinto cada día de la semana y una pequeña colección de libros en préstamo. El sitio oficial publica un horario de martes a domingo, de 09:00 a 16:00, con entrada libre. Confírmalo el día de la visita: los horarios de los recintos con acceso controlado cambian.',
        observe: [
          'El cambio de música según el día: el lugar suena distinto cada vez',
          'La selección de libros disponible para consultar',
          'El contraste entre el sonido del recinto y el de la calle',
        ],
      },
      {
        title: 'Cincalco y el Mictlán',
        body: 'En el Audiorama se encuentra la cueva conocida como Cincalco, "lugar de la casa del maíz". El sitio oficial del Bosque la asocia al Mictlán, el inframundo nahua, y el cronista Salvador Novo la bautizó con el nombre náhuatl "In xochitl, In cuicatl", "en la flor, el canto". Hay que decirlo con precisión: es una relación de tradición y relato, no un hecho arqueológico demostrado. El acceso al interior de la cueva está restringido hoy por seguridad, y así debe narrarse: se observa desde el exterior.',
        observe: [
          'La barrera que delimita el acceso al interior de la cueva',
          'La relación de la cubierta con el bosque que la rodea',
          'La diferencia entre el nombre náhuatl y el nombre que se le da hoy',
        ],
      },
      {
        title: 'Baños de Moctezuma: historia y mito',
        body: 'Un nombre puede conservar una leyenda durante siglos. Pero ¿qué nos dicen las evidencias sobre el lugar? En los Baños de Moctezuma se documenta la existencia de un depósito de agua de origen prehispánico, con transformaciones posteriores a lo largo del tiempo. Lo que no está demostrado por una fuente sólida es que el soberano se bañara personalmente ahí: esa versión pertenece al relato popular, no a la evidencia.',
        observe: [
          'Las escalinatas y el trabajo de cantería que rodea el depósito',
          'Las transformaciones posteriores visibles en el conjunto',
          'La diferencia entre el nombre del lugar y lo que la evidencia permite afirmar',
        ],
      },
      {
        title: 'Los pequeños habitantes del bosque',
        body: 'En las copas de los árboles de la Primera Sección se puede observar al changuito mión, un primate pequeño de cola larga propio de la región. Es una curiosidad menor del bosque, no una atracción: lo interesante es notar que un bosque urbano sostiene fauna propia. Míralo con calma y a distancia.',
        observe: [],
      },
    ],
    operational_note:
      'El Audiorama publica un horario de martes a domingo, de 9:00 a 16:00, con entrada libre. El acceso al interior de la cueva de Cincalco esta restringido: se visita desde el exterior. Confirma el dia de la visita.',
  },
  {
    id: 'castillo',
    duration_min: 60,
    number: 5,
    title: 'De virreyes a emperadores',
    location: 'Subida y visita al Castillo de Chapultepec',
    kicker: 'El capítulo mayor',
    next_hint: 'Baja hacia el lago para el ultimo tramo.',
    hero: true,
    image: 'castillo',
    secondaryImage: 'castilloAereo',
    lead: 'Desde aquí, la historia cambia de escala. El cerro que guardó relatos antiguos también se convirtió en un espacio de descanso, formación militar, residencia imperial y escenario de transformaciones políticas. El Castillo no pertenece a una sola historia: reúne varias, superpuestas en sus muros, sus salas y sus vistas.',
    steps: [
      {
        title: 'El ascenso',
        body: 'La subida al cerro funciona como transición narrativa. La vegetación se espesa, la pendiente marca el cambio de nivel y las vistas empiezan a abrirse. Ese cambio de perspectiva es parte del relato: el Castillo no se entiende de golpe.',
        observe: [
          'Cómo se va abriendo el panorama a medida que se sube',
          'El tipo de vegetación que se va dejando atrás',
          'El punto en que el bosque se vuelve discernible desde arriba',
        ],
      },
      {
        title: 'De casa de descanso a Castillo',
        body: 'El origen es virreinal. El 16 de agosto de 1785, Bernardo de Gálvez ordena la construcción de una casa de descanso en Chapultepec, sobre una antigua ermita dedicada al Arcángel Miguel, con participación de los ingenieros Francisco Bambitelli y Manuel Agustín Mascaró. La obra queda inconclusa ese mismo año y se ordena su subasta. En 1806 la adquiere el Ayuntamiento de México.',
        observe: [],
      },
      {
        title: 'Colegio Militar y batalla',
        body: 'El inmueble, deteriorado durante años, se convierte en sede del Heroico Colegio Militar en 1833. Se construye el torreón "Caballero Alto", que le da el nombre de castillo. En 1847, durante la intervención estadounidense, resiste catorce horas de asedio al mando del general Nicolás Bravo, con 832 soldados y cadetes. Es parte fundamental de su historia, pero no la resume: el edificio acumuló otras funciones antes y después.',
        observe: [],
      },
      {
        title: 'Maximiliano y Carlota',
        body: 'Entre 1864 y 1867, durante el Segundo Imperio Mexicano, Maximiliano de Habsburgo y la emperatriz Carlota eligen el castillo como residencia, cautivados por la vista al valle de México. Se añaden arcadas neoclásicas inspiradas en París, balcones en la fachada sur, un pórtico central, un torreón para comunicar plantas, galerías con columnas de hierro, los murales Las Bacantes de Santiago Rebull, salas de billar y de carruajes, y la rampa de acceso que comunicaría con el Paseo de la Emperatriz. El recinto fue conocido como Palacio Imperial de Chapultepec, o "Miravalle".',
        observe: [],
      },
      {
        title: 'El Porfiriato',
        body: 'Desde 1872 el castillo vuelve a ser residencia presidencial. En 1878 se inaugura el Observatorio Astronómico Nacional en el Caballero Alto y se construye la escalera de los leones; ese mismo año se realizó desde la oficina telegráfica del torreón la primera transmisión telefónica experimental en México. Porfirio Díaz lo usa primero como casa de veraneo y desde el 14 de abril de 1896 como residencia principal. Instala ascensores, un pararrayos, la Galería de Emplomados con vitrales procedentes de París y un boudoir privado en el antiguo salón de té de Carlota.',
        observe: [],
      },
      {
        title: 'El Castillo como museo',
        body: 'En 1934, Lázaro Cárdenas elige Los Pinos como residencia presidencial porque el castillo le parecía "muy ostentoso" para un país en reconstrucción. El 27 de septiembre de 1944, por decreto suyo, el castillo se convierte en sede del Museo Nacional de Historia y abre sus puertas al público. Hoy administra el recinto el INAH, con salas que recrean desde el periodo virreinal hasta la Revolución mexicana, y más de cien mil piezas en su acervo.',
        observe: [],
      },
      {
        title: 'Mirar la ciudad desde arriba',
        body: 'No todo tiene que convertirse en una ficha histórica. El Castillo está a 2,325 metros sobre el nivel del mar y su terraza forma parte de la historia del lugar. Detente ahí un momento: la vista explica por qué los virreyes eligieron este punto, y por qué después todo el mundo quiso poner una casa, un gobierno o un museo encima de él.',
        observe: [
          'La extensión del bosque que se ve desde la terraza',
          'El paisaje de la ciudad que aparece al otro lado de la copa de los árboles',
          'El cambio de escala entre el bosque y los edificios',
        ],
      },
    ],
    timeline: CASTILLO_TIMELINE,
    operational_note:
      'El Castillo alberga el Museo Nacional de Historia. El acceso interior y los horarios de las salas dependen de la agenda del museo y de los montajes: confirma el dia de la visita. Las tres horas de referencia NO incluyen una visita completa al museo: el bloque de 60 minutos es para el edificio, sus murales y las vistas.',
    comparison: {
      before: {
        src: CHAPULTEPEC_PHOTOS.castillo1880.src,
        alt: CHAPULTEPEC_PHOTOS.castillo1880.alt,
        label: '1880-1900',
        credit: CHAPULTEPEC_PHOTOS.castillo1880.credit,
      },
      after: {
        src: CHAPULTEPEC_PHOTOS.castilloAereo.src,
        alt: CHAPULTEPEC_PHOTOS.castilloAereo.alt,
        label: 'Hoy',
        credit: CHAPULTEPEC_PHOTOS.castilloAereo.credit,
      },
      note: 'Mismo edificio, distinta epoca y distinto punto de vista.',
    },
  },
  {
    id: 'regreso',
    duration_min: 20,
    number: 6,
    title: 'Volver al presente',
    location: 'Descenso del Castillo → lago → Metro Chapultepec',
    kicker: 'El bosque sigue',
    next_hint: 'Termina de vuelta en el Metro Chapultepec.',
    image: 'lago',
    secondaryImage: 'bosque',
    lead: 'Después de recorrer dioses, batallas y emperadores, el bosque vuelve a su ritmo cotidiano. El agua, los árboles y las personas que lo visitan forman parte de una historia que sigue escribiéndose.',
    steps: [
      {
        title: 'El descenso',
        body: 'El cambio de perspectiva hace el trabajo de transición: al bajar, el Castillo se aleja y el bosque recupera su forma de bosque. Es un momento para volver a mirar lo que ya habías visto al subir, que ahora parece distinto.',
        observe: [],
      },
      {
        title: 'El lago',
        body: 'El Lago Mayor es la pausa del final del recorrido. Detente a observar el movimiento del agua, las embarcaciones y la vida cotidiana. Las lanchitas son una actividad opcional y no forman parte de un tiempo garantizado: no asumas disponibilidad sin verificarla el día de la visita.',
        observe: [
          'El movimiento del agua en la orilla',
          'La diferencia entre el ruido del bosque y el del lago',
          'Las actividades de la gente alrededor',
        ],
      },
      {
        title: 'Regresar al Metro',
        body: 'El recorrido cierra donde abrió, en la estación de Chapultepec. Volver por el mismo camino es parte de la lectura del lugar: ahora reconoces cosas que no existían para ti en la primera pasada.',
        observe: [],
      },
    ],
    closing:
      'Los imperios cambian. Las ciudades se transforman. Chapultepec sigue guardando las huellas de quienes pasaron por él.',
  },
]

/**
 * La ruta, por tramos. `walk` son minutos a pie estimados entre zonas; no son
 * una distancia verificada sobre el sitio y no se presentan como exactos.
 */
export const CHAPULTEPEC_ROUTE = [
  { zone: 'Metro Chapultepec', walk: 0, note: 'Punto de partida y de regreso.' },
  {
    zone: 'Puerta de los Leones',
    walk: 2,
    note: 'La entrada al bosque, al otro lado de la avenida.',
  },
  { zone: 'Puente del Tiempo', walk: 5, note: 'El puente peatonal y la galeria fotografica.' },
  { zone: 'Altar a la Patria', walk: 3, note: 'El monumento, en la entrada de la calzada.' },
  { zone: 'Audiorama y Cincalco', walk: 8, note: 'Baja por la arboleda, entre el bosque alto.' },
  { zone: 'Baños de Moctezuma', walk: 4, note: 'Junto al Audiorama, sobre el camino de subida.' },
  { zone: 'Castillo de Chapultepec', walk: 9, note: 'La subida al cerro. Es el tramo exigente.' },
  { zone: 'Lago', walk: 5, note: 'El descenso hacia el agua.' },
  { zone: 'Metro Chapultepec', walk: 10, note: 'Regreso por la calzada y la avenida.' },
]

/**
 * Escenarios de duracion. Son estimaciones: el recorrido no tiene una duracion
 * garantizada y las tres horas de referencia no incluyen una visita completa
 * al interior del Castillo.
 */
export const CHAPULTEPEC_DURATIONS = {
  minimo: '3 h 10 min',
  realista: '3 h 45 min',
  relajado: '4 h 20 min',
}

/** Advertencias de verificación que se muestran al visitante. */
export const CHAPULTEPEC_NOTES = [
  'El recorrido no tiene una duración garantizada. Calcula un margen amplio y confirma horarios de acceso el día de la visita.',
  'El acceso al interior de la cueva de Cincalco está restringido. Se visita desde el exterior.',
  'La lanchita del lago es una actividad opcional, no incluida en el recorrido.',
]

export const CHAPULTEPEC_JOURNEY = {
  id: 'chapultepec',
  slug: 'chapultepec',
  experience: 'chapultepec',
  title_es: 'Chapultepec — De los Dioses a Emperadores',
  title_en: 'Chapultepec — From Gods to Emperors',
  subtitle_es:
    'Un recorrido por las capas del bosque que fue territorio sagrado, campo de batalla y palacio.',
  subtitle_en:
    'A walk through the layers of a forest that was sacred ground, battlefield and palace.',
  intro_es:
    'Chapultepec no es un solo lugar. Es un acumulador de épocas que se leen en el mismo cerro. Este recorrido sigue seis momentos: del Metro al león de la entrada, del altar a la patria a la cueva, del bosque de los dioses al castillo de los emperadores, y de vuelta al agua.',
  intro_en:
    'Chapultepec is not a single place. It is an accumulation of eras readable on the same hill. This route follows six moments: from the Metro to the lion at the gate, from the national altar to the cave, from the forest of the gods to the castle of the emperors, and back to the water.',
  eyebrow_es: 'Primera Sección · Bosque de Chapultepec',
  eyebrow_en: 'First Section · Chapultepec Forest',
  duration_note_es:
    'Recorrido de unas tres horas como estimación. No es una duración garantizada: depende del acceso al Castillo y al Audiorama el día de la visita.',
  duration_note_en:
    'A walk of about three hours as an estimate. It is not a guaranteed duration: it depends on access to the Castle and the Audiorama on the day of the visit.',
  accents: ['talavera', 'cempasuchil'],
  heroImage: `${IMG}/castillo-aereo.jpg`,
  photos: CHAPULTEPEC_PHOTOS,
  moments: CHAPULTEPEC_MOMENTS,
  discoveries: CHAPULTEPEC_DISCOVERIES,
  route: CHAPULTEPEC_ROUTE,
  durations: CHAPULTEPEC_DURATIONS,
  notes: CHAPULTEPEC_NOTES,
  sources: SOURCES,
}
