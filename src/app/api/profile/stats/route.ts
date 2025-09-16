import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const [
      totalInventories,
      publicInventories,
      privateInventories,
      totalItems,
      totalComments
    ] = await Promise.all([
      prisma.inventory.count({ where: { creatorId: user.id } }),
      prisma.inventory.count({ where: { creatorId: user.id, isPublic: true } }),
      prisma.inventory.count({ where: { creatorId: user.id, isPublic: false } }),
      prisma.item.count({
        where: { inventory: { creatorId: user.id } }
      }),
      prisma.comment.count({ where: { userId: user.id } })
    ])

    const stats = {
      totalInventories,
      publicInventories,
      privateInventories,
      totalItems,
      totalComments
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}