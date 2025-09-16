import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Disconnecting Microsoft OneDrive...')
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'OneDrive disconnected successfully' 
    })
    
    response.cookies.delete('ms_access_token')
    response.cookies.delete('ms_refresh_token')
    
    return response
    
  } catch (error: any) {
    console.error('Disconnect error:', error)
    return NextResponse.json({
      error: 'Failed to disconnect OneDrive'
    }, { status: 500 })
  }
}