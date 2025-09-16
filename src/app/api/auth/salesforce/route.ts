import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
      return NextResponse.redirect(`${baseUrl}/auth/login?error=authentication_required`)
    }

    const state = crypto.randomUUID()
    
    const authUrl = new URL(`${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', process.env.SALESFORCE_CLIENT_ID!)
    authUrl.searchParams.set('redirect_uri', process.env.SALESFORCE_CALLBACK_URL!)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', 'api refresh_token')

    console.log('🔗 Redirecting to Salesforce OAuth:', authUrl.toString())

    const response = NextResponse.redirect(authUrl.toString())

    response.cookies.set('sf_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    return response

  } catch (error) {
    console.error('Salesforce auth initialization error:', error)
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(`${baseUrl}/profile?error=auth_init_failed`)
  }
}