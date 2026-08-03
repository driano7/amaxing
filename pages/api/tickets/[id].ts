import { getBookingById } from '@/lib/booking/server'
import { getSession } from '@/lib/auth/session'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de ticket requerido' })
  }

  try {
    const booking = await getBookingById(id)

    if (!booking) {
      return res.status(404).json({ error: 'Reservación no encontrada' })
    }

    if (booking.userId !== session.user.id) {
      return res.status(403).json({ error: 'No autorizado para ver este ticket' })
    }

    if (req.method === 'GET') {
      // Return ticket data including QR code
      return res.status(200).json({
        ticket: {
          id: booking.id,
          code: booking.ticketCode,
          qrCodeData: booking.qrCodeData,
          experienceTitle: booking.experienceTitle,
          experienceImage: booking.experienceImage,
          date: booking.date,
          time: booking.time,
          peopleCount: booking.peopleCount,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
      })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('Error with ticket:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
