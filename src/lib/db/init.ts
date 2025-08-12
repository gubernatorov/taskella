import { runMigrations } from './migrate'
import { seedDatabase } from './seed'
import { db } from './connection'
import { users, projects, tasks, projectMembers, comments } from './schema'
import { sql } from 'drizzle-orm'

export interface InitOptions {
  force?: boolean
  seedData?: boolean
  createIndexes?: boolean
}

export async function initializeDatabase(options: InitOptions = {}) {
  const { force = false, seedData = true, createIndexes = true } = options
  
  console.log('🗄️ Инициализация базы данных...')
  console.log('Параметры:', { force, seedData, createIndexes })
  
  try {
    // 1. Если force=true, сначала удаляем все данные и таблицы
    if (force) {
      console.log('🔄 Полное пересоздание БД...')
      await dropAllTables()
      console.log('✅ Таблицы удалены')
    }
    
    // 2. Запускаем миграции (создаем таблицы)
    console.log('🔄 Выполнение миграций...')
    await runMigrations()
    console.log('✅ Миграции выполнены успешно')
    
    // 3. Создаем дополнительные индексы для производительности
    if (createIndexes) {
      await createPerformanceIndexes()
    }
    
    // 4. Проверяем существующие данные
    const stats = await getDatabaseStats()
    console.log('📊 Статистика БД:', stats)
    
    // 5. Заполняем тестовыми данными если нужно
    if (seedData && (force || stats.users === 0)) {
      console.log('🌱 Заполнение тестовыми данными...')
      await seedDatabase()
      console.log('✅ Тестовые данные добавлены')
    } else if (stats.users > 0) {
      console.log('ℹ️ Тестовые данные уже существуют')
    }
    
    // 6. Финальная проверка целостности
    const finalStats = await getDatabaseStats()
    console.log('📈 Финальная статистика:', finalStats)
    
    // Проверяем целостность связей
    await validateDataIntegrity()
    
    console.log('🎉 База данных готова!')
    return finalStats
    
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
    throw new Error(`Ошибка инициализации БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
  }
}

async function dropAllTables() {
  try {
    // Отключаем внешние ключи
    await db.run(sql`PRAGMA foreign_keys = OFF`)
    
    // Удаляем таблицы в обратном порядке
    await db.run(sql`DROP TABLE IF EXISTS comments`)
    await db.run(sql`DROP TABLE IF EXISTS tasks`)
    await db.run(sql`DROP TABLE IF EXISTS project_members`)
    await db.run(sql`DROP TABLE IF EXISTS projects`)
    await db.run(sql`DROP TABLE IF EXISTS users`)
    
    // Включаем обратно внешние ключи
    await db.run(sql`PRAGMA foreign_keys = ON`)
    
    console.log('✅ Все таблицы удалены')
  } catch (error) {
    console.warn('⚠️ Ошибка при удалении таблиц:', error)
  }
}

async function createPerformanceIndexes() {
  console.log('🔧 Создание индексов производительности...')
  
  try {
    // Индексы для частых запросов
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks (assignee_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members (project_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members (user_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments (task_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id)`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status)`)
    
    console.log('✅ Индексы созданы')
  } catch (error) {
    console.warn('⚠️ Не удалось создать некоторые индексы:', error)
  }
}

async function clearAllData() {
  try {
    // Очищаем в правильном порядке (учитывая внешние ключи)
    await db.delete(comments)
    await db.delete(tasks) 
    await db.delete(projectMembers)
    await db.delete(projects)
    await db.delete(users)
    
    console.log('✅ Все данные удалены')
  } catch (error) {
    console.warn('⚠️ Ошибка при очистке данных:', error)
    // Не бросаем ошибку, так как таблицы могут быть пустыми
  }
}

async function getDatabaseStats() {
  try {
    const [usersCount, projectsCount, tasksCount, membersCount, commentsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(projects),
      db.select({ count: sql<number>`count(*)` }).from(tasks),
      db.select({ count: sql<number>`count(*)` }).from(projectMembers),
      db.select({ count: sql<number>`count(*)` }).from(comments)
    ])
    
    return {
      users: usersCount[0]?.count || 0,
      projects: projectsCount[0]?.count || 0,
      tasks: tasksCount[0]?.count || 0,
      members: membersCount[0]?.count || 0,
      comments: commentsCount[0]?.count || 0
    }
  } catch (error) {
    console.warn('⚠️ Не удалось получить статистику БД:', error)
    return {
      users: 0,
      projects: 0,
      tasks: 0,
      members: 0,
      comments: 0
    }
  }
}

async function validateDataIntegrity() {
  console.log('🔍 Проверка целостности данных...')
  
  try {
    // Проверяем orphaned записи
    const orphanedTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .leftJoin(projects, sql`${tasks.projectId} = ${projects.id}`)
      .where(sql`${projects.id} IS NULL`)
    
    const orphanedMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(projectMembers)
      .leftJoin(projects, sql`${projectMembers.projectId} = ${projects.id}`)
      .where(sql`${projects.id} IS NULL`)
    
    if (orphanedTasks[0]?.count > 0) {
      console.warn(`⚠️ Найдены задачи без проектов: ${orphanedTasks[0].count}`)
    }
    
    if (orphanedMembers[0]?.count > 0) {
      console.warn(`⚠️ Найдены участники без проектов: ${orphanedMembers[0].count}`)
    }
    
    console.log('✅ Проверка целостности завершена')
    
  } catch (error) {
    console.warn('⚠️ Ошибка при проверке целостности:', error)
  }
}

// Функция для быстрой настройки БД в development
export async function quickSetup() {
  console.log('⚡ Быстрая настройка БД...')
  return await initializeDatabase({ 
    force: false, 
    seedData: true, 
    createIndexes: true 
  })
}

// Функция для полного пересоздания БД
export async function resetDatabase() {
  console.log('🔄 Полное пересоздание БД...')
  return await initializeDatabase({ 
    force: true, 
    seedData: true, 
    createIndexes: true 
  })
}

// Функция для проверки состояния БД
export async function checkDatabaseHealth() {
  console.log('🏥 Проверка состояния БД...')
  
  try {
    const stats = await getDatabaseStats()
    await validateDataIntegrity()
    
    const health = {
      status: 'healthy',
      stats,
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ БД в хорошем состоянии')
    return health
    
  } catch (error) {
    console.error('❌ Проблемы с БД:', error)
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      timestamp: new Date().toISOString()
    }
  }
}
