import { User } from "./auth"

export interface Attachment {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  taskId: string
  uploadedBy: User
  createdAt: string
}

export interface CreateAttachmentRequest {
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
}