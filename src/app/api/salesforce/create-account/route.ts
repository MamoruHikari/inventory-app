import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { salesforceClient } from '@/lib/salesforce'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Salesforce integration...')
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('User not authenticated')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let accessToken = request.cookies.get('salesforce_access_token')?.value
    const refreshToken = request.cookies.get('salesforce_refresh_token')?.value
    const instanceUrl = request.cookies.get('salesforce_instance_url')?.value

    if (!accessToken || !instanceUrl) {
      console.log('No Salesforce connection found')
      return NextResponse.json({ 
        error: 'No Salesforce connection found. Please reconnect to Salesforce first.',
        reconnectRequired: true
      }, { status: 401 })
    }

    console.log('Salesforce connection found')

    if (!accessToken && refreshToken) {
      console.log('Refreshing Salesforce token...')
      
      try {
        const tokenResponse = await fetch(`${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.SALESFORCE_CLIENT_ID!,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
          }),
        })

        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json()
          accessToken = tokens.access_token
          console.log('Token refreshed successfully')
        } else {
          console.log('Token refresh failed')
          return NextResponse.json({
            error: 'Salesforce session expired. Please reconnect to Salesforce.',
            reconnectRequired: true
          }, { status: 401 })
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError)
        return NextResponse.json({
          error: 'Salesforce session expired. Please reconnect to Salesforce.',
          reconnectRequired: true
        }, { status: 401 })
      }
    }

    const body = await request.json()
    console.log('Received form data:', JSON.stringify(body, null, 2))

    const { 
      companyName, 
      industry, 
      phone, 
      website,
      firstName,
      lastName,
      contactEmail,
      contactPhone,
      title,
      department 
    } = body

    if (!companyName || !firstName || !lastName || !contactEmail) {
      console.log('Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: Company Name, First Name, Last Name, and Contact Email are required' 
      }, { status: 400 })
    }

    console.log('Creating Salesforce Account...')

    const accountData = {
      Name: companyName,
      Industry: industry || undefined,
      Phone: phone || undefined,
      Website: website || undefined
    }

    const accountId = await salesforceClient.createAccount(accountData)
    console.log('Account created with ID:', accountId)

    console.log('Creating Salesforce Contact...')

    const contactData = {
      FirstName: firstName,
      LastName: lastName,
      Email: contactEmail,
      Phone: contactPhone || undefined,
      AccountId: accountId,
      Title: title || undefined,
      Department: department || undefined
    }

    const contactId = await salesforceClient.createContact(contactData)
    console.log('Contact created with ID:', contactId)

    console.log('Salesforce integration completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Successfully created Account and Contact in Salesforce',
      data: {
        accountId,
        contactId
      }
    })

  } catch (error: any) {
    console.error('Salesforce integration error:', error.message)
    
    if (error.message.includes('session expired') || error.message.includes('INVALID_SESSION_ID')) {
      return NextResponse.json({
        error: 'Salesforce session expired. Please reconnect to Salesforce and try again.',
        reconnectRequired: true
      }, { status: 401 })
    }

    return NextResponse.json({
      error: error.message || 'Failed to create Salesforce records. Please try again.'
    }, { status: 500 })
  }
}
