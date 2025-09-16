'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { SupportTicketForm } from '@/components/support-ticket-form'

export function FloatingHelpButton() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()
  }, [])

  const getPageName = (path: string) => {
    switch (path) {
      case '/':
        return 'Home'
      case '/profile':
        return 'Profile'
      case '/inventory':
        return 'Inventory List'
      case '/auth/login':
        return 'Login'
      case '/auth/sign-up':
        return 'Sign Up'
      case '/protected':
        return 'Protected'
      case '/inventory/new':
        return 'New Inventory'
      case '/inventory/[id]':
        return 'Inventory Details'
        default:
        if (path.startsWith('/inventory/')) {
          return 'Inventory Details'
        }
        return path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Page'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <SupportTicketForm 
        user={user} 
        currentPage={getPageName(pathname)}
        templateTitle={undefined}
      />
    </div>
  )
}