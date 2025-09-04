import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { syncUserToDatabase } from '@/lib/user-sync'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const whereClause = user 
      ? {
          OR: [
            { isPublic: true },
            { creatorId: user.id }
          ]
        }
      : { isPublic: true }
    
    const inventories = await prisma.inventory.findMany({
      where: whereClause,
      include: {
        creator: true,
        category: true,
        _count: {
          select: {
            items: true,
            comments: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    return NextResponse.json(inventories)
  } catch (error: unknown) {
    console.error('Error fetching inventories:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to fetch inventories: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/inventories called')
  
  try {
    const supabase = await createClient()
    console.log('✅ Supabase client created')
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 User check:', user ? `User ID: ${user.id}` : 'No user')
    
    if (!user) {
      console.log('❌ No user found - returning 401')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Syncing user to database...')
    await syncUserToDatabase(user)
    console.log('✅ User synced successfully')
    
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    if (!body.title) {
      console.log('❌ Missing title')
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!body.customIdPrefix) {
      console.log('❌ Missing customIdPrefix')
      return NextResponse.json(
        { error: 'Custom ID prefix is required' },
        { status: 400 }
      )
    }

    if (!body.customIdFormat) {
      console.log('❌ Missing customIdFormat')
      return NextResponse.json(
        { error: 'Custom ID format is required' },
        { status: 400 }
      )
    }
    
    console.log('🔨 Creating inventory with data:', {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
      creatorId: user.id,
      customIdPrefix: body.customIdPrefix,
      customIdFormat: body.customIdFormat,
    })
    
    const inventory = await prisma.inventory.create({
      data: {
        title: body.title,
        description: body.description || null,
        categoryId: body.categoryId || null,
        isPublic: body.isPublic ?? true,
        customIdPrefix: body.customIdPrefix,
        customIdFormat: body.customIdFormat,
        counterStart: 1,
        
        stringField1Name: body.stringField1Name || null,
        stringField1Active: body.stringField1Active || false,
        stringField1Order: 1,
        stringField2Name: body.stringField2Name || null,
        stringField2Active: body.stringField2Active || false,
        stringField2Order: 2,
        stringField3Name: body.stringField3Name || null,
        stringField3Active: body.stringField3Active || false,
        stringField3Order: 3,
        
        numberField1Name: body.numberField1Name || null,
        numberField1Active: body.numberField1Active || false,
        numberField1Order: 4,
        numberField2Name: body.numberField2Name || null,
        numberField2Active: body.numberField2Active || false,
        numberField2Order: 5,
        numberField3Name: body.numberField3Name || null,
        numberField3Active: body.numberField3Active || false,
        numberField3Order: 6,
        
        boolField1Name: body.boolField1Name || null,
        boolField1Active: body.boolField1Active || false,
        boolField1Order: 7,
        boolField2Name: body.boolField2Name || null,
        boolField2Active: body.boolField2Active || false,
        boolField2Order: 8,
        boolField3Name: body.boolField3Name || null,
        boolField3Active: body.boolField3Active || false,
        boolField3Order: 9,
        
        creatorId: user.id,
        tags: body.tags || []
      },
      include: {
        creator: true,
        category: true
      }
    })
    
    console.log('✅ Inventory created successfully:', inventory.id)
    return NextResponse.json(inventory)
  } catch (error: unknown) {
    console.error('❌ Error creating inventory:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    })
    
    return NextResponse.json(
      { error: `Failed to create inventory: ${errorMessage}` },
      { status: 500 }
    )
  }
}
