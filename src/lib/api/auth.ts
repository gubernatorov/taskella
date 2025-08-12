import { apiClient } from './client'
import { AuthResponse, TelegramAuthRequest, User } from '@/types/auth'

export interface DevAuthRequest {
  user: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
}

export const authApi = {
  async login(data: TelegramAuthRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/telegram', data)
  },

  async devLogin(data: DevAuthRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/dev', data)
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },
}
