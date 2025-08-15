import { db } from '../connection'
import { attachments, users } from '../schema'
import { eq, desc } from 'drizzle-orm'
import { Attachment, CreateAttachmentRequest } from '@/types/attachment'
import { v4 as uuidv4 } from 'uuid'

export class AttachmentRepository {
  async findByTaskId(taskId: string): Promise<Attachment[]> {
    const result = await db
      .select({
        id: attachments.id,
        fileName: attachments.fileName,
        originalName: attachments.originalName,
        fileSize: attachments.fileSize,
        mimeType: attachments.mimeType,
        taskId: attachments.taskId,
        uploadedById: attachments.uploadedById,
        createdAt: attachments.createdAt,
      })
      .from(attachments)
      .where(eq(attachments.taskId, taskId))
      .orderBy(desc(attachments.createdAt))

    // Получаем пользователей, которые загрузили файлы
    const attachmentsWithUsers = await Promise.all(
      result.map(async (attachment) => {
        const uploadedBy = await db
          .select()
          .from(users)
          .where(eq(users.id, attachment.uploadedById))
          .limit(1)
          .then(r => r[0])

        return {
          id: attachment.id,
          fileName: attachment.fileName,
          originalName: attachment.originalName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          taskId: attachment.taskId,
          createdAt: attachment.createdAt,
          uploadedBy: {
            id: uploadedBy.id,
            telegramId: uploadedBy.telegramId,
            firstName: uploadedBy.firstName,
            lastName: uploadedBy.lastName || undefined,
            username: uploadedBy.username || undefined,
            avatarUrl: uploadedBy.avatarUrl || undefined,
            createdAt: uploadedBy.createdAt,
            updatedAt: uploadedBy.updatedAt,
          }
        } as Attachment
      })
    )

    return attachmentsWithUsers
  }

  async findById(id: string): Promise<Attachment | null> {
    const result = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1)

    if (result.length === 0) return null

    const attachment = result[0]
    
    const uploadedBy = await db
      .select()
      .from(users)
      .where(eq(users.id, attachment.uploadedById))
      .limit(1)
      .then(r => r[0])

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      taskId: attachment.taskId,
      createdAt: attachment.createdAt,
      uploadedBy: {
        id: uploadedBy.id,
        telegramId: uploadedBy.telegramId,
        firstName: uploadedBy.firstName,
        lastName: uploadedBy.lastName || undefined,
        username: uploadedBy.username || undefined,
        avatarUrl: uploadedBy.avatarUrl || undefined,
        createdAt: uploadedBy.createdAt,
        updatedAt: uploadedBy.updatedAt,
      }
    } as Attachment
  }

  async create(taskId: string, uploadedById: string, data: CreateAttachmentRequest): Promise<Attachment> {
    const attachmentId = uuidv4()
    const now = new Date().toISOString()

    await db.insert(attachments).values({
      id: attachmentId,
      fileName: data.fileName,
      originalName: data.originalName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      taskId,
      uploadedById,
      createdAt: now,
    })

    const createdAttachment = await this.findById(attachmentId)
    if (!createdAttachment) {
      throw new Error('Не удалось получить созданное вложение')
    }

    return createdAttachment
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(attachments)
      .where(eq(attachments.id, id))

    return result.changes > 0
  }

  async countByTaskId(taskId: string): Promise<number> {
    const result = await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, taskId))
      
    return result.length
  }
}