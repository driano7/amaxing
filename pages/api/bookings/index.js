import { createBooking, createBookings, getBookingsByUser } from '@/lib/booking/server'
import { getSession } from '@/lib/auth/session'

export default async function handler(req, res) {
  const session = await getSession(req)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  // GET allows viewing bookings - authenticated users get their bookings,
  // unauthenticated/guest users see empty (guest bookings managed client-side)
  if (req.method === 'GET') {
    try {
      if (session?.user?.id && !session.user.id.startsWith('guest_')) {
        const bookings = await getBookingsByUser(session.user.id)
        return res.status(200).json({ bookings })
      }
      // For guests or no user, return empty - client will handle localStorage
      return res.status(200).json({ bookings: [] })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return res.status(500).json({ error: 'Error al obtener reservaciones' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body

      // Support bulk checkout: { bookings: [...] } or single: { experienceId, date, time, peopleCount }
      const items =
        Array.isArray(body?.bookings) && body.bookings.length > 0 ? body.bookings : [body]

      if (
        items.length === 0 ||
        items.some(
          (item) => !item?.experienceId || !item?.date || !item?.time || !item?.peopleCount
        )
      ) {
        return res.status(400).json({ error: 'Datos incompletos' })
      }

      const customerName = body?.customerName
      const customerEmail = body?.customerEmail || session.user.email
      const currency = body?.currency || 'USD'
      const acquisitionChannel =
        body?.acquisitionChannel || body?.utmSource || req.query?.utm_source || undefined

      if (items.length === 1) {
        const booking = await createBooking({
          userId: session.user.id,
          experienceId: items[0].experienceId,
          date: items[0].date,
          time: items[0].time,
          peopleCount: items[0].peopleCount,
          customerName,
          customerEmail,
          currency,
          acquisitionChannel: items[0].acquisitionChannel || acquisitionChannel,
          participantNames: items[0].participantNames,
        })
        return res.status(201).json({ booking })
      }

      const bookings = await createBookings(
        items.map((item) => ({
          userId: session.user.id,
          experienceId: item.experienceId,
          date: item.date,
          time: item.time,
          peopleCount: item.peopleCount,
          customerName,
          customerEmail,
          currency,
          acquisitionChannel: item.acquisitionChannel || acquisitionChannel,
          participantNames: item.participantNames,
        }))
      )
      return res.status(201).json({ bookings })
    } catch (error) {
      console.error('Error creating booking:', error)
      return res.status(500).json({ error: 'Error al crear reservación' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
