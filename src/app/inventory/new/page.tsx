'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InventoryForm } from '@/components/forms/inventory-form'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { BackButton } from '@/components/back-button'

export default function NewInventoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
      
      if (!user) {
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/inventories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const inventory = await response.json()
        router.push(`/inventory/${inventory.id}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create inventory')
      }
    } catch (error) {
      console.error('Error creating inventory:', error)
      alert(`Failed to create inventory: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/inventory')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackHref="/inventory" />
          <h1 className="text-3xl font-bold">Create New Inventory</h1>
        </div>

        <InventoryForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}