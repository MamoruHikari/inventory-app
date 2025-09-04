'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Trash2 } from 'lucide-react'

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface CommentsSectionProps {
  inventoryId: string
}

export function CommentsSection({ inventoryId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
    fetchUser()
  }, [inventoryId])

  const fetchUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/inventories/${inventoryId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text: newComment })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [comment, ...prev])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/inventories/${inventoryId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getUserInitials = (name: string, email: string) => {
    return email ? email[0].toUpperCase() : 'U'
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      if (diffInMinutes < 1) return 'Just now'
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString([], { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Add a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this inventory..."
                rows={3}
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium">
                      {getUserInitials(comment.user.name, comment.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.user.email}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      {user && user.email === comment.user.email && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(comment.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}