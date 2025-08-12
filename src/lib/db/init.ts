import { runMigrations } from './migrate'
import { seedDatabase } from './seed'
import { db } from './connection'
import { users, projects, tasks, projectMembers, comments } from './schema'
import { sql } from 'drizzle-orm'

export async function initializeDatabase(force = false) {
  console.log('🗄️ Инициализация базы данных...')
  
  try {
    // Запускаем миграции (они создадут таблицы если их нет)
    await runMigrations()
    console.log('✅ Миграции выполнены')
    
    // Если force=true или нет данных, заполняем тестовыми данными
    if (force) {
      console.log('🔄 Пересоздание тестовых данных...')
      
      // Очищаем существующие данные
      try {
        await db.delete(comments)
        await db.delete(tasks)
        await db.delete(projectMembers)
        await db.delete(projects)
        await db.delete(users)
        console.log('✅ Старые данные удалены')
      } catch (error) {
        console.log('ℹ️ Таблицы пусты или не существуют')
      }
    }
    
    // Проверяем, есть ли пользователи
    const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(users)
    const userCount = existingUsers[0]?.count || 0
    
    if (force || userCount === 0) {
      await seedDatabase()
      console.log('✅ Тестовые данные добавлены')
    } else {
      console.log('ℹ️ Тестовые данные уже существуют')
    }
    
    console.log('🎉 База данных готова!')
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
    throw error
  }
}

// Инициализация БД теперь происходит через отдельный скрипт
// или вызов API endpoint для избежания проблем с клиентской сборкой
