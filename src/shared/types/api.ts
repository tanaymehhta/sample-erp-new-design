// Shared API interfaces and types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Base API service interface
export interface BaseApiService {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  delete<T>(endpoint: string): Promise<ApiResponse<T>>
}

// Event system types
export interface SystemEvent {
  type: string
  payload: any
  timestamp: Date
  source: string
}

export interface EventSubscriber {
  eventType: string
  callback: (event: SystemEvent) => void
}

// Common entity types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}