'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Comment, CreateCommentRequest } from '@/types/comment'
import { tasksApi } from '@/lib/api/tasks'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MessageCircle, Send, RefreshCw } from 'lucide-react'

interface TaskMiniChatProps {
  taskId: string
}

export function TaskMiniChat({ taskId }: TaskMiniChatProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadComments = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const data = await tasksApi.getComments(taskId)
      setComments(data)
      if (!silent) {
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadComments(true)
    setIsRefreshing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const commentData: CreateCommentRequest = {
        content: newMessage.trim()
      }
      
      const createdComment = await tasksApi.createComment(taskId, commentData)
      setComments(prev => [createdComment, ...prev])
      setNewMessage('')
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  useEffect(() => {
    loadComments()
    
    // Автообновление каждые 10 секунд
    refreshIntervalRef.current = setInterval(() => {
      loadComments(true)
    }, 10000)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [taskId])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            Мини-чат
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            Загрузка чата...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            Мини-чат ({comments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      {/* Область сообщений */}
      <CardContent className="flex-1 flex flex-col p-3 pt-0 space-y-3">
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>Нет сообщений</p>
              <p className="text-xs">Начните общение!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.slice().reverse().map((comment) => (
                <div key={comment.id} className="flex gap-2 group">
                  <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
                    <AvatarImage src={comment.author.avatarUrl} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-600 text-white">
                      {comment.author.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {comment.author.firstName}
                      </span>
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                    <div className="bg-muted/70 rounded-lg px-3 py-2 text-xs leading-relaxed">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Форма отправки */}
        <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Написать сообщение..."
            className="text-xs h-8 flex-1"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || isSubmitting}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}