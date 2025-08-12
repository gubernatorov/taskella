import { mockUsers } from './mock-users'

export const mockProjects = [
  {
    id: '1',
    name: 'Мобильное приложение',
    description: 'Разработка мобильного приложения для управления задачами',
    key: 'MOBILE',
    status: 'active',
    owner: mockUsers[0],
    membersCount: 5,
    tasksCount: 12,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-08-09T15:30:00Z'
  },
  {
    id: '2',
    name: 'Веб-платформа',
    description: 'Создание веб-платформы для корпоративных клиентов',
    key: 'WEB',
    status: 'active',
    owner: mockUsers[1],
    membersCount: 8,
    tasksCount: 24,
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-08-10T09:15:00Z'
  },
  {
    id: '3',
    name: 'API сервисы',
    description: 'Разработка микросервисной архитектуры',
    key: 'API',
    status: 'active',
    owner: mockUsers[0],
    membersCount: 3,
    tasksCount: 8,
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-08-08T14:20:00Z'
  }
]