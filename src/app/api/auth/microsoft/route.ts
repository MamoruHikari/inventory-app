import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Microsoft OAuth initiated')

    const clientId = process.env.MICROSOFT_CLIENT_ID
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI

    if (!clientId || !redirectUri) {
      throw new Error('Microsoft OAuth configuration missing')
    }

    const { searchParams } = new URL(request.url)
    const returnTo = searchParams.get('returnTo') || '/profile'

    const state = crypto.randomUUID()
    
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'https://graph.microsoft.com/Files.ReadWrite User.Read')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_mode', 'query')

    console.log('🔗 Redirecting to Microsoft:', authUrl.toString())

    const response = NextResponse.redirect(authUrl.toString())
    
    response.cookies.set('ms_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    response.cookies.set('ms_return_to', returnTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    return response

  } catch (error) {
    console.error('Microsoft auth error:', error)
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(`${baseUrl}/profile?error=microsoft_auth_failed`)
  }
}