import { prisma } from '@/lib/prisma'
import { User as SupabaseUser } from '@supabase/supabase-js'

export async function syncUserToDatabase(supabaseUser: SupabaseUser) {
  try {
    console.log('Checking if user exists in database:', supabaseUser.id)
    
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    })

    if (existingUser) {
      console.log('User exists, updating info')
      return await prisma.user.update({
        where: { id: supabaseUser.id },
        data: {
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || null,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
        }
      })
    } else {
      console.log('Creating new user in database')
      return await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || null,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          role: 'user'
        }
      })
    }
  } catch (error) {
    console.error('❌ Error syncing user to database:', error)
    throw error
  }
}