import { Task } from '@/types/task'
import { mockUsers } from './mock-users'
import { mockProjects } from './mock-projects'

export const mockTasks: Task[] = [
  {
    id: '1',
    key: 'MOBILE-1',
    title: 'Создать дизайн главного экрана',
    description: 'Разработать дизайн главного экрана приложения с учетом фирменного стиля компании. Включить основные элементы навигации и информационные блоки.',
    status: 'in_progress',
    priority: 'high',
    type: 'task',
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    project: mockProjects[0],
    estimatedHours: 8,
    loggedHours: 4,
    dueDate: '2024-08-15',
    createdAt: '2024-08-05T10:00:00Z',
    updatedAt: '2024-08-10T11:30:00Z'
  },
  {
    id: '2',
    key: 'MOBILE-2',
    title: 'Исправить баг с авторизацией',
    description: 'Пользователи не могут войти в приложение через Telegram. Ошибка возникает при валидации токена.',
    status: 'todo',
    priority: 'highest',
    type: 'bug',
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    project: mockProjects[0],
    estimatedHours: 2,
    dueDate: '2024-08-12',
    createdAt: '2024-08-08T14:00:00Z',
    updatedAt: '2024-08-08T14:00:00Z'
  },
  {
    id: '3',
    key: 'WEB-1',
    title: 'Интеграция с API платежей',
    description: 'Реализовать интеграцию с платежной системой для обработки подписок.',
    status: 'in_review',
    priority: 'medium',
    type: 'feature',
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    project: mockProjects[1],
    estimatedHours: 16,
    loggedHours: 14,
    dueDate: '2024-08-20',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-09T16:45:00Z'
  },
  {
    id: '4',
    key: 'WEB-2',
    title: 'Настройка мониторинга',
    description: 'Настроить систему мониторинга и логирования для production среды.',
    status: 'done',
    priority: 'medium',
    type: 'task',
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    project: mockProjects[1],
    estimatedHours: 6,
    loggedHours: 5,
    createdAt: '2024-07-28T10:00:00Z',
    updatedAt: '2024-08-05T12:00:00Z'
  },
  {
    id: '5',
    key: 'API-1',
    title: 'Документация API',
    description: 'Создать полную документацию для REST API с примерами запросов.',
    status: 'in_progress',
    priority: 'low',
    type: 'task',
    assignee: mockUsers[0],
    reporter: mockUsers[0],
    project: mockProjects[2],
    estimatedHours: 12,
    loggedHours: 3,
    dueDate: '2024-08-25',
    createdAt: '2024-08-07T10:00:00Z',
    updatedAt: '2024-08-10T10:15:00Z'
  }
]