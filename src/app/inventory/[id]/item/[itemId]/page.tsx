'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Hash,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import { BackButton } from '@/components/back-button'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Item {
  id: string
  name: string
  description: string | null
  customId: string
  inventoryId: string
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

interface Inventory {
  id: string
  title: string
  creatorId: string
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

interface EditFormData {
  name: string
  description: string
  stringValue1: string
  stringValue2: string
  stringValue3: string
  numberValue1: string
  numberValue2: string
  numberValue3: string
  boolValue1: boolean
  boolValue2: boolean
  boolValue3: boolean
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inventoryId = params.id as string
  const itemId = params.itemId as string
  
  const [item, setItem] = useState<Item | null>(null)
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    description: '',
    stringValue1: '',
    stringValue2: '',
    stringValue3: '',
    numberValue1: '',
    numberValue2: '',
    numberValue3: '',
    boolValue1: false,
    boolValue2: false,
    boolValue3: false,
  })

  useEffect(() => {
    fetchData()
    fetchUser()
  }, [inventoryId, itemId])

  const fetchUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const itemResponse = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`)
      if (itemResponse.ok) {
        const itemData = await itemResponse.json()
        setItem(itemData)
        setEditFormData({
          name: itemData.name,
          description: itemData.description || '',
          stringValue1: itemData.stringValue1 || '',
          stringValue2: itemData.stringValue2 || '',
          stringValue3: itemData.stringValue3 || '',
          numberValue1: itemData.numberValue1?.toString() || '',
          numberValue2: itemData.numberValue2?.toString() || '',
          numberValue3: itemData.numberValue3?.toString() || '',
          boolValue1: itemData.boolValue1 || false,
          boolValue2: itemData.boolValue2 || false,
          boolValue3: itemData.boolValue3 || false,
        })
      }

      const inventoryResponse = await fetch(`/api/inventories/${inventoryId}`)
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setInventory(inventoryData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const updateData = {
        name: editFormData.name,
        description: editFormData.description || null,
        stringValue1: editFormData.stringValue1 || null,
        stringValue2: editFormData.stringValue2 || null,
        stringValue3: editFormData.stringValue3 || null,
        numberValue1: editFormData.numberValue1 ? parseFloat(editFormData.numberValue1) : null,
        numberValue2: editFormData.numberValue2 ? parseFloat(editFormData.numberValue2) : null,
        numberValue3: editFormData.numberValue3 ? parseFloat(editFormData.numberValue3) : null,
        boolValue1: editFormData.boolValue1,
        boolValue2: editFormData.boolValue2,
        boolValue3: editFormData.boolValue3,
      }

      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItem(updatedItem)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        router.push(`/inventory/${inventoryId}`)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
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

  if (!item || !inventory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackHref={`/inventory/${inventoryId}`} className="mb-6" />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Item not found</div>
        </div>
      </div>
    )
  }

  const canEdit = user && user.id === inventory.creatorId

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallbackHref={`/inventory/${inventoryId}`} className="mb-6" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{item.name}</h1>
              <Badge variant="outline" className="text-sm">
                <Hash size={12} className="mr-1" />
                {item.customId}
              </Badge>
            </div>
            
            {item.description && (
              <p className="text-muted-foreground text-lg mb-4">{item.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User size={14} />
                {item.createdBy.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleting(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Details
              {isEditing && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      fetchData()
                    }}
                  >
                    <X size={14} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isEditing ? (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="edit-name">Item Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-2 lg:col-span-3">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Name</dt>
                    <dd className="text-base">{item.name}</dd>
                  </div>
                  {item.description && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Description</dt>
                      <dd className="text-base">{item.description}</dd>
                    </div>
                  )}
                </>
              )}

              {inventory.stringField1Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.stringField1Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      value={editFormData.stringValue1}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, stringValue1: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.stringValue1 || '—'}</dd>
                  )}
                </div>
              )}
              
              {inventory.stringField2Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.stringField2Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      value={editFormData.stringValue2}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, stringValue2: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.stringValue2 || '—'}</dd>
                  )}
                </div>
              )}
              
              {inventory.stringField3Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.stringField3Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      value={editFormData.stringValue3}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, stringValue3: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.stringValue3 || '—'}</dd>
                  )}
                </div>
              )}

              {inventory.numberField1Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.numberField1Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editFormData.numberValue1}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, numberValue1: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.numberValue1 !== null ? item.numberValue1 : '—'}</dd>
                  )}
                </div>
              )}
              
              {inventory.numberField2Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.numberField2Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editFormData.numberValue2}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, numberValue2: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.numberValue2 !== null ? item.numberValue2 : '—'}</dd>
                  )}
                </div>
              )}
              
              {inventory.numberField3Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.numberField3Name}
                  </dt>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editFormData.numberValue3}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, numberValue3: e.target.value }))}
                    />
                  ) : (
                    <dd className="text-base">{item.numberValue3 !== null ? item.numberValue3 : '—'}</dd>
                  )}
                </div>
              )}

              {inventory.boolField1Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.boolField1Name}
                  </dt>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={editFormData.boolValue1}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, boolValue1: !!checked }))}
                      />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <dd className="text-base">{item.boolValue1 ? 'Yes' : 'No'}</dd>
                  )}
                </div>
              )}
              
              {inventory.boolField2Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.boolField2Name}
                  </dt>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={editFormData.boolValue2}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, boolValue2: !!checked }))}
                      />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <dd className="text-base">{item.boolValue2 ? 'Yes' : 'No'}</dd>
                  )}
                </div>
              )}
              
              {inventory.boolField3Active && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    {inventory.boolField3Name}
                  </dt>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={editFormData.boolValue3}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, boolValue3: !!checked }))}
                      />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <dd className="text-base">{item.boolValue3 ? 'Yes' : 'No'}</dd>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "<strong>{item.name}</strong>"?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}