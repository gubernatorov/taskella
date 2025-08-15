import { NextRequest, NextResponse } from 'next/server'
import { AttachmentRepository } from '@/lib/db/repositories/attachmentRepository'
import { CreateAttachmentRequest } from '@/types/attachment'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const attachmentRepo = new AttachmentRepository()

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const attachments = await attachmentRepo.findByTaskId(params.id)
    return NextResponse.json(attachments)
  } catch (error) {
    console.error('API /tasks/[id]/attachments GET error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения вложений', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден', code: 'FILE_REQUIRED' },
        { status: 400 }
      )
    }

    // Генерируем уникальное имя файла
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Сохраняем файл в public/uploads
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Создаем директорию если не существует
    const uploadDir = join(process.cwd(), 'public/uploads')
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // В реальном приложении здесь должна быть проверка авторизации
    // Пока используем заглушку для uploadedById
    const uploadedById = 'user_1' // TODO: получить из сессии/токена
    
    const attachmentData: CreateAttachmentRequest = {
      fileName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }
    
    const attachment = await attachmentRepo.create(params.id, uploadedById, attachmentData)
    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('API /tasks/[id]/attachments POST error:', error)
    return NextResponse.json(
      { message: 'Ошибка загрузки файла', code: 'UPLOAD_ERROR' },
      { status: 500 }
    )
  }
}