'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

const inventorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  isPublic: z.boolean(),
  customIdPrefix: z.string().min(1, 'Prefix is required').max(10),
  customIdFormat: z.string().min(1, 'Format is required'),
  
  stringField1Name: z.string().optional(),
  stringField1Active: z.boolean(),
  stringField2Name: z.string().optional(),
  stringField2Active: z.boolean(),
  stringField3Name: z.string().optional(),
  stringField3Active: z.boolean(),
  
  numberField1Name: z.string().optional(),
  numberField1Active: z.boolean(),
  numberField2Name: z.string().optional(),
  numberField2Active: z.boolean(),
  numberField3Name: z.string().optional(),
  numberField3Active: z.boolean(),
  
  boolField1Name: z.string().optional(),
  boolField1Active: z.boolean(),
  boolField2Name: z.string().optional(),
  boolField2Active: z.boolean(),
  boolField3Name: z.string().optional(),
  boolField3Active: z.boolean(),
})

type InventoryFormData = z.infer<typeof inventorySchema>

interface Category {
  id: string
  name: string
}

interface InventoryFormProps {
  onSubmit: (data: InventoryFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function InventoryForm({ onSubmit, onCancel, isLoading = false }: InventoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      title: '',
      description: '',
      isPublic: true,
      customIdPrefix: 'ITEM',
      customIdFormat: '{prefix}-{counter}',
      
      stringField1Active: false,
      stringField2Active: false,
      stringField3Active: false,
      numberField1Active: false,
      numberField2Active: false,
      numberField3Active: false,
      boolField1Active: false,
      boolField2Active: false,
      boolField3Active: false,
    }
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [])

  const watchedFields = watch()

  const renderCustomFieldSection = (type: 'string' | 'number' | 'bool', title: string) => {
    return (
      <div className="space-y-4">
        <h4 className="font-medium">{title} Fields</h4>
        {[1, 2, 3].map((num) => {
          const fieldKey = `${type}Field${num}Active` as keyof InventoryFormData
          const nameKey = `${type}Field${num}Name` as keyof InventoryFormData
          const isActive = watchedFields[fieldKey]
          
          return (
            <div key={num} className="flex items-center space-x-4 p-4 border rounded-lg">
              <input
                type="checkbox"
                id={fieldKey}
                {...register(fieldKey)}
                className="w-4 h-4"
              />
              <Label htmlFor={fieldKey} className="w-16">
                Field {num}
              </Label>
              
              {isActive && (
                <div className="flex-1">
                  <Input
                    placeholder={`Enter ${type} field name...`}
                    {...register(nameKey)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="custom-id">Custom ID</TabsTrigger>
                <TabsTrigger value="fields">Custom Fields</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter inventory title..."
                      className="w-full"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value: string) => setValue('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter inventory description..."
                    rows={4}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={watchedFields.isPublic}
                    onCheckedChange={(checked) => setValue('isPublic', !!checked)}
                  />
                  <Label htmlFor="isPublic">Make this inventory public</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="custom-id" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customIdPrefix">ID Prefix *</Label>
                    <Input
                      id="customIdPrefix"
                      {...register('customIdPrefix')}
                      placeholder="ITEM"
                      maxLength={10}
                      className="w-full"
                    />
                    {errors.customIdPrefix && (
                      <p className="text-sm text-destructive">{errors.customIdPrefix.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customIdFormat">ID Format *</Label>
                    <Input
                      id="customIdFormat"
                      {...register('customIdFormat')}
                      placeholder="{prefix}-{counter}"
                      className="w-full"
                    />
                    {errors.customIdFormat && (
                      <p className="text-sm text-destructive">{errors.customIdFormat.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use {`{prefix}`} and {`{counter}`} as placeholders. Example: ITEM-001
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <p className="text-sm font-mono">
                    {(watchedFields.customIdFormat || '{prefix}-{counter}')
                      .replace('{prefix}', watchedFields.customIdPrefix || 'ITEM')
                      .replace('{counter}', '001')}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="fields" className="space-y-6 mt-6">
                {renderCustomFieldSection('string', 'Text')}
                {renderCustomFieldSection('number', 'Number')}
                {renderCustomFieldSection('bool', 'Yes/No')}
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Creating...' : 'Create Inventory'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}