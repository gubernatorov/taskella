export interface User {
  id: string
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface TelegramAuthRequest {
  initData: string
}