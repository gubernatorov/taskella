import { User } from "./auth"

export interface Comment {
  id: string
  content: string
  taskId: string
  author: User
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}