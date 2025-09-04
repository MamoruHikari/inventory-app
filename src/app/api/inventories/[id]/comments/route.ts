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

    const comments = await prisma.comment.findMany({
      where: { inventoryId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inventoryId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await syncUserToDatabase(user)

    const body = await request.json()
    
    if (!body.text || !body.text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      )
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { isPublic: true, creatorId: true }
    })

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    const canAccess = inventory.isPublic || user.id === inventory.creatorId
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        text: body.text.trim(),
        inventoryId,
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}