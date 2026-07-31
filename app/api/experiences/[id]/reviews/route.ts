"use server"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experience_id')
    
    // Your database query logic here
    // This is a placeholder for the actual API route
    
    return NextResponse.json({
      status: 'success',
      data: {
        reviews: [
          {
            id: '66666666-6666-6666-6666-666666666666',
            experience_id: '11111111-1111-1111-1111-111111111111',
            user_id: '00000000-0000-0000-0000-000000000002',
            rating: 5,
            title: 'Absolutely Amazing!',
            content: 'The exclusive access to the Sun Pyramid was incredible. The guide was knowledgeable and the experience was premium throughout. Highly recommended!',
            pros: ['Expert guide', 'Exclusive access', 'Great value'],
            cons: [],
            would_recommend: true,
            is_verified: true,
            created_at: '2024-01-10T10:00:00Z',
            user: {
              first_name: 'Demo',
              last_name: 'Customer'
            }
          }
        ],
        average_rating: 4.8,
        total_reviews: 125
      },
      message: 'Reviews retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch reviews'
    }, { status: 500 })
  }
}