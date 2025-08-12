// Базовые типы пользователя
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  telegramId?: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

// Типы для проекта
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  ownerId: string
  createdAt: string
  updatedAt: string
  owner?: User
  members?: User[]
  tasks?: Task[]
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: 'active' | 'completed' | 'archived'
}

// Типы для задач
export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  projectId: string
  assigneeId?: string
  createdById: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  project?: Project
  assignee?: User
  createdBy?: User
  comments?: Comment[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  assigneeId?: string
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  assigneeId?: string
  dueDate?: string
}

// Типы для комментариев
export interface Comment {
  id: string
  content: string
  taskId: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: User
  task?: Task
}

export interface CreateCommentRequest {
  content: string
  taskId: string
}

// Утилитарные типы
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DatabaseInitOptions {
  force?: boolean
  seedData?: boolean
  createIndexes?: boolean
}

// Типы для авторизации
export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Типы для фильтрации и поиска
export interface ProjectFilters {
  status?: Project['status']
  search?: string
  ownerId?: string
  page?: number
  limit?: number
}

export interface TaskFilters {
  projectId?: string
  status?: Task['status']
  priority?: Task['priority']
  assigneeId?: string
  createdById?: string
  search?: string
  page?: number
  limit?: number
}

// Типы для валидации форм
export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string | ValidationError[]
}