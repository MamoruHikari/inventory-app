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

    console.log('User authenticated:', user.email)

    const accessToken = request.cookies.get('sf_access_token')?.value
    const instanceUrl = request.cookies.get('sf_instance_url')?.value

    if (!accessToken || !instanceUrl) {
      console.log('No Salesforce connection found')
      return NextResponse.json({ 
        error: 'No Salesforce connection found. Please connect to Salesforce first.' 
      }, { status: 401 })
    }

    console.log('Salesforce connection verified')
    console.log('Access token found:', accessToken.substring(0, 20) + '...')
    console.log('Instance URL:', instanceUrl)

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
    
    if (error.message.includes('session expired') || error.message.includes('Please reconnect')) {
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