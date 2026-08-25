import type { AnalyticsEntry } from '@/lib/analytics/track'
import type { BookingLite } from '@/lib/analytics/ml-metrics'

/**
 * Mock data for previewing socio/employee/client views.
 * Used when there is no real data in localStorage.
 */

const day = (offset: number) => new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString()

// ---------- Reservas demo (socio) ----------

export const MOCK_SOCIO_BOOKINGS: BookingLite[] = [
  // María — viajera frecuente (6 reservas, gasto alto)
  {
    id: 'm1',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Cenotes Secretos de Yucatán',
    category: 'naturaleza',
    date: day(2).slice(0, 10),
    time: '09:00',
    peopleCount: 2,
    totalPrice: 4800,
    status: 'confirmed',
    createdAt: day(2),
  },
  {
    id: 'm2',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Ruta del Jaguar en Baja',
    category: 'aventura',
    date: day(12).slice(0, 10),
    time: '08:00',
    peopleCount: 3,
    totalPrice: 8700,
    status: 'completed',
    createdAt: day(12),
  },
  {
    id: 'm3',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Historia Viva: Centro Histórico CDMX',
    category: 'cultura',
    date: day(22).slice(0, 10),
    time: '11:00',
    peopleCount: 2,
    totalPrice: 3200,
    status: 'completed',
    createdAt: day(22),
  },
  {
    id: 'm4',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Sabores de Oaxaca',
    category: 'gastronomia',
    date: day(35).slice(0, 10),
    time: '17:00',
    peopleCount: 4,
    totalPrice: 7600,
    status: 'completed',
    createdAt: day(35),
  },
  {
    id: 'm5',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Templos Perdidos de Palenque',
    category: 'cultura',
    date: day(48).slice(0, 10),
    time: '07:00',
    peopleCount: 2,
    totalPrice: 5900,
    status: 'completed',
    createdAt: day(48),
  },
  {
    id: 'm6',
    customerEmail: 'maria@example.com',
    customerName: 'María García',
    experienceTitle: 'Mercados Nocturnos de Oaxaca',
    category: 'gastronomia',
    date: day(60).slice(0, 10),
    time: '19:00',
    peopleCount: 2,
    totalPrice: 2800,
    status: 'cancelled',
    createdAt: day(60),
  },
  // Ana — exploradora regular (3 reservas)
  {
    id: 'a1',
    customerEmail: 'ana@example.com',
    customerName: 'Ana Rodríguez',
    experienceTitle: 'Sabores de Oaxaca',
    category: 'gastronomia',
    date: day(1).slice(0, 10),
    time: '17:00',
    peopleCount: 2,
    totalPrice: 3800,
    status: 'confirmed',
    createdAt: day(1),
  },
  {
    id: 'a2',
    customerEmail: 'ana@example.com',
    customerName: 'Ana Rodríguez',
    experienceTitle: 'Barrios Mágicos: Roma y Condesa',
    category: 'cultura',
    date: day(15).slice(0, 10),
    time: '16:00',
    peopleCount: 2,
    totalPrice: 2400,
    status: 'completed',
    createdAt: day(15),
  },
  {
    id: 'a3',
    customerEmail: 'ana@example.com',
    customerName: 'Ana Rodríguez',
    experienceTitle: 'Volcán Popocatépetl: Ascenso Guiado',
    category: 'aventura',
    date: day(40).slice(0, 10),
    time: '06:00',
    peopleCount: 1,
    totalPrice: 4200,
    status: 'completed',
    createdAt: day(40),
  },
  // Donovan — ocasional (1 reserva)
  {
    id: 'd1',
    customerEmail: 'donovan@amaxing.com',
    customerName: 'Donovan Riaño',
    experienceTitle: 'Lucha Libre: Noche de Campeones',
    category: 'cultura',
    date: day(4).slice(0, 10),
    time: '20:30',
    peopleCount: 2,
    totalPrice: 1600,
    status: 'confirmed',
    createdAt: day(4),
  },
  // Carlos — ocasional
  {
    id: 'c1',
    customerEmail: 'carlos@example.com',
    customerName: 'Carlos Méndez',
    experienceTitle: 'Cenotes Secretos de Yucatán',
    category: 'naturaleza',
    date: day(5).slice(0, 10),
    time: '09:00',
    peopleCount: 4,
    totalPrice: 9600,
    status: 'pending',
    createdAt: day(5),
  },
  {
    id: 'c2',
    customerEmail: 'carlos@example.com',
    customerName: 'Carlos Méndez',
    experienceTitle: 'Isla Mujeres en Catamarán Privado',
    category: 'playa',
    date: day(28).slice(0, 10),
    time: '10:00',
    peopleCount: 6,
    totalPrice: 12400,
    status: 'completed',
    createdAt: day(28),
  },
  // Lucía — regular con tendencia alta
  {
    id: 'l1',
    customerEmail: 'lucia@example.com',
    customerName: 'Lucía Torres',
    experienceTitle: 'Xochimilco: Trajinera al Atardecer',
    category: 'naturaleza',
    date: day(0).slice(0, 10),
    time: '15:00',
    peopleCount: 3,
    totalPrice: 3600,
    status: 'confirmed',
    createdAt: day(0),
  },
  {
    id: 'l2',
    customerEmail: 'lucia@example.com',
    customerName: 'Lucía Torres',
    experienceTitle: 'Museos After Hours: Chapultepec',
    category: 'museos',
    date: day(9).slice(0, 10),
    time: '18:00',
    peopleCount: 2,
    totalPrice: 2100,
    status: 'completed',
    createdAt: day(9),
  },
  // Reservas históricas para proyección
  {
    id: 'h1',
    customerEmail: 'pedro@example.com',
    customerName: 'Pedro Sánchez',
    experienceTitle: 'Teotihuacán en Globo Aerostático',
    category: 'aventura',
    date: day(7).slice(0, 10),
    time: '05:30',
    peopleCount: 2,
    totalPrice: 5200,
    status: 'completed',
    createdAt: day(7),
  },
  {
    id: 'h2',
    customerEmail: 'laura@example.com',
    customerName: 'Laura Díaz',
    experienceTitle: 'Cenotes Secretos de Yucatán',
    category: 'naturaleza',
    date: day(10).slice(0, 10),
    time: '09:00',
    peopleCount: 2,
    totalPrice: 4800,
    status: 'completed',
    createdAt: day(10),
  },
  {
    id: 'h3',
    customerEmail: 'jorge@example.com',
    customerName: 'Jorge Ramírez',
    experienceTitle: 'Sabores de Oaxaca',
    category: 'gastronomia',
    date: day(14).slice(0, 10),
    time: '17:00',
    peopleCount: 3,
    totalPrice: 5700,
    status: 'completed',
    createdAt: day(14),
  },
  {
    id: 'h4',
    customerEmail: 'sofia@example.com',
    customerName: 'Sofía Herrera',
    experienceTitle: 'Historia Viva: Centro Histórico CDMX',
    category: 'cultura',
    date: day(18).slice(0, 10),
    time: '11:00',
    peopleCount: 2,
    totalPrice: 3200,
    status: 'completed',
    createdAt: day(18),
  },
  {
    id: 'h5',
    customerEmail: 'miguel@example.com',
    customerName: 'Miguel Ángel Ruiz',
    experienceTitle: 'Ruta del Jaguar en Baja',
    category: 'aventura',
    date: day(25).slice(0, 10),
    time: '08:00',
    peopleCount: 2,
    totalPrice: 5800,
    status: 'completed',
    createdAt: day(25),
  },
]

// ---------- Analítica pasiva demo (socio) ----------

const MOCK_UA_POOL = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
]

const ROUTES = ['/', '/tours', '/experiences', '/stories', '/pricing', '/contact']

export const MOCK_ANALYTICS_ENTRIES: AnalyticsEntry[] = (() => {
  const entries: AnalyticsEntry[] = []
  let seed = 42
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  const users = [
    'maria@example.com',
    'ana@example.com',
    'donovan@amaxing.com',
    null,
    null,
    'carlos@example.com',
    null,
  ]

  for (let i = 0; i < 140; i++) {
    const user = users[Math.floor(rand() * users.length)]
    const routeIdx = Math.floor(rand() * ROUTES.length)
    const route = ROUTES[routeIdx]
    const ua = MOCK_UA_POOL[Math.floor(rand() * MOCK_UA_POOL.length)]
    const minutesAgo = Math.floor(rand() * 60 * 24 * 21)
    entries.push({
      userId: user,
      pagePath: route,
      timeOnPage: Math.floor(20 + rand() * 240),
      userAgent: ua,
      referrerUrl: rand() > 0.5 ? 'https://www.google.com/' : '',
      createdAt: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    })
  }

  return entries
})()

// ---------- QRs demo (empleado / cliente) ----------

export interface MockBookingRecord {
  ticketCode: string
  experienceTitle: string
  date: string
  time: string
  peopleCount: number
  totalPrice: number
  currency: string
  customerName: string
  status: string
  meetingPoint: string | null
}

/** Reservas demo escaneables por el lector: AMX-T-XXXX */
export const MOCK_SCANNABLE_BOOKINGS: Record<string, MockBookingRecord> = {
  '7K9M2X': {
    ticketCode: 'AMX-T-7K9M2X',
    experienceTitle: 'Cenotes Secretos de Yucatán',
    date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    time: '09:00',
    peopleCount: 2,
    totalPrice: 4800,
    currency: 'MXN',
    customerName: 'María García',
    status: 'confirmed',
    meetingPoint: 'Plaza Grande, Mérida',
  },
  B4J1R: {
    ticketCode: 'AMX-T-B4J1R',
    experienceTitle: 'Ruta del Jaguar en Baja',
    date: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    time: '08:00',
    peopleCount: 3,
    totalPrice: 8700,
    currency: 'MXN',
    customerName: 'Ana Rodríguez',
    status: 'confirmed',
    meetingPoint: 'Hotel Coral & Marina, La Paz',
  },
  T9W5Q: {
    ticketCode: 'AMX-T-T9W5Q',
    experienceTitle: 'Historia Viva: Centro Histórico CDMX',
    date: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    time: '11:00',
    peopleCount: 4,
    totalPrice: 6400,
    currency: 'MXN',
    customerName: 'Donovan Riaño',
    status: 'pending',
    meetingPoint: 'Zócalo, frente a Catedral',
  },
}
