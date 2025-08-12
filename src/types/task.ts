import { User } from "./auth"
import { Project } from "./project"

export interface Task {
  id: string
  key: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  assignee?: User
  reporter: User
  project: Project
  estimatedHours?: number
  loggedHours?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
export type TaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest'
export type TaskType = 'task' | 'bug' | 'feature' | 'epic' | 'story'

export interface CreateTaskRequest {
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  assigneeId?: string
  estimatedHours?: number
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  estimatedHours?: number
  loggedHours?: number
  dueDate?: string
}