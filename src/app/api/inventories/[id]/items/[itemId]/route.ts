import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { syncUserToDatabase } from '@/lib/user-sync'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: inventoryId, itemId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        inventory: {
          select: {
            id: true,
            isPublic: true,
            creatorId: true
          }
        }
      }
    })

    if (!item || item.inventoryId !== inventoryId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const canAccess = item.inventory.isPublic || (user && user.id === item.inventory.creatorId)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: inventoryId, itemId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await syncUserToDatabase(user)

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        inventory: {
          select: {
            id: true,
            creatorId: true
          }
        }
      }
    })

    if (!item || item.inventoryId !== inventoryId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (user.id !== item.inventory.creatorId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        name: body.name,
        description: body.description,
        stringValue1: body.stringValue1,
        stringValue2: body.stringValue2,
        stringValue3: body.stringValue3,
        numberValue1: body.numberValue1,
        numberValue2: body.numberValue2,
        numberValue3: body.numberValue3,
        boolValue1: body.boolValue1,
        boolValue2: body.boolValue2,
        boolValue3: body.boolValue3,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: inventoryId, itemId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        inventory: {
          select: {
            id: true,
            creatorId: true
          }
        }
      }
    })

    if (!item || item.inventoryId !== inventoryId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (user.id !== item.inventory.creatorId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    await prisma.item.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}