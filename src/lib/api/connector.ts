import { apiClient } from './client'
import type { User } from '@/types/auth'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '@/types/project'
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskPriority
} from '@/types/task'
import type { PaginatedResponse } from '@/types/api'

// Базовый класс для API коннекторов
class BaseConnector {
  protected client = apiClient

  protected async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      const result = await request
      console.log('✅ API запрос успешен')
      return result
    } catch (error) {
      console.error('❌ Ошибка API запроса:', error)
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error
    }
    
    if (typeof error === 'string') {
      return new Error(error)
    }
    
    return new Error('Неизвестная ошибка API')
  }
}

// Коннектор для работы с пользователями
export class UserConnector extends BaseConnector {
  async getCurrentUser(): Promise<User> {
    return this.handleRequest(
      this.client.get<User>('/auth/me')
    )
  }

  async devLogin(userData: any): Promise<{ user: User; token: string }> {
    return this.handleRequest(
      this.client.post<{ user: User; token: string }>('/auth/dev', { user: userData })
    )
  }

  async telegramLogin(authData: any): Promise<{ user: User; token: string }> {
    return this.handleRequest(
      this.client.post<{ user: User; token: string }>('/auth/telegram', authData)
    )
  }
}

// Коннектор для работы с проектами
export class ProjectConnector extends BaseConnector {
  async getProjects(options: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams()
    
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.search) params.append('search', options.search)
    
    return this.handleRequest(
      this.client.get<PaginatedResponse<Project>>(`/projects?${params}`)
    )
  }

  async getProject(id: string): Promise<Project> {
    return this.handleRequest(
      this.client.get<Project>(`/projects/${id}`)
    )
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.handleRequest(
      this.client.post<Project>('/projects', data)
    )
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return this.handleRequest(
      this.client.put<Project>(`/projects/${id}`, data)
    )
  }

  async deleteProject(id: string): Promise<void> {
    return this.handleRequest(
      this.client.delete<void>(`/projects/${id}`)
    )
  }

  async getProjectMembers(id: string): Promise<User[]> {
    return this.handleRequest(
      this.client.get<User[]>(`/projects/${id}/members`)
    )
  }
}

// Коннектор для работы с задачами
export class TaskConnector extends BaseConnector {
  async getTasks(options: {
    projectId?: string
    status?: TaskStatus
    assignee?: string
    priority?: TaskPriority
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams()
    
    if (options.projectId) params.append('projectId', options.projectId)
    if (options.status) params.append('status', options.status)
    if (options.assignee) params.append('assignee', options.assignee)
    if (options.priority) params.append('priority', options.priority)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    
    const endpoint = options.projectId
      ? `/projects/${options.projectId}/tasks?${params}`
      : `/tasks?${params}`
      
    return this.handleRequest(
      this.client.get<PaginatedResponse<Task>>(endpoint)
    )
  }

  async getTask(id: string): Promise<Task> {
    return this.handleRequest(
      this.client.get<Task>(`/tasks/${id}`)
    )
  }

  async createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
    return this.handleRequest(
      this.client.post<Task>(`/projects/${projectId}/tasks`, data)
    )
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return this.handleRequest(
      this.client.put<Task>(`/tasks/${id}`, data)
    )
  }

  async deleteTask(id: string): Promise<void> {
    return this.handleRequest(
      this.client.delete<void>(`/tasks/${id}`)
    )
  }
}

// Коннектор для управления базой данных
export class DatabaseConnector extends BaseConnector {
  async initializeDatabase(options: {
    force?: boolean
  } = {}): Promise<{ success: boolean; message: string }> {
    return this.handleRequest(
      this.client.post<{ success: boolean; message: string }>('/init-db', options)
    )
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.handleRequest(
      this.client.get<{ status: string; timestamp: string }>('/health')
    )
  }
}

// Главный API коннектор, объединяющий все подключения
export class APIConnector {
  public readonly users = new UserConnector()
  public readonly projects = new ProjectConnector()
  public readonly tasks = new TaskConnector()
  public readonly database = new DatabaseConnector()

  // Утилитарные методы
  async ping(): Promise<boolean> {
    try {
      await this.database.healthCheck()
      return true
    } catch {
      return false
    }
  }

  // Метод для проверки соединения
  async checkConnection(): Promise<{
    connected: boolean
    latency?: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      await this.ping()
      const latency = Date.now() - startTime
      
      return {
        connected: true,
        latency
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }
    }
  }
}

// Экспортируем singleton экземпляр
export const api = new APIConnector()
