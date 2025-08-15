import { apiClient } from './client';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '@/types/task'
import { PaginatedResponse } from '@/types/api'
import { Comment, CreateCommentRequest } from '@/types/comment'
import { Attachment } from '@/types/attachment'

interface GetTasksOptions {
  projectId?: string
  status?: TaskStatus
  assignee?: string
  priority?: TaskPriority
  page?: number
  limit?: number
}

export const tasksApi = {
  async getTasks(options: GetTasksOptions = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams()
    if (options.projectId) params.append('projectId', options.projectId)
    if (options.status) params.append('status', options.status)
    if (options.assignee) params.append('assignee', options.assignee)
    if (options.priority) params.append('priority', options.priority)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    
    // Если есть projectId, используем endpoint проекта
    const endpoint = options.projectId
      ? `/projects/${options.projectId}/tasks?${params}`
      : `/tasks?${params}`
      
    return apiClient.get<PaginatedResponse<Task>>(endpoint)
  },
  
  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`)
  },
  
  async createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>(`/projects/${projectId}/tasks`, data);
  },
  
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, data)
  },
  
  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`)
  },

  // Комментарии
  async getComments(taskId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/tasks/${taskId}/comments`)
  },

  async createComment(taskId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>(`/tasks/${taskId}/comments`, data)
  },

  // Вложения
  async getAttachments(taskId: string): Promise<Attachment[]> {
    return apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`)
  },

  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`/api/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки файла')
    }
    
    return response.json()
  },
}