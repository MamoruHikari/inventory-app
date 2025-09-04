'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Package, MessageSquare, Settings, User, Calendar } from 'lucide-react'
import { BackButton } from '@/components/back-button'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddItemForm } from '@/components/forms/add-item-form'
import Link from 'next/link'
import { InventorySettingsForm } from '@/components/forms/inventory-settings-form'
import { CommentsSection } from '@/components/comments-section'

interface Inventory {
  id: string
  title: string
  description: string
  category: string
  isPublic: boolean
  creatorId: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  customIdPrefix: string
  customIdFormat: string
  stringField1Name: string | null
  stringField1Active: boolean
  stringField2Name: string | null
  stringField2Active: boolean
  stringField3Name: string | null
  stringField3Active: boolean
  numberField1Name: string | null
  numberField1Active: boolean
  numberField2Name: string | null
  numberField2Active: boolean
  numberField3Name: string | null
  numberField3Active: boolean
  boolField1Name: string | null
  boolField1Active: boolean
  boolField2Name: string | null
  boolField2Active: boolean
  boolField3Name: string | null
  boolField3Active: boolean
}

interface Item {
  id: string
  name: string
  description: string | null
  customId: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  stringValue1: string | null
  stringValue2: string | null
  stringValue3: string | null
  numberValue1: number | null
  numberValue2: number | null
  numberValue3: number | null
  boolValue1: boolean | null
  boolValue2: boolean | null
  boolValue3: boolean | null
}

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inventoryId = params.id as string
  
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isCreatingItem, setIsCreatingItemOpen] = useState(false)

  useEffect(() => {
    fetchInventoryAndItems()
    fetchUser()
  }, [inventoryId])

  const fetchUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchInventoryAndItems = async () => {
    try {
      setLoading(true)
      
      const inventoryResponse = await fetch(`/api/inventories/${inventoryId}`)
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setInventory(inventoryData)
      }

      const itemsResponse = await fetch(`/api/inventories/${inventoryId}/items`)
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemCreated = (newItem: Item) => {
    setItems(prev => [newItem, ...prev])
    setIsAddItemOpen(false)
  }

  const handleInventoryUpdate = (updatedInventory: Inventory) => {
    setInventory(updatedInventory)
  }

  const handleInventoryDelete = () => {
    router.push('/inventory')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Inventory not found</div>
        </div>
      </div>
    )
  }

  const canEdit = user && user.id === inventory.creatorId

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallbackHref="/inventory" className="mb-6" />
      
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{inventory.title}</h1>
            <Badge variant={inventory.isPublic ? "default" : "secondary"}>
              {inventory.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          
          {inventory.description && (
            <p className="text-muted-foreground text-lg mb-4">{inventory.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>
                by {inventory.createdBy.email}
                {user && user.id === inventory.creatorId && (
                  <span className="text-blue-600 font-medium"> (You)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(inventory.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Package size={14} />
              {inventory.category}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package size={16} />
            Items ({items.length})
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Discussion
          </TabsTrigger>
          {canEdit && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Items</h2>
            {canEdit && (
              <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <AddItemForm
                    inventory={inventory}
                    onSuccess={handleItemCreated}
                    onCancel={() => setIsAddItemOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No items yet</p>
                  {canEdit && (
                    <p className="text-sm mt-2">Click "Add Item" to create your first item</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Link key={item.id} href={`/inventory/${inventoryId}/item/${item.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <Badge variant="outline">{item.customId}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-muted-foreground mb-4">{item.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {inventory.stringField1Active && item.stringValue1 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.stringField1Name}
                            </dt>
                            <dd className="text-sm">{item.stringValue1}</dd>
                          </div>
                        )}
                        {inventory.stringField2Active && item.stringValue2 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.stringField2Name}
                            </dt>
                            <dd className="text-sm">{item.stringValue2}</dd>
                          </div>
                        )}
                        {inventory.stringField3Active && item.stringValue3 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.stringField3Name}
                            </dt>
                            <dd className="text-sm">{item.stringValue3}</dd>
                          </div>
                        )}
                        
                        {inventory.numberField1Active && item.numberValue1 !== null && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.numberField1Name}
                            </dt>
                            <dd className="text-sm">{item.numberValue1}</dd>
                          </div>
                        )}
                        {inventory.numberField2Active && item.numberValue2 !== null && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.numberField2Name}
                            </dt>
                            <dd className="text-sm">{item.numberValue2}</dd>
                          </div>
                        )}
                        {inventory.numberField3Active && item.numberValue3 !== null && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.numberField3Name}
                            </dt>
                            <dd className="text-sm">{item.numberValue3}</dd>
                          </div>
                        )}
                        
                        {inventory.boolField1Active && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.boolField1Name}
                            </dt>
                            <dd className="text-sm">{item.boolValue1 ? 'Yes' : 'No'}</dd>
                          </div>
                        )}
                        {inventory.boolField2Active && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.boolField2Name}
                            </dt>
                            <dd className="text-sm">{item.boolValue2 ? 'Yes' : 'No'}</dd>
                          </div>
                        )}
                        {inventory.boolField3Active && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {inventory.boolField3Name}
                            </dt>
                            <dd className="text-sm">{item.boolValue3 ? 'Yes' : 'No'}</dd>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Created by {item.createdBy.name} on {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="space-y-6">
          <CommentsSection inventoryId={inventoryId} />
        </TabsContent>

        {canEdit && (
          <TabsContent value="settings" className="space-y-6">
            {user && user.id === inventory.creatorId ? (
              <InventorySettingsForm
                inventory={inventory}
                onUpdate={handleInventoryUpdate}
                onDelete={handleInventoryDelete}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Only the inventory owner can access settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}