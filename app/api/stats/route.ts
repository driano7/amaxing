"use server"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Your statistics data logic here
    // This is a placeholder for the actual API route
    
    // Generate mock statistics for different categories
    const statistics = {
      experiences: {
        total: 50,
        active: 48,
        featured: 12,
        recent: 8,
        avg_rating: 4.8,
        total_bookings: 1250
      },
      bookings: {
        total: 1250,
        pending: 125,
        confirmed: 800,
        completed: 750,
        cancelled: 75,
        total_revenue: 425000
      },
      users: {
        total: 2500,
        active: 1800,
        new_this_month: 250,
        verified_email: 2000,
        admin_users: 5,
        guide_users: 12
      },
      payments: {
        total_processed: 425000,
        success_rate: 98.5,
        average_amount: 340
      }
    }
    
    return NextResponse.json({
      status: 'success',
      data: statistics,
      message: 'Statistics retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}