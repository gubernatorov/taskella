import { apiClient } from './client'
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project'
import { PaginatedResponse } from '@/types/api'

interface GetProjectsOptions {
  page?: number
  limit?: number
  search?: string
}

export const projectsApi = {
  async getProjects(options: GetProjectsOptions = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.search) params.append('search', options.search)
    
    return apiClient.get<PaginatedResponse<Project>>(`/projects?${params}`)
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`)
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/projects', data)
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`)
  },
}