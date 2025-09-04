'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'

interface Inventory {
  id: string
  title: string
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

interface AddItemFormProps {
  inventory: Inventory
  onSuccess: (item: any) => void
  onCancel: () => void
}

export function AddItemForm({ inventory, onSuccess, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stringField1: '',
    stringField2: '',
    stringField3: '',
    numberField1: '',
    numberField2: '',
    numberField3: '',
    boolField1: false,
    boolField2: false,
    boolField3: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('You must be logged in to create items')
        return
      }

      const itemData = {
        name: formData.name,
        description: formData.description || null,
        stringField1: formData.stringField1 || null,
        stringField2: formData.stringField2 || null,
        stringField3: formData.stringField3 || null,
        numberField1: formData.numberField1 ? parseFloat(formData.numberField1) : null,
        numberField2: formData.numberField2 ? parseFloat(formData.numberField2) : null,
        numberField3: formData.numberField3 ? parseFloat(formData.numberField3) : null,
        boolField1: formData.boolField1,
        boolField2: formData.boolField2,
        boolField3: formData.boolField3,
      }

      const response = await fetch(`/api/inventories/${inventory.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create item')
      }

      const newItem = await response.json()
      onSuccess(newItem)
    } catch (error) {
      console.error('Error creating item:', error)
      setError(error instanceof Error ? error.message : 'Failed to create item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter item name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter item description (optional)"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Fields</h3>
        
        {inventory.stringField1Active && (
          <div>
            <Label htmlFor="stringField1">{inventory.stringField1Name}</Label>
            <Input
              id="stringField1"
              value={formData.stringField1}
              onChange={(e) => handleInputChange('stringField1', e.target.value)}
              placeholder={`Enter ${inventory.stringField1Name?.toLowerCase()}`}
            />
          </div>
        )}
        
        {inventory.stringField2Active && (
          <div>
            <Label htmlFor="stringField2">{inventory.stringField2Name}</Label>
            <Input
              id="stringField2"
              value={formData.stringField2}
              onChange={(e) => handleInputChange('stringField2', e.target.value)}
              placeholder={`Enter ${inventory.stringField2Name?.toLowerCase()}`}
            />
          </div>
        )}
        
        {inventory.stringField3Active && (
          <div>
            <Label htmlFor="stringField3">{inventory.stringField3Name}</Label>
            <Input
              id="stringField3"
              value={formData.stringField3}
              onChange={(e) => handleInputChange('stringField3', e.target.value)}
              placeholder={`Enter ${inventory.stringField3Name?.toLowerCase()}`}
            />
          </div>
        )}

        {inventory.numberField1Active && (
          <div>
            <Label htmlFor="numberField1">{inventory.numberField1Name}</Label>
            <Input
              id="numberField1"
              type="number"
              value={formData.numberField1}
              onChange={(e) => handleInputChange('numberField1', e.target.value)}
              placeholder={`Enter ${inventory.numberField1Name?.toLowerCase()}`}
            />
          </div>
        )}
        
        {inventory.numberField2Active && (
          <div>
            <Label htmlFor="numberField2">{inventory.numberField2Name}</Label>
            <Input
              id="numberField2"
              type="number"
              value={formData.numberField2}
              onChange={(e) => handleInputChange('numberField2', e.target.value)}
              placeholder={`Enter ${inventory.numberField2Name?.toLowerCase()}`}
            />
          </div>
        )}
        
        {inventory.numberField3Active && (
          <div>
            <Label htmlFor="numberField3">{inventory.numberField3Name}</Label>
            <Input
              id="numberField3"
              type="number"
              value={formData.numberField3}
              onChange={(e) => handleInputChange('numberField3', e.target.value)}
              placeholder={`Enter ${inventory.numberField3Name?.toLowerCase()}`}
            />
          </div>
        )}

        {inventory.boolField1Active && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boolField1"
              checked={formData.boolField1}
              onCheckedChange={(checked) => handleInputChange('boolField1', !!checked)}
            />
            <Label htmlFor="boolField1">{inventory.boolField1Name}</Label>
          </div>
        )}
        
        {inventory.boolField2Active && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boolField2"
              checked={formData.boolField2}
              onCheckedChange={(checked) => handleInputChange('boolField2', !!checked)}
            />
            <Label htmlFor="boolField2">{inventory.boolField2Name}</Label>
          </div>
        )}
        
        {inventory.boolField3Active && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boolField3"
              checked={formData.boolField3}
              onCheckedChange={(checked) => handleInputChange('boolField3', !!checked)}
            />
            <Label htmlFor="boolField3">{inventory.boolField3Name}</Label>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting ? 'Creating...' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}