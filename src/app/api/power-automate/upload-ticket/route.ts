import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Processing support ticket upload...')
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const accessToken = request.cookies.get('ms_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Microsoft OneDrive not connected. Please connect OneDrive first.',
        requiresConnection: true 
      }, { status: 401 })
    }

    const ticketData = await request.json()
    console.log('Ticket data received:', ticketData)

    if (ticketData.test === true) {
      console.log('Test request - OneDrive connection is working')
      return NextResponse.json({
        success: true,
        message: 'OneDrive connection test successful',
        test: true
      })
    }

    if (!ticketData.ticketId || !ticketData.Summary) {
      return NextResponse.json({
        error: 'Invalid ticket data - missing required fields'
      }, { status: 400 })
    }

    const jsonContent = JSON.stringify(ticketData, null, 2)
    const filename = `support-ticket-${ticketData.ticketId}.json`

    console.log('Uploading', filename, 'to OneDrive...')
    console.log('Content:', jsonContent)

    const uploadResult = await uploadToOneDrive(accessToken, filename, jsonContent)

    console.log('Ticket uploaded successfully:', uploadResult)

    return NextResponse.json({
      success: true,
      message: 'Support ticket uploaded to OneDrive successfully!',
      filename: filename,
      uploadPath: `/SupportTickets/${filename}`,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to upload support ticket'
    }, { status: 500 })
  }
}

async function uploadToOneDrive(accessToken: string, filename: string, content: string) {
  const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/SupportTickets/${filename}:/content`
  
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: content
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('OneDrive upload failed:', errorData)
    throw new Error(`OneDrive upload failed: ${response.statusText}`)
  }

  return await response.json()
}