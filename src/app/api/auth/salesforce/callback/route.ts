import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`

    if (error) {
      console.error('Salesforce OAuth error:', error, errorDescription)
      return NextResponse.redirect(`${baseUrl}/profile?error=salesforce_auth_failed&details=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/profile?error=no_auth_code`)
    }

    const storedState = request.cookies.get('sf_oauth_state')?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/profile?error=invalid_state`)
    }

    const tokenResponse = await axios.post(
      `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL!,
        code: code
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const { access_token, refresh_token, instance_url } = tokenResponse.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=session_expired`)
    }

    const response = NextResponse.redirect(`${baseUrl}/profile?success=salesforce_connected`)
    
    response.cookies.set('sf_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    })

    if (refresh_token) {
      response.cookies.set('sf_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 7 
      })
    }

    response.cookies.set('sf_instance_url', instance_url, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 
    })

    response.cookies.delete('sf_oauth_state')

    console.log('Salesforce OAuth successful for user:', user.email)
    return response

  } catch (error: any) {
    console.error('Salesforce callback error:', error.response?.data || error.message)
    
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(`${baseUrl}/profile?error=callback_failed`)
  }
}