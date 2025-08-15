'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Attachment } from '@/types/attachment'
import { tasksApi } from '@/lib/api/tasks'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Paperclip, Upload, Download, File, Image, FileText, X, ChevronDown, ChevronUp } from 'lucide-react'

interface TaskAttachmentsProps {
  taskId: string
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const loadAttachments = async () => {
    try {
      setIsLoading(true)
      const data = await tasksApi.getAttachments(taskId)
      setAttachments(data)
    } catch (error) {
      console.error('Ошибка загрузки вложений:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    try {
      setIsUploading(true)
      const file = files[0]
      
      // Проверка размера файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 10MB')
        return
      }

      const uploadedAttachment = await tasksApi.uploadAttachment(taskId, file)
      setAttachments(prev => [uploadedAttachment, ...prev])
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  useEffect(() => {
    loadAttachments()
  }, [taskId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Вложения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Загрузка вложений...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Вложения ({attachments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {attachments.slice(0, 3).map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
              >
                {getFileIcon(attachment.mimeType)}
                <span className="truncate max-w-20">
                  {attachment.originalName}
                </span>
              </div>
            ))}
            {attachments.length > 3 && (
              <div className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                +{attachments.length - 3}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Область загрузки файлов */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Перетащите файлы сюда или выберите файлы
            </p>
            <Input
              type="file"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {isUploading ? 'Загрузка...' : 'Выбрать файл'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Максимальный размер файла: 10MB
            </p>
          </div>

          {/* Список вложений */}
          <div className="space-y-2">
            {attachments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Нет вложений</p>
                <p className="text-sm">Загрузите файлы для задачи</p>
              </div>
            ) : (
              attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(attachment.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                      <span>•</span>
                      <span>{attachment.uploadedBy.firstName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/uploads/${attachment.fileName}`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}