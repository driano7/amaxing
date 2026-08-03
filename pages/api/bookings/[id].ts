import { getBookingById, updateBooking, cancelBooking } from '@/lib/booking/server'
import { getSession } from '@/lib/auth/session'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de reservación requerido' })
  }

  try {
    const booking = await getBookingById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Reservación no encontrada' })
    }

    if (booking.userId !== session.user.id) {
      return res.status(403).json({ error: 'No autorizado para ver esta reservación' })
    }

    if (req.method === 'GET') {
      return res.status(200).json({ booking })
    }

    if (req.method === 'PATCH') {
      const updates = req.body
      const updated = await updateBooking(id, updates)
      return res.status(200).json({ booking: updated })
    }

    if (req.method === 'DELETE') {
      const cancelled = await cancelBooking(id)
      return res.status(200).json({ booking: cancelled })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('Error with booking:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
