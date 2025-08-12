import { db } from './connection'
import { users, projects, tasks, projectMembers } from './schema'
import { v4 as uuidv4 } from 'uuid'

export async function seedDatabase() {
  console.log('🌱 Заполнение базы данных начальными данными...')

  try {
    // Создаем пользователей с фиксированными ID
    const userData = [
      {
        id: '1',
        telegramId: 123456789,
        firstName: 'Иван',
        lastName: 'Петров',
        username: 'ivan_petrov',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: '2',
        telegramId: 987654321,
        firstName: 'Мария',
        lastName: 'Сидорова',
        username: 'maria_s',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b25fa2e5?w=100&h=100&fit=crop&crop=face',
      }
    ]

    await db.insert(users).values(userData)
    console.log('✅ Пользователи созданы')

    // Создаем проекты
    const projectData = [
      {
        id: uuidv4(),
        name: 'Мобильное приложение',
        description: 'Разработка мобильного приложения для управления задачами',
        key: 'MOBILE',
        status: 'active' as const,
        ownerId: userData[0].id,
      },
      {
        id: uuidv4(),
        name: 'Веб-платформа',
        description: 'Создание веб-платформы для корпоративных клиентов',
        key: 'WEB',
        status: 'active' as const,
        ownerId: userData[1].id,
      },
      {
        id: uuidv4(),
        name: 'API сервисы',
        description: 'Разработка микросервисной архитектуры',
        key: 'API',
        status: 'active' as const,
        ownerId: userData[0].id,
      }
    ]

    await db.insert(projects).values(projectData)
    console.log('✅ Проекты созданы')

    // Добавляем участников проектов
    const memberData = [
      {
        id: uuidv4(),
        projectId: projectData[0].id,
        userId: userData[0].id,
        role: 'owner' as const,
      },
      {
        id: uuidv4(),
        projectId: projectData[0].id,
        userId: userData[1].id,
        role: 'developer' as const,
      },
      {
        id: uuidv4(),
        projectId: projectData[1].id,
        userId: userData[1].id,
        role: 'owner' as const,
      },
      {
        id: uuidv4(),
        projectId: projectData[2].id,
        userId: userData[0].id,
        role: 'owner' as const,
      }
    ]

    await db.insert(projectMembers).values(memberData)
    console.log('✅ Участники проектов добавлены')

    // Создаем задачи
    const taskData = [
      {
        id: uuidv4(),
        key: 'MOBILE-1',
        title: 'Создать дизайн главного экрана',
        description: 'Разработать дизайн главного экрана приложения с учетом фирменного стиля компании.',
        status: 'in_progress' as const,
        priority: 'high' as const,
        type: 'task' as const,
        projectId: projectData[0].id,
        assigneeId: userData[1].id,
        reporterId: userData[0].id,
        estimatedHours: 8,
        loggedHours: 4,
        dueDate: '2024-08-15',
      },
      {
        id: uuidv4(),
        key: 'MOBILE-2',
        title: 'Исправить баг с авторизацией',
        description: 'Пользователи не могут войти в приложение через Telegram.',
        status: 'todo' as const,
        priority: 'highest' as const,
        type: 'bug' as const,
        projectId: projectData[0].id,
        assigneeId: userData[0].id,
        reporterId: userData[1].id,
        estimatedHours: 2,
        dueDate: '2024-08-12',
      },
      {
        id: uuidv4(),
        key: 'WEB-1',
        title: 'Интеграция с API платежей',
        description: 'Реализовать интеграцию с платежной системой для обработки подписок.',
        status: 'in_review' as const,
        priority: 'medium' as const,
        type: 'feature' as const,
        projectId: projectData[1].id,
        assigneeId: userData[0].id,
        reporterId: userData[1].id,
        estimatedHours: 16,
        loggedHours: 14,
        dueDate: '2024-08-20',
      },
      {
        id: uuidv4(),
        key: 'API-1',
        title: 'Документация API',
        description: 'Создать полную документацию для REST API с примерами запросов.',
        status: 'in_progress' as const,
        priority: 'low' as const,
        type: 'task' as const,
        projectId: projectData[2].id,
        assigneeId: userData[0].id,
        reporterId: userData[0].id,
        estimatedHours: 12,
        loggedHours: 3,
        dueDate: '2024-08-25',
      }
    ]

    await db.insert(tasks).values(taskData)
    console.log('✅ Задачи созданы')

    console.log('🎉 База данных успешно заполнена!')
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error)
    throw error
  }
}