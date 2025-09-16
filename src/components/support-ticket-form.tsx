'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { HelpCircle, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface SupportTicketFormProps {
  user: User | null
  currentPage?: string
  templateTitle?: string
}

interface TicketData {
  summary: string
  priority: 'High' | 'Average' | 'Low'
}

interface SubmitStatus {
  type: 'success' | 'error' | 'uploading'
  message: string
}

export function SupportTicketForm({ user, currentPage, templateTitle }: SupportTicketFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [ticketData, setTicketData] = useState<TicketData>({
    summary: '',
    priority: 'Average'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: 'uploading', message: 'Creating support ticket...' })

    try {
      // Generate JSON data for the ticket
      const ticketJson = {
        "Reported by": user?.email || 'Anonymous',
        "Link": window.location.href,
        "Current Page": currentPage || 'Unknown', // Add this field
        "Priority": ticketData.priority,
        "Summary": ticketData.summary,
        "Admin": "sam-mod@outlook.com",
        "Timestamp": new Date().toISOString(),
        "ticketId": `TICKET-${Date.now()}`
      }

      console.log('🎫 Generated ticket data:', ticketJson)

      // Call API to upload to OneDrive
      const response = await fetch('/api/power-automate/upload-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketJson),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Support ticket created successfully! Admins will be notified.'
        })

        // Reset form and close after success
        setTimeout(() => {
          setTicketData({ summary: '', priority: 'Average' })
          setIsOpen(false)
          setSubmitStatus(null)
        }, 3000)

      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to create support ticket'
        })
      }
    } catch (error) {
      console.error('Support ticket error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = () => {
    if (!submitStatus) return ''
    
    switch (submitStatus.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'uploading':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return ''
    }
  }

  const getStatusIcon = () => {
    switch (submitStatus?.type) {
      case 'success':
        return <CheckCircle size={16} />
      case 'uploading':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
      case 'error':
        return <AlertCircle size={16} />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg" className="gap-2">
          <HelpCircle size={20} />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle size={18} />
            Create Support Ticket
          </DialogTitle>
        </DialogHeader>

        {/* Status Message */}
        {submitStatus && (
          <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{submitStatus.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Issue Summary *</Label>
            <Textarea
              id="summary"
              value={ticketData.summary}
              onChange={(e) => setTicketData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Describe the issue you're experiencing..."
              required
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={ticketData.priority} 
              onValueChange={(value: 'High' | 'Average' | 'Low') => 
                setTicketData(prev => ({ ...prev, priority: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">🔴 High</SelectItem>
                <SelectItem value="Average">🟡 Average</SelectItem>
                <SelectItem value="Low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Info Preview */}
          <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-1 border">
            <div><strong>Reported by:</strong> {user?.email || 'Anonymous'}</div>
            <div><strong>Current page:</strong> {currentPage || 'Unknown'}</div>
            {templateTitle && (
              <div><strong>Template:</strong> {templateTitle}</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !ticketData.summary.trim()}
              className="gap-2"
            >
              <Send size={16} />
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}