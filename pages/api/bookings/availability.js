import { getBookingsByExperienceAndDate } from '@/lib/booking/server'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { date, experienceId } = req.query

    if (!date || !experienceId) {
      return res.status(400).json({ success: false, message: 'Fecha y experiencia requeridas' })
    }

    const bookings = await getBookingsByExperienceAndDate(experienceId, date)

    const bookedSlots = bookings
      .filter((booking) => booking.status !== 'cancelled')
      .map((booking) => booking.time)

    return res.status(200).json({ success: true, slots: bookedSlots })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return res.status(500).json({ success: false, message: 'Error al obtener disponibilidad' })
  }
}
