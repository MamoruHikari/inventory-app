'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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

interface InventorySettingsFormProps {
  inventory: Inventory
  onUpdate: (updatedInventory: Inventory) => void
  onDelete: () => void
}

export function InventorySettingsForm({ inventory, onUpdate, onDelete }: InventorySettingsFormProps) {
  const [formData, setFormData] = useState({
    title: inventory.title,
    description: inventory.description,
    category: inventory.category,
    isPublic: inventory.isPublic,
    customIdPrefix: inventory.customIdPrefix || 'ITEM',
    customIdFormat: inventory.customIdFormat || '{prefix}-{counter}',
    
    stringField1Name: inventory.stringField1Name || '',
    stringField1Active: inventory.stringField1Active,
    stringField2Name: inventory.stringField2Name || '',
    stringField2Active: inventory.stringField2Active,
    stringField3Name: inventory.stringField3Name || '',
    stringField3Active: inventory.stringField3Active,
    
    numberField1Name: inventory.numberField1Name || '',
    numberField1Active: inventory.numberField1Active,
    numberField2Name: inventory.numberField2Name || '',
    numberField2Active: inventory.numberField2Active,
    numberField3Name: inventory.numberField3Name || '',
    numberField3Active: inventory.numberField3Active,
    
    boolField1Name: inventory.boolField1Name || '',
    boolField1Active: inventory.boolField1Active,
    boolField2Name: inventory.boolField2Name || '',
    boolField2Active: inventory.boolField2Active,
    boolField3Name: inventory.boolField3Name || '',
    boolField3Active: inventory.boolField3Active,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [buttonKey, setButtonKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSaveError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setSaveError('Authentication required')
        return
      }

      const response = await fetch(`/api/inventories/${inventory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedInventory = await response.json()
        onUpdate(updatedInventory)
        
        setSaveSuccess(true)
        
        setTimeout(() => {
          setSaveSuccess(false)
          setButtonKey(prev => prev + 1)
        }, 2000)
      } else {
        const errorData = await response.json()
        setSaveError(errorData.error || 'Failed to save changes')
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      setSaveError('Failed to save changes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/inventories/${inventory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        onDelete()
      }
    } catch (error) {
      console.error('Error deleting inventory:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {saveError}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Inventory Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Art & Collectibles">Art & Collectibles</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
            <Label htmlFor="isPublic">Make this inventory public</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item ID Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customIdPrefix">ID Prefix</Label>
            <Input
              id="customIdPrefix"
              value={formData.customIdPrefix}
              onChange={(e) => setFormData(prev => ({ ...prev, customIdPrefix: e.target.value }))}
              placeholder="ITEM"
            />
          </div>
          
          <div>
            <Label htmlFor="customIdFormat">ID Format</Label>
            <Input
              id="customIdFormat"
              value={formData.customIdFormat}
              onChange={(e) => setFormData(prev => ({ ...prev, customIdFormat: e.target.value }))}
              placeholder="{prefix}-{counter}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {`{prefix}`} and {`{counter}`} placeholders
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Text Fields</h4>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`stringField${num}`}
                      checked={formData[`stringField${num}Active` as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [`stringField${num}Active`]: checked }))
                      }
                    />
                    <Label htmlFor={`stringField${num}`} className="text-sm font-medium">
                      {formData[`stringField${num}Active` as keyof typeof formData] ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                  <Input
                    placeholder={`Text Field ${num} Name`}
                    value={formData[`stringField${num}Name` as keyof typeof formData] as string}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, [`stringField${num}Name`]: e.target.value }))
                    }
                    disabled={!(formData[`stringField${num}Active` as keyof typeof formData] as boolean)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Number Fields</h4>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`numberField${num}`}
                      checked={formData[`numberField${num}Active` as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [`numberField${num}Active`]: checked }))
                      }
                    />
                    <Label htmlFor={`numberField${num}`} className="text-sm font-medium">
                      {formData[`numberField${num}Active` as keyof typeof formData] ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                  <Input
                    placeholder={`Number Field ${num} Name`}
                    value={formData[`numberField${num}Name` as keyof typeof formData] as string}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, [`numberField${num}Name`]: e.target.value }))
                    }
                    disabled={!(formData[`numberField${num}Active` as keyof typeof formData] as boolean)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Yes/No Fields</h4>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`boolField${num}`}
                      checked={formData[`boolField${num}Active` as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [`boolField${num}Active`]: checked }))
                      }
                    />
                    <Label htmlFor={`boolField${num}`} className="text-sm font-medium">
                      {formData[`boolField${num}Active` as keyof typeof formData] ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                  <Input
                    placeholder={`Yes/No Field ${num} Name`}
                    value={formData[`boolField${num}Name` as keyof typeof formData] as string}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, [`boolField${num}Name`]: e.target.value }))
                    }
                    disabled={!(formData[`boolField${num}Active` as keyof typeof formData] as boolean)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border mt-6">
        <CardContent className="py-3">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: '150px', height: '40px' }}
              className="flex items-center justify-center gap-1"
            >
              <Trash2 size={16} className="ml-1" />
              <span className="mr-1">Delete Inventory</span>
            </Button>
            <Button 
              key={buttonKey}
              type="submit" 
              disabled={isSubmitting}
              style={{ width: '150px', height: '40px' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : saveSuccess ? (
                <span className="flex items-center justify-center">
                  <svg className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inventory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Are you sure you want to delete "<strong>{inventory.title}</strong>"?
            </p>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the inventory and all its items. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}