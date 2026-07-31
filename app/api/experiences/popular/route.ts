"use server"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experience_id')
    const date = searchParams.get('date')
    
    // Your popular experiences logic here
    // This is a placeholder for the actual API route
    
    return NextResponse.json({
      status: 'success',
      data: {
        experiences: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Teotihuacan Sun Pyramid Experience',
            slug: 'teotihuacan-sun-pyramid',
            price_usd: 250,
            max_guests: 8,
            duration_hours: 6,
            difficulty_level: 'challenging',
            rating_avg: 4.8,
            rating_count: 125,
            total_bookings: 450,
            image_url: 'https://images.unsplash.com/photo-1548013146-7246369b97b0',
            highlights: ['[]'],
            location: 'Teotihuacan, Mexico City'
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            title: 'Chichen Itza Venus Temple Tour',
            slug: 'chichen-itza-venus-temple',
            price_usd: 320,
            max_guests: 6,
            duration_hours: 8,
            difficulty_level: 'moderate',
            rating_avg: 4.9,
            rating_count: 89,
            total_bookings: 285,
            image_url: 'https://images.unsplash.com/photo-1551632836-0f3a722d2dbb',
            highlights: ['[]'],
            location: 'Chichen Itza, Yucatán'
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            title: 'Valley of the Volcanoes Private Expedition',
            slug: 'valley-of-the-volcanoes',
            price_usd: 450,
            max_guests: 4,
            duration_hours: 12,
            difficulty_level: 'challenging',
            rating_avg: 4.7,
            rating_count: 67,
            total_bookings: 201,
            image_url: 'https://images.unsplash.com/photo-1508570052400-4715ca23347c',
            highlights: ['[]'],
            location: 'Sierra de Puebla'
          }
        ].filter(exp => !experienceId || exp.id === experienceId)
      },
      message: 'Popular experiences retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch popular experiences'
    }, { status: 500 })
  }
}