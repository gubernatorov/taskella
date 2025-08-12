import { apiClient } from './client';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '@/types/task'
import { PaginatedResponse } from '@/types/api'

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
}