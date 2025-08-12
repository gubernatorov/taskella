import { User } from '@/types/auth'

export const mockUsers: User[] = [
  {
    id: '1',
    telegramId: 123456789,
    firstName: 'Иван',
    lastName: 'Петров',
    username: 'ivan_petrov',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-08-10T10:00:00Z'
  },
  {
    id: '2',
    telegramId: 987654321,
    firstName: 'Мария',
    lastName: 'Сидорова',
    username: 'maria_s',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b25fa2e5?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-08-10T10:00:00Z'
  }
]
