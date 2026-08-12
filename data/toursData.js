// Tours de Amaxing — todos operan en la Ciudad de México (CDMX), ciudad de lanzamiento.
// Los campos `title`, `tagline`, `description`, `highlights`, `includes`, `itinerary`,
// `location` y `meetingPoint` son el idioma por defecto (inglés); los campos `*Es`
// son la traducción al español. Los consumidores (chatbot, carrito) usan los campos
// base; la UI elige por idioma.

export const tours = [
  {
    id: '1',
    category: 'gastronomy',
    isFeatured: true,
    price: 65,
    duration: 3,
    maxGuests: 8,
    rating: 4.9,
    reviewCount: 312,
    imageUrl: '/static/images/cochinita.jpg',
    gallery: [
      '/static/images/cochinita.jpg',
      '/static/images/pozole.jpg',
      '/static/images/gusano.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Mercado de San Juan, Ernestina Ponce 99, Centro',
    meetingPointEs: 'Mercado de San Juan, Ernestina Ponce 99, Centro',
    title: 'Street Food Secrets of the Historic Center',
    titleEs: 'Secretos de la Comida Callejera del Centro Histórico',
    tagline:
      'Eat your way through Mexico City with a local foodie: tacos, tlacoyos, tamales and exotic market bites.',
    taglineEs:
      'Cómelo todo en CDMX de la mano de un foodie local: tacos, tlacoyos, tamales y antojos exóticos de mercado.',
    description: `A guided street food walk through the beating heart of Mexico City. Your local guide takes you from the famous **Mercado de San Juan** — where chefs shop for exotic ingredients — to family-run taquerías and humble fondas that never make it into guidebooks.

You'll taste cochinita pibil, pozole, fresh tortillas, tlacoyos and more, learning the story behind each bite: how nixtamalization made corn the backbone of Mexican cuisine, and why the taco is a form of art.

Small group (max 8) so you always get a seat at the counter.`,
    descriptionEs: `Un recorrido gastronómico a pie por el corazón de la Ciudad de México. Tu guía local te lleva desde el famoso **Mercado de San Juan** — donde los chefs compran ingredientes exóticos — hasta taquerías familiares y fondas humildes que nunca aparecen en las guías.

Probarás cochinita pibil, pozole, tortillas recién hechas, tlacoyos y más, descubriendo la historia detrás de cada bocado: cómo la nixtamalización hizo del maíz el pilar de la cocina mexicana y por qué el taco es una forma de arte.

Grupo reducido (máx. 8) para que siempre tengas asiento en la barra.`,
    highlights: ['Local foodie guide', 'Market tasting at San Juan', 'Family-run taquerías'],
    highlightsEs: [
      'Guía foodie local',
      'Degustación en el Mercado de San Juan',
      'Taquerías familiares',
    ],
    includes: ['All tastings included', 'Bottled water', 'Walking route notes'],
    includesEs: ['Todas las degustaciones incluidas', 'Agua embotellada', 'Notas de la ruta'],
    itinerary: [
      'Meet at Mercado de San Juan and tour the exotic stalls',
      'Walk to La Merced for street tacos and tlacoyos',
      'Sit down at a fonda for pozole and cochinita pibil',
      'Finish with artisanal tamales and fresh juice',
    ],
    itineraryEs: [
      'Reunión en el Mercado de San Juan y recorrido por sus puestos exóticos',
      'Caminata a La Merced para tacos callejeros y tlacoyos',
      'Fonda tradicional con pozole y cochinita pibil',
      'Cierre con tamales artesanales y jugo fresco',
    ],
  },
  {
    id: '2',
    category: 'gastronomy',
    isFeatured: false,
    price: 95,
    duration: 4,
    maxGuests: 6,
    rating: 4.8,
    reviewCount: 184,
    imageUrl: '/static/images/mole.jpeg',
    gallery: [
      '/static/images/mole.jpeg',
      '/static/images/cochinita.jpg',
      '/static/images/pozole.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Casa de las Cocinas Tradicionales, Coyoacán',
    meetingPointEs: 'Casa de las Cocinas Tradicionales, Coyoacán',
    title: 'Mole & Chocolate Cooking Class in Coyoacán',
    titleEs: 'Clase de Mole y Chocolate en Coyoacán',
    tagline:
      'Hands-on class with a traditional cook: grind your own mole with a metate and make drinking chocolate from scratch.',
    taglineEs:
      'Clase práctica con una cocinera tradicional: muele tu propio mole en metate y prepara chocolate de agua desde cero.',
    description: `Roll up your sleeves in the bohemian neighborhood of **Coyoacán**. With a traditional cook, you'll grind chilies and seeds on a volcanic-stone *metate* to build a true Oaxacan-style mole, then turn raw cacao into a frothy drinking chocolate.

The class includes a small market visit to buy the exact ingredients, and ends sitting around the family table where you taste everything you made.

Perfect for food lovers who want more than a photo — you'll leave with recipes you can actually make at home.`,
    descriptionEs: `Arrémate las mangas en el bohemio barrio de **Coyoacán**. De la mano de una cocinera tradicional molerás chiles y semillas en un *metate* de piedra volcánica para construir un mole auténtico estilo oaxaqueño, y convertirás cacao en rama en un espumoso chocolate de agua.

La clase incluye una visita corta al mercado para comprar los ingredientes exactos y termina en la mesa familiar degustando todo lo que preparaste.

Perfecto para amantes de la comida que quieren más que una foto: saldrás con recetas que puedes replicar en casa.`,
    highlights: [
      'Traditional cook instructor',
      'Metate grinding technique',
      'Chocolate from raw cacao',
    ],
    highlightsEs: [
      'Instructora cocinera tradicional',
      'Técnica de molienda en metate',
      'Chocolate desde cacao crudo',
    ],
    includes: ['All ingredients', 'Lunch with your dishes', 'Recipes to take home'],
    includesEs: [
      'Todos los ingredientes',
      'Comida con tus platillos',
      'Recetas para llevar a casa',
    ],
    itinerary: [
      'Short market stop to shop for ingredients',
      'Grind chilies and spices on a metate',
      'Cook mole and prepare drinking chocolate',
      'Sit down to eat everything together',
    ],
    itineraryEs: [
      'Parada corta en el mercado para comprar ingredientes',
      'Molienda de chiles y especias en metate',
      'Cocina del mole y preparación del chocolate de agua',
      'Comida en familia degustando todo lo preparado',
    ],
  },
  {
    id: '3',
    category: 'gastronomy',
    isFeatured: false,
    price: 85,
    duration: 3,
    maxGuests: 10,
    rating: 4.7,
    reviewCount: 96,
    imageUrl: '/static/images/gusano.jpg',
    gallery: [
      '/static/images/gusano.jpg',
      '/static/images/pozole.jpg',
      '/static/images/cochinita.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Pulquería Las Duelistas, Avenida Arcos de Belén 73, Centro',
    meetingPointEs: 'Pulquería Las Duelistas, Av. Arcos de Belén 73, Centro',
    title: 'Mezcal & Pulque Tasting: The Drinks of Old Mexico',
    titleEs: 'Cata de Mezcal y Pulque: Las Bebidas del México Antiguo',
    tagline:
      'Compare ancestral pulque and artisanal mezcal with an agave expert, in historic cantinas and pulquerías.',
    taglineEs:
      'Compara el ancestral pulque y el mezcal artesanal con un experto agavero, en cantinas y pulquerías históricas.',
    description: `An afterno-on exploring the two drinks that shaped Mexican culture centuries before tequila existed. Your agave expert walks you through historic **pulquerías** to taste fresh, fermented pulque, then to a curated mezcal bar to compare ancestral and artisanal varieties.

You'll learn how pulque was sacred to the Aztecs, how mezcal is produced village by village, and how to read a bottle's label like a pro.

Includes 4 pulque flavors and 5 mezcal tastings with salt, orange and chapulines.`,
    descriptionEs: `Una tarde explorando las dos bebidas que moldearon la cultura mexicana siglos antes de que existiera el tequila. Tu experto agavero recorre contigo **pulquerías** históricas para probar pulque fresco fermentado, y luego una barra de mezcal curada para comparar variedades ancestrales y artesanales.

Aprenderás cómo el pulque era sagrado para los aztecas, cómo se produce el mezcal pueblo por pueblo y a leer una etiqueta como un profesional.

Incluye 4 sabores de pulque y 5 catas de mezcal con sal, naranja y chapulines.`,
    highlights: ['Agave expert guide', '4 pulque flavors', '5 mezcal tastings'],
    highlightsEs: ['Guía experto agavero', '4 sabores de pulque', '5 catas de mezcal'],
    includes: ['All tastings', 'Traditional pairings', 'Pulquería history notes'],
    includesEs: ['Todas las catas', 'Acompañamientos tradicionales', 'Notas de historia pulquera'],
    itinerary: [
      'Meet at a historic pulquería and taste 4 curados',
      'Walk the cantinas of the old center',
      'Move to a curated mezcal bar for 5 tastings',
      'End with pairing bites and label-reading tips',
    ],
    itineraryEs: [
      'Reunión en una pulquería histórica para probar 4 curados',
      'Recorrido por las cantinas del centro antiguo',
      'Barra de mezcal curada con 5 catas',
      'Cierre con maridaje y trucos para leer etiquetas',
    ],
  },
  {
    id: '4',
    category: 'history',
    isFeatured: true,
    price: 120,
    duration: 4,
    maxGuests: 8,
    rating: 4.9,
    reviewCount: 421,
    imageUrl: '/static/images/BestMuseums2/mayor.jpg',
    gallery: [
      '/static/images/BestMuseums2/mayor.jpg',
      '/static/images/Muertos/zocalo.png',
      '/static/images/bellas.jpeg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Main gate of the Templo Mayor Museum, Seminario 8, Centro',
    meetingPointEs: 'Entrada principal del Museo del Templo Mayor, Seminario 8, Centro',
    title: 'Templo Mayor & the Aztec Underworld',
    titleEs: 'Templo Mayor y el Inframundo Azteca',
    tagline:
      'Descend into the excavated heart of Tenochtitlán with an archaeologist who decodes the Aztec capital.',
    taglineEs:
      'Desciende al corazón excavado de Tenochtitlán con un arqueólogo que descifra la capital azteca.',
    description: `In the exact center of Mexico City lie the ruins of the Aztec capital **Tenochtitlán**. Led by a professional archaeologist, you'll walk the excavated plaza of the Templo Mayor, see the Coyolxauhqui monolith, and learn how the Aztecs read the sky to build their dual temple to Huitzilopochtli and Tlaloc.

Then you'll climb to the Zócalo above and connect the dots: the Spanish cathedral standing on the same sacred ground, and the modern city built on a lake.

This is the tour for travelers who want real history, not a highlight reel.`,
    descriptionEs: `En el centro exacto de la Ciudad de México se encuentran las ruinas de la capital azteca **Tenochtitlán**. Guiado por un arqueólogo profesional, caminarás la plaza excavada del Templo Mayor, verás el monolito de Coyolxauhqui y aprenderás cómo los aztecas leían el cielo para construir su templo dual a Huitzilopochtli y Tlaloc.

Después subirás al Zócalo y conectarás los puntos: la catedral española erigida sobre el mismo suelo sagrado y la ciudad moderna construida sobre un lago.

Es el tour para viajeros que quieren historia real, no un resumen comercial.`,
    highlights: ['Professional archaeologist', 'Coyolxauhqui monolith', 'Zócalo above the ruins'],
    highlightsEs: ['Arqueólogo profesional', 'Monolito de Coyolxauhqui', 'Zócalo sobre las ruinas'],
    includes: ['Museum entry', 'Expert guide', 'Skip-the-line access'],
    includesEs: ['Entrada al museo', 'Guía experto', 'Acceso sin filas'],
    itinerary: [
      'Meet at the Templo Mayor Museum gate',
      'Walk the excavated plaza and main temple base',
      'Study the Coyolxauhqui monolith and exhibits',
      'Climb to the Zócalo to connect the history',
    ],
    itineraryEs: [
      'Reunión en la entrada del Museo del Templo Mayor',
      'Recorrido por la plaza excavada y la base del templo',
      'Análisis del monolito de Coyolxauhqui y las salas',
      'Subida al Zócalo para conectar la historia',
    ],
  },
  {
    id: '5',
    category: 'history',
    isFeatured: false,
    price: 90,
    duration: 3,
    maxGuests: 10,
    rating: 4.8,
    reviewCount: 267,
    imageUrl: '/static/images/bellas.jpeg',
    gallery: [
      '/static/images/bellas.jpeg',
      '/static/images/Muertos/zocalo.png',
      '/static/images/chapu.jpeg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Palacio de Bellas Artes, Av. Juárez, Centro',
    meetingPointEs: 'Palacio de Bellas Artes, Av. Juárez, Centro',
    title: 'Palacio de Bellas Artes & the Muralists',
    titleEs: 'Palacio de Bellas Artes y los Muralistas',
    tagline:
      'Face-to-face with Rivera, Siqueiros and Orozco in the city’s most beautiful art nouveau palace.',
    taglineEs:
      'Cara a cara con Rivera, Siqueiros y Orozco en el palacio art nouveau más bello de la ciudad.',
    description: `Dedicated to Mexico's greatest painters, **Palacio de Bellas Artes** is a marble palace whose murals turned politics into art. Your guide decodes Diego Rivera's *Man at the Crossroads*, José Clemente Orozco's *Katharsis* and David Alfaro Siqueiros's monumental pieces.

You'll also enjoy the building itself: art nouveau on the outside, art deco inside, with a Tiffany-style glass curtain in the theater.

A perfect two-part tour: the murals, then a walk through the Alameda park and the old center.`,
    descriptionEs: `Dedicado a los grandes pintores de México, el **Palacio de Bellas Artes** es un palacio de mármol cuyos murales convirtieron la política en arte. Tu guía descifra *El hombre en la encrucijada* de Diego Rivera, la *Katharsis* de José Clemente Orozco y las piezas monumentales de David Alfaro Siqueiros.

También disfrutarás el edificio: art nouveau por fuera, art decó por dentro, con un telón de cristal estilo Tiffany en el teatro.

Un tour perfecto en dos partes: los murales y luego una caminata por la Alameda y el centro histórico.`,
    highlights: [
      'Rivera, Orozco & Siqueiros murals',
      'Art nouveau & art deco building',
      'Alameda walk',
    ],
    highlightsEs: [
      'Murales de Rivera, Orozco y Siqueiros',
      'Edificio art nouveau y art decó',
      'Paseo por la Alameda',
    ],
    includes: ['Museum entry', 'Guide through all murals', 'Theater glass curtain viewing'],
    includesEs: [
      'Entrada al museo',
      'Guía por todos los murales',
      'Vista del telón de cristal del teatro',
    ],
    itinerary: [
      'Meet at the Bellas Artes main entrance',
      'Tour the mural floors with an art historian',
      'View the theater and Tiffany glass curtain',
      'Walk the Alameda to end the experience',
    ],
    itineraryEs: [
      'Reunión en la entrada principal de Bellas Artes',
      'Recorrido por los pisos de murales con un historiador del arte',
      'Vista del teatro y el telón de cristal Tiffany',
      'Caminata por la Alameda para cerrar la experiencia',
    ],
  },
  {
    id: '6',
    category: 'history',
    isFeatured: false,
    price: 110,
    duration: 5,
    maxGuests: 10,
    rating: 4.8,
    reviewCount: 152,
    imageUrl: '/static/images/chapu.jpeg',
    gallery: [
      '/static/images/chapu.jpeg',
      '/static/images/BestMuseums1/chapu.jpg',
      '/static/images/bellas.jpeg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Monument to the Niños Héroes, Chapultepec Park entrance',
    meetingPointEs: 'Monumento a los Niños Héroes, entrada del Bosque de Chapultepec',
    title: 'Chapultepec Castle & Reforma Avenue',
    titleEs: 'Castillo de Chapultepec y Paseo de la Reforma',
    tagline:
      'From Aztec sanctuary to imperial palace: the only royal castle in the Americas and the avenue that connects Mexico’s history.',
    taglineEs:
      'De santuario azteca a palacio imperial: el único castillo real de América y la avenida que conecta la historia de México.',
    description: `Perched on the hill the Aztecs considered sacred, **Chapultepec Castle** is the only genuine royal residence in the Americas. You'll tour its sumptuous rooms — from Maximilian's empire to the modern presidents — with panoramic views over the city.

After the castle, you'll follow **Paseo de la Reforma**, the grand avenue designed by an Austrian archduke, passing the Angel of Independence and learning why this boulevard is the stage of Mexican public life.

A longer tour that earns its hours: castle, museum, gardens and boulevard.`,
    descriptionEs: `En la cima del cerro que los aztecas consideraban sagrado, el **Castillo de Chapultepec** es la única residencia real genuina de América. Recorrerás sus salones suntuosos — del imperio de Maximiliano a los presidentes modernos — con vistas panorámicas de la ciudad.

Tras el castillo seguirás por el **Paseo de la Reforma**, la gran avenida diseñada por un archiduque austriaco, pasando por el Ángel de la Independencia y descubriendo por qué este bulevar es el escenario de la vida pública mexicana.

Un tour largo que vale sus horas: castillo, museo, jardines y bulevar.`,
    highlights: [
      'Only royal castle in the Americas',
      'Palace interiors & gardens',
      'Reforma & Angel walk',
    ],
    highlightsEs: [
      'Único castillo real de América',
      'Interiores del palacio y jardines',
      'Paseo por Reforma y el Ángel',
    ],
    includes: ['Castle museum entry', 'Guide throughout', 'Reforma walking route'],
    includesEs: [
      'Entrada al museo del castillo',
      'Guía durante todo el recorrido',
      'Ruta a pie por Reforma',
    ],
    itinerary: [
      'Meet at the Niños Héroes monument',
      'Climb to the castle and tour imperial rooms',
      'Wander the castle gardens with views',
      'Walk Reforma down to the Angel of Independence',
    ],
    itineraryEs: [
      'Reunión en el monumento a los Niños Héroes',
      'Subida al castillo y recorrido por los salones imperiales',
      'Paseo por los jardines del castillo con vistas',
      'Caminata por Reforma hasta el Ángel de la Independencia',
    ],
  },
  {
    id: '7',
    category: 'neighborhoods',
    isFeatured: true,
    price: 98,
    duration: 5,
    maxGuests: 8,
    rating: 4.9,
    reviewCount: 348,
    imageUrl: '/static/images/fridaYDiego/Las-dos-fridas-autorretrato.png',
    gallery: [
      '/static/images/fridaYDiego/Las-dos-fridas-autorretrato.png',
      '/static/images/fridaYDiego/capilla-riveriana.png',
      '/static/images/fridaYDiego/Autorretrato-con-collar-de-espinas-2.png',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Frida Kahlo Museum (Casa Azul), Londres 247, Coyoacán',
    meetingPointEs: 'Museo Frida Kahlo (Casa Azul), Londres 247, Coyoacán',
    title: 'Coyoacán: Frida, Diego & the Bohemian Soul',
    titleEs: 'Coyoacán: Frida, Diego y el Alma Bohemia',
    tagline:
      'The Blue House, the Rivera studio and cobblestone plazas — the neighborhood where Mexican art was born.',
    taglineEs:
      'La Casa Azul, el estudio de Rivera y plazas empedradas: el barrio donde nació el arte mexicano.',
    description: `Few neighborhoods tell Mexico's story like **Coyoacán**. Starting at Frida Kahlo's **Blue House**, you'll trace her life, her love and her pain through the rooms she painted in. From there, a short walk takes you to the Rivera Anahuacalli studio, the colorful market and the leafy main plaza with its famous coyotes.

Your guide connects it all: the artists, the revolution that shaped them, and why this bohemian barrio still attracts creators today.

Includes museum entry and a stroll through the San Juan Evangelista church square.`,
    descriptionEs: `Pocos barrios cuentan la historia de México como **Coyoacán**. Empezando en la **Casa Azul** de Frida Kahlo, recorrerás su vida, su amor y su dolor a través de las habitaciones que pintó. A unos pasos, el estudio Anahuacalli de Rivera, el colorido mercado y la frondosa plaza principal con sus famosos coyotes.

Tu guía lo conecta todo: los artistas, la revolución que los moldeó y por qué este barrio bohemio sigue atrayendo creadores.

Incluye entrada a los museos y un paseo por la plaza de la iglesia de San Juan Evangelista.`,
    highlights: [
      'Casa Azul (Frida Kahlo Museum)',
      'Rivera Anahuacalli studio',
      'Coyoacán main plaza',
    ],
    highlightsEs: [
      'Casa Azul (Museo Frida Kahlo)',
      'Estudio Anahuacalli de Rivera',
      'Plaza principal de Coyoacán',
    ],
    includes: ['Both museum entries', 'Local art historian guide', 'Market & plaza walk'],
    includesEs: [
      'Entradas a ambos museos',
      'Guía historiador de arte local',
      'Paseo por el mercado y la plaza',
    ],
    itinerary: [
      'Meet at the Blue House and tour Frida’s rooms',
      'Walk to the Rivera Anahuacalli studio',
      'Browse the Coyoacán market',
      'Relax in the main plaza and hear the stories',
    ],
    itineraryEs: [
      'Reunión en la Casa Azul y recorrido por las habitaciones de Frida',
      'Caminata al estudio Anahuacalli de Rivera',
      'Paseo por el mercado de Coyoacán',
      'Descanso en la plaza principal con historias de fondo',
    ],
  },
  {
    id: '8',
    category: 'neighborhoods',
    isFeatured: false,
    price: 75,
    duration: 3,
    maxGuests: 10,
    rating: 4.7,
    reviewCount: 205,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Parque España, Roma Norte',
    meetingPointEs: 'Parque España, Roma Norte',
    title: 'Roma & Condesa: Art Deco and Café Culture',
    titleEs: 'Roma y Condesa: Art Decó y Cultura de Cafés',
    tagline:
      'Tree-lined avenues, art deco facades and the world’s best café terraces — the new bohemia of CDMX.',
    taglineEs:
      'Avenidas arboladas, fachadas art decó y las mejores terrazas de cafés del mundo: la nueva bohemia de CDMX.',
    description: `Once a car-free refuge for artists, **Roma and Condesa** are now the most walkable, café-filled neighborhoods in Latin America. You'll stroll the tree-lined streets of Condesa, spot art deco mansions and hidden murals in Roma, and stop at legendary cafés and pastry shops.

Your guide shares the real story: the 1985 earthquake that reshaped these blocks, the gentrification debate, and where to find the best mezcaleria when the tour ends.

Easy walking, lots of photo stops, and the city's best people-watching.`,
    descriptionEs: `Antiguo refugio para artistas, **Roma y Condesa** son hoy los barrios más caminables y llenos de cafés de América Latina. Recorrerás las avenidas arboladas de Condesa, descubrirás mansiones art decó y murales ocultos en la Roma, y harás paradas en cafeterías y pastelerías legendarias.

Tu guía comparte la historia real: el terremoto de 1985 que reconfiguró estas cuadras, el debate de la gentrificación y dónde encontrar la mejor mezcalería al terminar.

Caminata ligera, muchas paradas para fotos y la mejor gente del mundo para observar.`,
    highlights: ['Condesa tree-lined avenues', 'Roma art deco mansions', 'Legendary cafés'],
    highlightsEs: [
      'Avenidas arboladas de Condesa',
      'Mansiones art decó de la Roma',
      'Cafés legendarios',
    ],
    includes: ['Local neighborhood guide', 'Coffee tasting stop', 'Insider recommendations'],
    includesEs: [
      'Guía local del barrio',
      'Parada de degustación de café',
      'Recomendaciones de experto',
    ],
    itinerary: [
      'Meet at Parque España',
      'Walk Condesa’s green avenues',
      'Cross to Roma for art deco & murals',
      'Coffee break at a legendary café',
    ],
    itineraryEs: [
      'Reunión en el Parque España',
      'Recorrido por las avenidas verdes de Condesa',
      'Paso a la Roma para art decó y murales',
      'Pausa de café en una cafetería legendaria',
    ],
  },
  {
    id: '9',
    category: 'neighborhoods',
    isFeatured: false,
    price: 80,
    duration: 4,
    maxGuests: 12,
    rating: 4.8,
    reviewCount: 289,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Embarcadero Nuevo Nativitas, Xochimilco',
    meetingPointEs: 'Embarcadero Nuevo Nativitas, Xochimilco',
    title: 'Xochimilco: Trajineras & Floating Gardens',
    titleEs: 'Xochimilco: Trajineras y Jardines Flotantes',
    tagline:
      'Glide down ancient canals on a flower-covered boat, with mariachi, market food and 2,000 years of history.',
    taglineEs:
      'Navega antiguos canales en una trajinera florida, con mariachi, antojitos de mercado y 2,000 años de historia.',
    description: `**Xochimilco** means "the place of flowers" in Nahuatl, and this UNESCO site has floated on chinampas — artificial islands — for over two millennia. You'll board a colorful *trajinera* and glide through canals lined with willow trees, alongside mariachi and marimba boats that you can hire for your own private concert.

Along the way you'll stop at a working chinampa to learn the farming technique the Aztecs invented, and taste market snacks straight from the boats.

The most magical, unmissable side of Mexico City.`,
    descriptionEs: `**Xochimilco** significa "el lugar de las flores" en náhuatl, y este sitio UNESCO flota sobre chinampas — islas artificiales — desde hace más de dos milenios. Abordarás una colorida *trajinera* y navegarás por canales bordeado de sauces, junto a barcas de mariachi y marimba que puedes contratar para tu concierto privado.

En el camino harás parada en una chinampa trabajada para aprender la técnica agrícola que inventaron los aztecas, y probarás antojitos directamente desde las barcas.

El lado más mágico e imperdible de la Ciudad de México.`,
    highlights: ['Trajinera canal ride', 'Working chinampa visit', 'Mariachi on the water'],
    highlightsEs: [
      'Paseo en trajinera por los canales',
      'Visita a una chinampa trabajada',
      'Mariachi sobre el agua',
    ],
    includes: ['Trajinera ride', 'Chinampa visit', 'Market snack tasting'],
    includesEs: ['Paseo en trajinera', 'Visita a chinampa', 'Degustación de antojitos del mercado'],
    itinerary: [
      'Meet at the Nativitas embarcadero',
      'Board your trajinera and glide the canals',
      'Stop at a chinampa to learn Aztec farming',
      'Taste market snacks while floating back',
    ],
    itineraryEs: [
      'Reunión en el embarcadero de Nativitas',
      'Abordaje de tu trajinera y navegación por los canales',
      'Parada en una chinampa para aprender la agricultura azteca',
      'Antojitos de mercado mientras regresas flotando',
    ],
  },
  {
    id: '10',
    category: 'museums',
    isFeatured: true,
    price: 85,
    duration: 3,
    maxGuests: 8,
    rating: 4.9,
    reviewCount: 512,
    imageUrl: '/static/images/BestMuseums1/Antropologia.jpg',
    gallery: [
      '/static/images/BestMuseums1/Antropologia.jpg',
      '/static/images/BestMuseums2/mna.jpg',
      '/static/images/BestMuseums1/chapu.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'National Museum of Anthropology, Av. Paseo de la Reforma, Chapultepec',
    meetingPointEs: 'Museo Nacional de Antropología, Av. Paseo de la Reforma, Chapultepec',
    title: 'National Museum of Anthropology Masterclass',
    titleEs: 'Masterclass en el Museo Nacional de Antropología',
    tagline:
      'The Aztec Sun Stone, the colossal Tláloc and 20 rooms of Mesoamerica decoded by a museum specialist.',
    taglineEs:
      'La Piedra del Sol azteca, el colosal Tláloc y 20 salas de Mesoamérica descifradas por un especialista.',
    description: `The **National Museum of Anthropology** is one of the great museums of the world — and easy to get lost in. Your specialist guide builds a route through its 20 rooms, focusing on the Mexica hall: the Aztec Sun Stone, the 23-ton Tláloc monolith, and the feather headdress that was once the emperor's crown.

You'll also see the Maya room, the Oaxaca room and the epic carved reliefs that explain 3,000 years of history in a morning.

Includes priority entry and a clear narrative — no audio guide needed.`,
    descriptionEs: `El **Museo Nacional de Antropología** es uno de los grandes museos del mundo — y fácil de perderse en él. Tu guía especialista traza una ruta por sus 20 salas, enfocándose en la sala mexica: la Piedra del Sol azteca, el monolito de Tláloc de 23 toneladas y el penacho de plumas que fue la corona del emperador.

También verás la sala maya, la de Oaxaca y los relieves esculpidos que explican 3,000 años de historia en una mañana.

Incluye entrada preferente y una narrativa clara — sin necesidad de audioguía.`,
    highlights: ['Aztec Sun Stone', 'Tláloc monolith', 'Maya & Oaxaca rooms'],
    highlightsEs: ['Piedra del Sol azteca', 'Monolito de Tláloc', 'Salas maya y oaxaqueña'],
    includes: ['Priority entry', 'Specialist guide', 'Museum map & route'],
    includesEs: ['Entrada preferente', 'Guía especialista', 'Mapa y ruta del museo'],
    itinerary: [
      'Meet at the museum main entrance',
      'Enter with priority and skip the line',
      'Tour the Mexica hall and Sun Stone',
      'Finish in the Maya and Oaxaca rooms',
    ],
    itineraryEs: [
      'Reunión en la entrada principal del museo',
      'Entrada preferente sin filas',
      'Recorrido por la sala mexica y la Piedra del Sol',
      'Cierre en las salas maya y oaxaqueña',
    ],
  },
  {
    id: '11',
    category: 'museums',
    isFeatured: false,
    price: 75,
    duration: 3,
    maxGuests: 8,
    rating: 4.8,
    reviewCount: 193,
    imageUrl: '/static/images/BestMuseums1/mam.jpg',
    gallery: [
      '/static/images/BestMuseums1/mam.jpg',
      '/static/images/BestMuseums3/tamayo.jpg',
      '/static/images/BestMuseums2/Acuarela.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Museo de Arte Moderno, Paseo de la Reforma, Chapultepec',
    meetingPointEs: 'Museo de Arte Moderno, Paseo de la Reforma, Chapultepec',
    title: 'Modern Art & the Tamayo Collection',
    titleEs: 'Arte Moderno y la Colección Tamayo',
    tagline:
      'From Kahlo and Tamayo to the best of contemporary Mexican art, across two museums in Chapultepec.',
    taglineEs:
      'De Kahlo y Tamayo a lo mejor del arte contemporáneo mexicano, entre dos museos de Chapultepec.',
    description: `A curated art route through the heart of Chapultepec Park. Start at the **Museo de Arte Moderno** with its striking collection of Kahlo, Tamayo, Siqueiros and contemporary Mexican masters, set in a sculpture garden.

Then cross the park to the **Rufino Tamayo Museum**, designed to bring the world's modern art to Mexico: Picasso, Miró, Bacon and more in a building that is itself a sculpture.

Your guide explains the dialogues between Mexican and international art across the 20th century.`,
    descriptionEs: `Una ruta de arte curada por el corazón del Bosque de Chapultepec. Empieza en el **Museo de Arte Moderno** con su impactante colección de Kahlo, Tamayo, Siqueiros y maestros contemporáneos mexicanos, instalada en un jardín de esculturas.

Luego cruza el parque al **Museo Rufino Tamayo**, diseñado para traer el arte moderno del mundo a México: Picasso, Miró, Bacon y más, en un edificio que es en sí mismo una escultura.

Tu guía explica los diálogos entre el arte mexicano e internacional a lo largo del siglo XX.`,
    highlights: ['Kahlo & Tamayo paintings', 'Sculpture garden', 'International modern art'],
    highlightsEs: [
      'Pinturas de Kahlo y Tamayo',
      'Jardín de esculturas',
      'Arte moderno internacional',
    ],
    includes: ['Both museum entries', 'Art historian guide', 'Park walking route'],
    includesEs: ['Entradas a ambos museos', 'Guía historiador de arte', 'Ruta a pie por el parque'],
    itinerary: [
      'Meet at the Modern Art Museum',
      'Tour Kahlo, Tamayo and Mexican masters',
      'Walk through the sculpture garden',
      'Cross to the Tamayo Museum for international art',
    ],
    itineraryEs: [
      'Reunión en el Museo de Arte Moderno',
      'Recorrido por Kahlo, Tamayo y maestros mexicanos',
      'Paseo por el jardín de esculturas',
      'Cruce al Museo Tamayo para el arte internacional',
    ],
  },
  {
    id: '12',
    category: 'museums',
    isFeatured: false,
    price: 80,
    duration: 3,
    maxGuests: 8,
    rating: 4.7,
    reviewCount: 141,
    imageUrl: '/static/images/BestMuseums3/tamayo.jpg',
    gallery: [
      '/static/images/BestMuseums3/tamayo.jpg',
      '/static/images/BestMuseums3/papalote.jpg',
      '/static/images/BestMuseums2/muacc.jpg',
    ],
    location: 'Mexico City, Mexico',
    locationEs: 'Ciudad de México, México',
    meetingPoint: 'Museo Universitario de Arte Contemporáneo (MUAC), UNAM, Coyoacán',
    meetingPointEs: 'Museo Universitario de Arte Contemporáneo (MUAC), UNAM, Coyoacán',
    title: 'MUAC & Contemporary Art Circuit',
    titleEs: 'MUAC y el Circuito de Arte Contemporáneo',
    tagline:
      'Mexico’s boldest contemporary art at UNAM, with its famous murals and the soaring library of Coyoacán.',
    taglineEs:
      'El arte contemporáneo más audaz de México en la UNAM, con sus murales famosos y la imponente biblioteca de Coyoacán.',
    description: `Step into the future of Mexican art at the **MUAC** (University Museum of Contemporary Art), the country's most important space for today's artists. Your guide decodes the daring installations and video works, and explains how Mexico's art scene became a global reference.

The tour extends beyond the museum into the UNAM campus — a UNESCO World Heritage site — to see the famous Central Library mosaic by Juan O'Gorman and Rivera's monumental stadium mural.

Modern art, epic architecture and campus stories in one outing.`,
    descriptionEs: `Entra al futuro del arte mexicano en el **MUAC** (Museo Universitario de Arte Contemporáneo), el espacio más importante del país para los artistas de hoy. Tu guía descifra las atrevidas instalaciones y obras de video, y explica cómo la escena del arte mexicano se volvió referencia global.

El tour se extiende más allá del museo al campus de la UNAM — patrimonio UNESCO — para ver el famoso mural biblioteca de Juan O'Gorman y el mural monumental de Rivera en el estadio.

Arte contemporáneo, arquitectura épica e historias del campus en una sola salida.`,
    highlights: [
      'MUAC contemporary galleries',
      'UNAM Central Library mural',
      'Rivera stadium mural',
    ],
    highlightsEs: [
      'Galerías contemporáneas del MUAC',
      'Mural de la Biblioteca Central de la UNAM',
      'Mural de Rivera en el estadio',
    ],
    includes: ['MUAC entry', 'Guide through galleries', 'UNAM campus walk'],
    includesEs: ['Entrada al MUAC', 'Guía por las galerías', 'Paseo por el campus de la UNAM'],
    itinerary: [
      'Meet at the MUAC entrance',
      'Tour the contemporary galleries',
      'Walk to the Central Library mosaic',
      'See the stadium mural to finish',
    ],
    itineraryEs: [
      'Reunión en la entrada del MUAC',
      'Recorrido por las galerías contemporáneas',
      'Caminata al mural de la Biblioteca Central',
      'Mural del estadio para cerrar',
    ],
  },
]

export const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'gastronomy', label: 'Gastronomy', icon: 'Utensils' },
  { id: 'history', label: 'History', icon: 'Skull' },
  { id: 'neighborhoods', label: 'Neighborhoods', icon: 'MapPin' },
  { id: 'museums', label: 'Museums', icon: 'Palette' },
]
