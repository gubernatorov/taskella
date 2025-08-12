import { db } from '../connection'
import { projects, users, tasks, projectMembers } from '../schema'
import { eq, like, and, count, desc } from 'drizzle-orm'
import { CreateProjectRequest, UpdateProjectRequest, Project } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'

export class ProjectRepository {
  async findAll(options: {
    search?: string
    page?: number
    limit?: number
    userId?: string
  }) {
    const { search, page = 1, limit = 10, userId } = options
    
    // Создаем запрос с условным where
    const query = db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        key: projects.key,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        owner: {
          id: users.id,
          telegramId: users.telegramId,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(search ? like(projects.name, `%${search}%`) : undefined)
      .orderBy(desc(projects.updatedAt))

    // Пагинация
    const offset = (page - 1) * limit
    const result = await query.limit(limit).offset(offset)

    // Получаем статистику для каждого проекта
    const projectsWithStats = await Promise.all(
      result.map(async (project) => {
        // Количество задач
        const tasksCount = await db
          .select({ count: count() })
          .from(tasks)
          .where(eq(tasks.projectId, project.id))
          .then(result => result[0]?.count || 0)

        // Количество участников
        const membersCount = await db
          .select({ count: count() })
          .from(projectMembers)
          .where(eq(projectMembers.projectId, project.id))
          .then(result => result[0]?.count || 0)

        return {
          ...project,
          tasksCount,
          membersCount,
        } as Project
      })
    )

    // Общее количество для пагинации
    const total = await db
      .select({ count: count() })
      .from(projects)
      .where(search ? like(projects.name, `%${search}%`) : undefined)
      .then(result => result[0]?.count || 0)

    return {
      data: projectsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findById(id: string): Promise<Project | null> {
    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        key: projects.key,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        owner: {
          id: users.id,
          telegramId: users.telegramId,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.id, id))
      .limit(1)

    if (result.length === 0) return null

    const project = result[0]

    // Получаем статистику
    const tasksCount = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.projectId, project.id))
      .then(result => result[0]?.count || 0)

    const membersCount = await db
      .select({ count: count() })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, project.id))
      .then(result => result[0]?.count || 0)

    return {
      ...project,
      tasksCount,
      membersCount,
    } as Project
  }

  async create(data: CreateProjectRequest, ownerId: string): Promise<Project> {
    const projectId = uuidv4()
    const now = new Date().toISOString()

    // Создаем проект
    await db.insert(projects).values({
      id: projectId,
      name: data.name,
      description: data.description,
      key: data.key,
      ownerId,
      createdAt: now,
      updatedAt: now,
    })

    // Добавляем владельца как участника
    await db.insert(projectMembers).values({
      id: uuidv4(),
      projectId,
      userId: ownerId,
      role: 'owner',
      joinedAt: now,
    })

    // Возвращаем созданный проект
    return this.findById(projectId) as Promise<Project>
  }

  async update(id: string, data: UpdateProjectRequest): Promise<Project | null> {
    const now = new Date().toISOString()

    await db
      .update(projects)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(projects.id, id))

    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))

    return result.changes > 0
  }
}