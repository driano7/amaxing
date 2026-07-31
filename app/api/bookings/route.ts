"use server"

import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({
        status: 'error',
        message: 'User ID is required'
      }, { status: 400 })
    }
    
    // Your database query logic here
    // This is a placeholder for the actual API route
    
    return NextResponse.json({
      status: 'success',
      data: {
        bookings: [
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            experience_id: '11111111-1111-1111-1111-111111111111',
            booking_reference: 'TRP-a1b2c3d4-2026',
            booking_date: '2024-01-15',
            start_date: '2024-01-15',
            end_date: '2024-01-16',
            guests: 2,
            status: 'confirmed',
            payment_status: 'paid',
            total_amount: 500.00,
            experience: {
              title: 'Teotihuacan Sun Pyramid Experience',
              slug: 'teotihuacan-sun-pyramid',
              image_url: 'https://images.unsplash.com/photo-1548013146-7246369b97b0'
            }
          }
        ]
      },
      message: 'User bookings retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch user bookings'
    }, { status: 500 })
  }
}