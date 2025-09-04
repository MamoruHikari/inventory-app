import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { syncUserToDatabase } from '@/lib/user-sync'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const inventory = await prisma.inventory.findUnique({
      where: {
        id: id
      },
      include: {
        creator: { 
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        items: {
          select: {
            id: true,
            customId: true,
            name: true,
            createdAt: true
          }
        },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: { 
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true,
            comments: true
          }
        }
      }
    })

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    const canAccess = inventory.isPublic || 
                     (user && user.id === inventory.creatorId)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied - This inventory is private' },
        { status: 403 }
      )
    }

    const response = {
      ...inventory,
      createdBy: inventory.creator,
      category: inventory.category?.name || 'Uncategorized'
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error fetching inventory:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    })
    
    return NextResponse.json(
      { error: `Failed to fetch inventory: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await syncUserToDatabase(user)

    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
      select: { creatorId: true }
    })

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    if (existingInventory.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    let categoryId = null
    if (body.category && body.category !== 'Uncategorized') {
      const category = await prisma.category.upsert({
        where: { name: body.category },
        update: {},
        create: { name: body.category }
      })
      categoryId = category.id
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        isPublic: body.isPublic,
        categoryId,
        customIdPrefix: body.customIdPrefix,
        customIdFormat: body.customIdFormat,
        
        stringField1Name: body.stringField1Name || null,
        stringField1Active: body.stringField1Active,
        stringField2Name: body.stringField2Name || null,
        stringField2Active: body.stringField2Active,
        stringField3Name: body.stringField3Name || null,
        stringField3Active: body.stringField3Active,
        
        numberField1Name: body.numberField1Name || null,
        numberField1Active: body.numberField1Active,
        numberField2Name: body.numberField2Name || null,
        numberField2Active: body.numberField2Active,
        numberField3Name: body.numberField3Name || null,
        numberField3Active: body.numberField3Active,
        
        boolField1Name: body.boolField1Name || null,
        boolField1Active: body.boolField1Active,
        boolField2Name: body.boolField2Name || null,
        boolField2Active: body.boolField2Active,
        boolField3Name: body.boolField3Name || null,
        boolField3Active: body.boolField3Active,
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const response = {
      ...updatedInventory,
      createdBy: updatedInventory.creator,
      category: updatedInventory.category?.name || 'Uncategorized'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
      select: { creatorId: true }
    })

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    if (existingInventory.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    await prisma.inventory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory' },
      { status: 500 }
    )
  }
}