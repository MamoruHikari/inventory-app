import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('🔍 Callback received - Code exists:', !!code, 'Error:', error)

    if (error) {
      console.error('Salesforce OAuth error:', error)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=salesforce_error&details=${encodeURIComponent(error)}`)
    }

    if (!code) {
      console.error('No authorization code received')
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=salesforce_error&details=no_code`)
    }

    console.log('Authorization code received:', code.substring(0, 20) + '...')
    
    console.log('Environment check:')
    console.log('- LOGIN_URL:', process.env.SALESFORCE_LOGIN_URL)
    console.log('- CLIENT_ID exists:', !!process.env.SALESFORCE_CLIENT_ID)
    console.log('- CALLBACK_URL:', process.env.SALESFORCE_CALLBACK_URL)

    const tokenResponse = await fetch(`${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorText)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
      return NextResponse.redirect(`${baseUrl}/profile?error=salesforce_error&details=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json()
    console.log('Salesforce tokens received')
    console.log('Token info:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      instanceUrl: tokens.instance_url
    })

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'}/profile?success=salesforce_connected`
    )

    const isProduction = request.url.includes('https://')
    
    console.log('Setting cookies with secure:', isProduction)

    response.cookies.set('salesforce_access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 2
    })

    response.cookies.set('salesforce_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    response.cookies.set('salesforce_instance_url', tokens.instance_url, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 2
    })

    console.log('Cookies set successfully')

    return response
  } catch (error) {
    console.error('Salesforce callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inventory-app-7p7n.onrender.com'
    return NextResponse.redirect(`${baseUrl}/profile?error=salesforce_error&details=callback_error`)
  }
}
