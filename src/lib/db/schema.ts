import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Таблица пользователей
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  telegramId: integer('telegram_id').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  username: text('username'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Таблица проектов
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  key: text('key').notNull().unique(),
  status: text('status', { enum: ['active', 'archived', 'suspended'] }).notNull().default('active'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Таблица задач
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { 
    enum: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'] 
  }).notNull().default('todo'),
  priority: text('priority', { 
    enum: ['lowest', 'low', 'medium', 'high', 'highest'] 
  }).notNull().default('medium'),
  type: text('type', { 
    enum: ['task', 'bug', 'feature', 'epic', 'story'] 
  }).notNull().default('task'),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  assigneeId: text('assignee_id').references(() => users.id),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  estimatedHours: real('estimated_hours'),
  loggedHours: real('logged_hours').default(0),
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Таблица участников проектов
export const projectMembers = sqliteTable('project_members', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'admin', 'developer', 'viewer'] }).notNull().default('developer'),
  joinedAt: text('joined_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Таблица комментариев
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Таблица вложений к задачам
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  uploadedById: text('uploaded_by_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
