import { db } from './src/lib/db/connection.ts'
import { users, projects, tasks, projectMembers } from './src/lib/db/schema.ts'
import { v4 as uuidv4 } from 'uuid'

async function seedDatabase() {
  console.log('🌱 Заполнение базы данных начальными данными...')

  try {
    // Создаем пользователей
    const userData = [
      {
        id: uuidv4(),
        telegramId: 123456789,
        firstName: 'Иван',
        lastName: 'Петров',
        username: 'ivan_petrov',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: uuidv4(),
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
        status: 'active',
        ownerId: userData[0].id,
      },
      {
        id: uuidv4(),
        name: 'Веб-платформа',
        description: 'Создание веб-платформы для корпоративных клиентов',
        key: 'WEB',
        status: 'active',
        ownerId: userData[1].id,
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
        role: 'owner',
      },
      {
        id: uuidv4(),
        projectId: projectData[0].id,
        userId: userData[1].id,
        role: 'developer',
      }
    ]

    await db.insert(projectMembers).values(memberData)
    console.log('✅ Участники проектов добавлены')

    console.log('🎉 База данных успешно заполнена!')
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error)
    throw error
  }
}

seedDatabase()