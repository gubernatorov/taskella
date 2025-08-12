import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './connection'

export async function runMigrations() {
  console.log('🔄 Запуск миграций...')
  
  try {
    await migrate(db, { migrationsFolder: './src/lib/db/migrations' })
    console.log('✅ Миграции выполнены успешно')
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error)
    throw error
  }
}