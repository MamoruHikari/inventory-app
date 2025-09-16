import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Microsoft OAuth error:', error)
      throw new Error(`Microsoft OAuth error: ${error}`)
    }

    if (!code) {
      throw new Error('No authorization code received')
    }

    const savedState = request.cookies.get('ms_oauth_state')?.value
    if (state !== savedState) {
      throw new Error('Invalid state parameter')
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
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Files.ReadWrite'
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed:', tokenData)
      throw new Error(`Token exchange failed: ${tokenData.error_description}`)
    }

    console.log('Microsoft tokens received')

    const returnTo = request.cookies.get('ms_return_to')?.value || '/profile'
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    
    const response = NextResponse.redirect(`${baseUrl}${returnTo}?microsoft=connected`)

    response.cookies.set('ms_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in - 60
    })

    if (tokenData.refresh_token) {
      response.cookies.set('ms_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60
      })
    }

    response.cookies.delete('ms_oauth_state')
    response.cookies.delete('ms_return_to')

    return response

  } catch (error: any) {
    console.error('Microsoft callback error:', error)
    const returnTo = request.cookies.get('ms_return_to')?.value || '/profile'
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(`${baseUrl}${returnTo}?error=microsoft_callback_failed&message=${encodeURIComponent(error.message)}`)
  }
}