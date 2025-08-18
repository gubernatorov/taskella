const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api')

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    console.log('API Client initialized with baseURL:', baseURL)
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    }

    console.log('API request:', { url, config })

    try {
      const response = await fetch(url, config)
      
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error response:', errorData)
        // Создаем объект ошибки с дополнительной информацией
        const error = new Error(errorData.message || `HTTP ${response.status}`)
        // Добавляем код ошибки в объект ошибки
        if (errorData.code) {
          (error as any).code = errorData.code
        }
        throw error
      }

      const data = await response.json()
      console.log('API response data:', data)
      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      
      // Улучшенная обработка ошибок для продакшн-режима
      if (error instanceof Error && error.message === 'Failed to fetch') {
        // Создаем более информативную ошибку для сетевых проблем
        const networkError = new Error('Сетевая ошибка: сервер недоступен')
        ;(networkError as any).code = 'NETWORK_ERROR'
        ;(networkError as any).isNetworkError = true
        throw networkError
      }
      
      throw error
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)