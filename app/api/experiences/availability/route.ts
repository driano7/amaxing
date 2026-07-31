"use server"

import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experience_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    // Your availability check logic here
    // This is a placeholder for the actual API route
    
    return NextResponse.json({
      status: 'success',
      data: {
        experienceId: experienceId,
        availableSlots: [
          {
            date: '2024-01-15',
            available: true,
            price: 250
          },
          {
            date: '2024-01-16',
            available: false,
            price: 250
          },
          {
            date: '2024-01-17',
            available: true,
            price: 250
          }
        ],
        minBookingDays: 1,
        maxBookingDays: 30
      },
      message: 'Availability checked successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check availability'
    }, { status: 500 })
  }
}