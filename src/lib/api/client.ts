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
    const timestamp = new Date().toISOString()
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    }

    console.log(`🌐 [${timestamp}] API REQUEST:`)
    console.log(`  - URL: ${url}`)
    console.log(`  - Method: ${config.method || 'GET'}`)
    console.log(`  - Headers:`, config.headers)
    console.log(`  - Body: ${config.body && typeof config.body === 'string' ? config.body.substring(0, 200) + '...' : config.body ? 'Non-string body' : 'None'}`)

    try {
      const response = await fetch(url, config)
      
      console.log(`📡 [${timestamp}] API RESPONSE:`)
      console.log(`  - Status: ${response.status} ${response.statusText}`)
      console.log(`  - OK: ${response.ok}`)
      console.log(`  - Headers:`, Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ [${timestamp}] API ERROR RESPONSE:`)
        console.error(`  - Status: ${response.status} ${response.statusText}`)
        console.error(`  - Error Data:`, errorData)
        console.error(`  - Error Code: ${errorData.code || 'UNKNOWN'}`)
        console.error(`  - Error Message: ${errorData.message || 'Unknown error'}`)
        
        // Создаем объект ошибки с дополнительной информацией
        const error = new Error(errorData.message || `HTTP ${response.status}`)
        // Добавляем код ошибки в объект ошибки
        if (errorData.code) {
          (error as any).code = errorData.code
        }
        throw error
      }

      const data = await response.json()
      console.log(`✅ [${timestamp}] API SUCCESS RESPONSE:`)
      console.log(`  - Data Type: ${Array.isArray(data) ? 'Array' : typeof data}`)
      console.log(`  - Data Preview: ${JSON.stringify(data).substring(0, 200) + '...'}`)
      return data
    } catch (error) {
      const errorTimestamp = new Date().toISOString()
      console.error(`❌ [${errorTimestamp}] API REQUEST FAILED: ${endpoint}`)
      console.error(`  - Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`)
      console.error(`  - Error Message: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error(`  - Error Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
      
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