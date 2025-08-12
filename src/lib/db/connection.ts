import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

// Создаем подключение к SQLite
const dbPath = path.join(process.cwd(), 'sqlite.db')
const sqlite = new Database(dbPath)

// Включаем WAL режим для лучшей производительности
sqlite.pragma('journal_mode = WAL')

// Создаем экземпляр Drizzle ORM
export const db = drizzle(sqlite, { schema })

// Функция для закрытия соединения (опционально)
export const closeDb = () => {
  sqlite.close()
}