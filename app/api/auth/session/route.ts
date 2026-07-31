"use server"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get session token from cookies
    const cookies = request.headers.get('cookie')
    if (!cookies) {
      return NextResponse.json({
        status: 'error',
        message: 'No session found'
      }, { status: 401 })
    }
    
    // Parse cookies to get session token
    const cookieArray = cookies.split(';')
    let sessionToken = ''
    for (const cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'session_token') {
        sessionToken = value
        break
      }
    }
    
    if (!sessionToken) {
      return NextResponse.json({
        status: 'error',
        message: 'No session found'
      }, { status: 401 })
    }
    
    // Verify session token (placeholder)
    // In a real implementation, you would verify against your database
    
    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'demo@amaxing.com',
          first_name: 'Demo',
          last_name: 'Customer',
          role: 'customer',
          is_email_verified: true
        }
      },
      message: 'Session verified successfully'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Session verification failed'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Clear session token from cookies
    const response = NextResponse.json({
      status: 'success',
      message: 'Logout successful'
    }, { status: 200 })
    
    // Set cookie expiration
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Logout failed'
    }, { status: 500 })
  }
}