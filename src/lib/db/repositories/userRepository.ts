import { db } from '../connection'
import { users } from '../schema'
import { eq } from 'drizzle-orm'
import { User } from '@/types/auth'
import { v4 as uuidv4 } from 'uuid'

export class UserRepository {
  async findByTelegramId(telegramId: number): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1)

    return result[0] || null
  }

  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return result[0] || null
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const userId = uuidv4()
    const now = new Date().toISOString()

    await db.insert(users).values({
      id: userId,
      telegramId: data.telegramId,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      avatarUrl: data.avatarUrl,
      createdAt: now,
      updatedAt: now,
    })

    return this.findById(userId) as Promise<User>
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const now = new Date().toISOString()

    await db
      .update(users)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(users.id, id))

    return this.findById(id)
  }
}