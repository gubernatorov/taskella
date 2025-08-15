import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

// Определяем путь к базе данных в зависимости от окружения
const getDbPath = () => {
  const dbUrl = process.env.DATABASE_URL
  
  if (dbUrl && dbUrl.startsWith('file:')) {
    // Извлекаем путь из DATABASE_URL
    const filePath = dbUrl.replace('file:', '')
    
    // Если путь относительный, делаем его абсолютным
    if (!path.isAbsolute(filePath)) {
      return path.join(process.cwd(), filePath)
    }
    return filePath
  }
  
  // Fallback для development
  return path.join(process.cwd(), 'sqlite.db')
}

const dbPath = getDbPath()

// Создаем директорию для базы данных если её нет
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  console.log(`Created database directory: ${dbDir}`)
}

console.log(`Connecting to database at: ${dbPath}`)

// Создаем подключение к SQLite
const sqlite = new Database(dbPath)

// Включаем WAL режим для лучшей производительности
sqlite.pragma('journal_mode = WAL')

// Создаем экземпляр Drizzle ORM
export const db = drizzle(sqlite, { schema })

// Функция для закрытия соединения (опционально)
export const closeDb = () => {
  sqlite.close()
}