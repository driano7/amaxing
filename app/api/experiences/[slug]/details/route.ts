"use server"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experience_id')
    const date = searchParams.get('date')
    
    // Your database query logic here
    // This is a placeholder for the actual API route
    
    return NextResponse.json({
      status: 'success',
      data: {
        experience: {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Teotihuacan Sun Pyramid Experience',
          description: 'Discover the ancient mystery of the Sun Pyramid...',
          price_usd: 250,
          max_guests: 8,
          duration_hours: 6,
          difficulty_level: 'challenging',
          minimum_age: 18,
          rating_avg: 4.8,
          rating_count: 125,
          total_bookings: 450,
          image_url: 'https://images.unsplash.com/photo-1548013146-7246369b97b0',
          gallery_images: [
            'https://images.unsplash.com/photo-1548013146-7246369b97b0',
            'https://images.unsplash.com/photo-1551632836-0f3a722d2dbb',
            'https://images.unsplash.com/photo-1508570052400-4715ca23347c'
          ],
          highlights: ['[]'],
          location: 'Teotihuacan, Mexico City',
          latitude: 19.6842,
          longitude: -99.0989,
          cancellation_policy: 'flexible'
        },
        availability: [
          {
            date: '2024-02-01',
            available: true,
            price: 250,
            spots_left: 8
          },
          {
            date: '2024-02-02',
            available: true,
            price: 250,
            spots_left: 5
          },
          {
            date: '2024-02-03',
            available: false,
            price: 250,
            spots_left: 0
          }
        ]
      },
      message: 'Experience details retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch experience details'
    }, { status: 500 })
  }
}