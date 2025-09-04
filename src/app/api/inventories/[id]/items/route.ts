import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { syncUserToDatabase } from '@/lib/user-sync'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inventoryId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: {
        id: true,
        isPublic: true,
        creatorId: true
      }
    })

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    const canAccess = inventory.isPublic || (user && user.id === inventory.creatorId)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const items = await prisma.item.findMany({
      where: {
        inventoryId: inventoryId
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🚀 POST /api/inventories/[id]/items called')
  
  try {
    const { id: inventoryId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('❌ No user found - returning 401')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('👤 User found:', user.id, user.email)

    await syncUserToDatabase(user)

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: {
        id: true,
        creatorId: true,
        customIdPrefix: true,
        customIdFormat: true,
        counterStart: true,
        stringField1Name: true,
        stringField1Active: true,
        stringField2Name: true,
        stringField2Active: true,
        stringField3Name: true,
        stringField3Active: true,
        numberField1Name: true,
        numberField1Active: true,
        numberField2Name: true,
        numberField2Active: true,
        numberField3Name: true,
        numberField3Active: true,
        boolField1Name: true,
        boolField1Active: true,
        boolField2Name: true,
        boolField2Active: true,
        boolField3Name: true,
        boolField3Active: true,
      }
    })

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    if (user.id !== inventory.creatorId) {
      return NextResponse.json(
        { error: 'Only inventory owner can add items' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    const lastItem = await prisma.item.findFirst({
      where: {
        inventoryId: inventoryId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        customId: true
      }
    })

    let nextCounter = inventory.counterStart || 1
    if (lastItem && lastItem.customId) {
      const counterMatch = lastItem.customId.match(/(\d+)$/)
      if (counterMatch) {
        nextCounter = parseInt(counterMatch[1]) + 1
      }
    }

    const customId = inventory.customIdFormat
      .replace('{prefix}', inventory.customIdPrefix)
      .replace('{counter}', nextCounter.toString().padStart(3, '0'))

    console.log('🔨 Generated customId:', customId)
    
    const itemData = {
      name: body.name,
      description: body.description || null,
      customId: customId,
      inventoryId: inventoryId,
      createdById: user.id,
      
      stringValue1: inventory.stringField1Active ? (body.stringField1 || null) : null,
      stringValue2: inventory.stringField2Active ? (body.stringField2 || null) : null,
      stringValue3: inventory.stringField3Active ? (body.stringField3 || null) : null,
      
      numberValue1: inventory.numberField1Active ? (body.numberField1 || null) : null,
      numberValue2: inventory.numberField2Active ? (body.numberField2 || null) : null,
      numberValue3: inventory.numberField3Active ? (body.numberField3 || null) : null,
      
      boolValue1: inventory.boolField1Active ? (body.boolField1 || false) : null,
      boolValue2: inventory.boolField2Active ? (body.boolField2 || false) : null,
      boolValue3: inventory.boolField3Active ? (body.boolField3 || false) : null,
    }

    console.log('🔨 Creating item with data:', itemData)
    
    const item = await prisma.item.create({
      data: itemData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log('✅ Item created successfully:', item.id, item.customId)
    return NextResponse.json(item)
  } catch (error) {
    console.error('❌ Error creating item:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: `Failed to create item: ${errorMessage}` },
      { status: 500 }
    )
  }
}