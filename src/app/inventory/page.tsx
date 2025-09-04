'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Globe, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { BackButton } from '@/components/back-button'

interface Inventory {
  id: string
  title: string
  description?: string
  isPublic: boolean
  creatorId: string
  category?: { name: string }
  creator?: { name?: string; email: string }
  _count: { items: number; comments: number }
  createdAt: string
  updatedAt: string
}

export default function InventoryListPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    async function loadInventories() {
      try {
        const response = await fetch('/api/inventories')
        if (response.ok) {
          const data = await response.json()
          setInventories(data)
        }
      } catch (error) {
        console.error('Failed to load inventories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInventories()
  }, [])

  const getVisibilityInfo = (inventory: Inventory) => {
    const isOwner = user && user.id === inventory.creatorId

    if (inventory.isPublic) {
      return {
        icon: Globe,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Public',
        description: 'Anyone can view this inventory'
      }
    } else {
      return {
        icon: Lock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        label: 'Private',
        description: isOwner ? 'Only you can view this inventory' : 'Private inventory'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading inventories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/" />
            <h1 className="text-3xl font-bold">Inventories</h1>
          </div>
          
          {user ? (
            <Link href="/inventory/new?from=%2Finventory">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Inventory
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login?redirectTo=%2Finventory%2Fnew&from=%2Finventory">
              <Button>
                Sign in to Create
              </Button>
            </Link>
          )}
        </div>

        {inventories.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No inventories found</h3>
                <p className="text-muted-foreground mb-6">
                  {user 
                    ? "Get started by creating your first inventory using the button above!" 
                    : "Sign in to create and manage your inventories!"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventories.map((inventory) => {
              const visibilityInfo = getVisibilityInfo(inventory)
              const VisibilityIcon = visibilityInfo.icon
              const isOwner = user && user.id === inventory.creatorId

              return (
                <Card key={inventory.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1 flex-1 mr-2">
                        {inventory.title}
                      </CardTitle>
                      
                      <div 
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${visibilityInfo.bgColor} ${visibilityInfo.color}`}
                        title={visibilityInfo.description}
                      >
                        <VisibilityIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{visibilityInfo.label}</span>
                      </div>
                    </div>
                    
                    {inventory.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full w-fit mt-2">
                        {inventory.category.name}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    {inventory.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {inventory.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>{inventory._count.items} items</span>
                      <span>{inventory._count.comments} comments</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                          by {inventory.creator?.name || inventory.creator?.email}
                        </p>
                        {isOwner && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <Link href={`/inventory/${inventory.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}