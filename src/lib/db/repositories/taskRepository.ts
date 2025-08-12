import { db } from '../connection'
import { tasks, users, projects } from '../schema'
import { eq, like, and, count, desc } from 'drizzle-orm'
import { CreateTaskRequest, UpdateTaskRequest, Task, TaskStatus, TaskPriority } from '@/types/task'
import { v4 as uuidv4 } from 'uuid'

export class TaskRepository {
  async findAll(options: {
    projectId?: string
    status?: TaskStatus
    priority?: TaskPriority
    assignee?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const { projectId, status, priority, assignee, search, page = 1, limit = 20 } = options
    
    // Фильтры
    const conditions = []

    if (projectId) {
      conditions.push(eq(tasks.projectId, projectId))
    }

    if (status) {
      conditions.push(eq(tasks.status, status))
    }

    if (priority) {
      conditions.push(eq(tasks.priority, priority))
    }

    if (assignee) {
      conditions.push(eq(tasks.assigneeId, assignee))
    }

    if (search) {
      conditions.push(like(tasks.title, `%${search}%`))
    }

    // Строим базовый запрос
    let baseQuery = db
      .select({
        id: tasks.id,
        key: tasks.key,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        type: tasks.type,
        estimatedHours: tasks.estimatedHours,
        loggedHours: tasks.loggedHours,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        reporterId: tasks.reporterId,
        assigneeId: tasks.assigneeId,
        projectId: tasks.projectId,
      })
      .from(tasks)
      .orderBy(desc(tasks.updatedAt))

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions))
    }

    // Пагинация
    const offset = (page - 1) * limit
    const result = await baseQuery.limit(limit).offset(offset)

    // Получаем связанные данные для каждой задачи (упрощенно)
    const tasksWithRelations = await Promise.all(
      result.map(async (task) => {
        const [assignee, reporter, project] = await Promise.all([
          task.assigneeId ? db.select().from(users).where(eq(users.id, task.assigneeId)).limit(1).then(r => r[0]) : null,
          db.select().from(users).where(eq(users.id, task.reporterId)).limit(1).then(r => r[0]),
          db.select().from(projects).where(eq(projects.id, task.projectId)).limit(1).then(r => r[0])
        ])

        // Создаем базовые объекты
        return {
          id: task.id,
          key: task.key,
          title: task.title,
          description: task.description || undefined,
          status: task.status,
          priority: task.priority,
          type: task.type,
          estimatedHours: task.estimatedHours || undefined,
          loggedHours: task.loggedHours || undefined,
          dueDate: task.dueDate || undefined,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assignee: assignee ? {
            id: assignee.id,
            telegramId: assignee.telegramId,
            firstName: assignee.firstName,
            lastName: assignee.lastName || undefined,
            username: assignee.username || undefined,
            avatarUrl: assignee.avatarUrl || undefined,
            createdAt: assignee.createdAt,
            updatedAt: assignee.updatedAt,
          } : undefined,
          reporter: reporter ? {
            id: reporter.id,
            telegramId: reporter.telegramId,
            firstName: reporter.firstName,
            lastName: reporter.lastName || undefined,
            username: reporter.username || undefined,
            avatarUrl: reporter.avatarUrl || undefined,
            createdAt: reporter.createdAt,
            updatedAt: reporter.updatedAt,
          } : {} as any,
          project: project ? {
            id: project.id,
            name: project.name,
            key: project.key,
            status: project.status,
            description: project.description || undefined,
            owner: {} as any, // Упростим пока
            membersCount: 0,
            tasksCount: 0,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          } : {} as any,
        } as Task
      })
    )

    // Общее количество для пагинации
    const totalResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const total = totalResult[0]?.count || 0

    return {
      data: tasksWithRelations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findById(id: string): Promise<Task | null> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1)

    if (result.length === 0) return null

    const task = result[0]

    // Получаем связанные данные
    const [assignee, reporter, project] = await Promise.all([
      task.assigneeId ? db.select().from(users).where(eq(users.id, task.assigneeId)).limit(1).then(r => r[0]) : null,
      db.select().from(users).where(eq(users.id, task.reporterId)).limit(1).then(r => r[0]),
      db.select().from(projects).where(eq(projects.id, task.projectId)).limit(1).then(r => r[0])
    ])

    return {
      id: task.id,
      key: task.key,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      type: task.type,
      estimatedHours: task.estimatedHours || undefined,
      loggedHours: task.loggedHours || undefined,
      dueDate: task.dueDate || undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignee: assignee ? {
        id: assignee.id,
        telegramId: assignee.telegramId,
        firstName: assignee.firstName,
        lastName: assignee.lastName || undefined,
        username: assignee.username || undefined,
        avatarUrl: assignee.avatarUrl || undefined,
        createdAt: assignee.createdAt,
        updatedAt: assignee.updatedAt,
      } : undefined,
      reporter: reporter ? {
        id: reporter.id,
        telegramId: reporter.telegramId,
        firstName: reporter.firstName,
        lastName: reporter.lastName || undefined,
        username: reporter.username || undefined,
        avatarUrl: reporter.avatarUrl || undefined,
        createdAt: reporter.createdAt,
        updatedAt: reporter.updatedAt,
      } : {} as any,
      project: project ? {
        id: project.id,
        name: project.name,
        key: project.key,
        status: project.status,
        description: project.description || undefined,
        owner: {} as any, // Упростим пока
        membersCount: 0,
        tasksCount: 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      } : {} as any,
    } as Task
  }

  async create(data: CreateTaskRequest, projectId: string, reporterId: string): Promise<Task> {
    console.log('TaskRepository.create called with:', { data, projectId, reporterId })

    const taskId = uuidv4()
    
    // Получаем проект для генерации ключа
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)
      .then(result => result[0])

    if (!project) {
      console.error('Проект не найден:', projectId)
      throw new Error('Проект не найден')
    }

    // Генерируем ключ задачи
    const taskCount = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .then(result => result[0]?.count || 0)

    const taskKey = `${project.key}-${taskCount + 1}`
    const now = new Date().toISOString()

    console.log('Creating task with key:', taskKey)

    try {
      await db.insert(tasks).values({
        id: taskId,
        key: taskKey,
        title: data.title,
        description: data.description || null,
        type: data.type,
        priority: data.priority,
        status: 'todo',
        projectId,
        assigneeId: data.assigneeId || null,
        reporterId,
        estimatedHours: data.estimatedHours || null,
        loggedHours: 0,
        dueDate: data.dueDate || null,
        createdAt: now,
        updatedAt: now,
      })

      console.log('Task created successfully:', taskId)
      
      const createdTask = await this.findById(taskId)
      if (!createdTask) {
        throw new Error('Не удалось получить созданную задачу')
      }
      
      return createdTask
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateTaskRequest): Promise<Task | null> {
    const now = new Date().toISOString()

    await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(tasks.id, id))

    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))

    return result.changes > 0
  }
}