import { db } from '../connection'
import { comments, users } from '../schema'
import { eq, desc, sql } from 'drizzle-orm'
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/comment'
import { v4 as uuidv4 } from 'uuid'

export class CommentRepository {
  async findByTaskId(taskId: string): Promise<Comment[]> {
    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        taskId: comments.taskId,
        authorId: comments.authorId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .where(eq(comments.taskId, taskId))
      .orderBy(desc(comments.createdAt))

    // Получаем авторов комментариев
    const commentsWithAuthors = await Promise.all(
      result.map(async (comment) => {
        const author = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.authorId))
          .limit(1)
          .then(r => r[0])

        return {
          id: comment.id,
          content: comment.content,
          taskId: comment.taskId,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: {
            id: author.id,
            telegramId: author.telegramId,
            firstName: author.firstName,
            lastName: author.lastName || undefined,
            username: author.username || undefined,
            avatarUrl: author.avatarUrl || undefined,
            createdAt: author.createdAt,
            updatedAt: author.updatedAt,
          }
        } as Comment
      })
    )

    return commentsWithAuthors
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (result.length === 0) return null

    const comment = result[0]
    
    const author = await db
      .select()
      .from(users)
      .where(eq(users.id, comment.authorId))
      .limit(1)
      .then(r => r[0])

    return {
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: author.id,
        telegramId: author.telegramId,
        firstName: author.firstName,
        lastName: author.lastName || undefined,
        username: author.username || undefined,
        avatarUrl: author.avatarUrl || undefined,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
      }
    } as Comment
  }

  async create(taskId: string, authorId: string, data: CreateCommentRequest): Promise<Comment> {
    const commentId = uuidv4()
    const now = new Date().toISOString()

    await db.insert(comments).values({
      id: commentId,
      content: data.content,
      taskId,
      authorId,
      createdAt: now,
      updatedAt: now,
    })

    const createdComment = await this.findById(commentId)
    if (!createdComment) {
      throw new Error('Не удалось получить созданный комментарий')
    }

    return createdComment
  }

  async update(id: string, data: UpdateCommentRequest): Promise<Comment | null> {
    const now = new Date().toISOString()

    await db
      .update(comments)
      .set({
        content: data.content,
        updatedAt: now,
      })
      .where(eq(comments.id, id))

    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))

    return result.changes > 0
  }

  async countByTaskId(taskId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.taskId, taskId))
      
    return result[0]?.count || 0
  }
}