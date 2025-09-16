import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('Microsoft callback - Code exists:', !!code, 'Error:', error)

    if (error) {
      console.error('Microsoft OAuth error:', error)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=microsoft_error&details=${encodeURIComponent(error)}`)
    }

    if (!code) {
      console.error('No authorization code received')
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=microsoft_error&details=no_code`)
    }

    console.log('Authorization code received:', code.substring(0, 20) + '...')

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Files.ReadWrite User.Read',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Microsoft token exchange failed:', tokenResponse.status, errorText)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=microsoft_error&details=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json()
    console.log('Microsoft tokens received')

    const returnTo = searchParams.get('returnTo') || '/profile'
    const response = NextResponse.redirect(  
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'}${returnTo}?microsoft=connected`
    )

    const isProduction = request.url.includes('https://')
    
    console.log('Setting Microsoft cookies with secure:', isProduction)

    response.cookies.set('ms_access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60
    })

    if (tokens.refresh_token) {
      response.cookies.set('ms_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }

    console.log('Microsoft cookies set successfully')

    return response
  } catch (error) {
    console.error('Microsoft callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
    return NextResponse.redirect(`${baseUrl}/profile?error=microsoft_error&details=callback_error`)
  }
}
