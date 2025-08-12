import { User } from "./auth"

export interface Project {
  id: string
  name: string
  description?: string
  key: string
  status: ProjectStatus
  owner: User
  membersCount: number
  tasksCount: number
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'active' | 'archived' | 'suspended'

export interface CreateProjectRequest {
  name: string
  description?: string
  key: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
}