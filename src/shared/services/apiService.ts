import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, BaseApiService, ApiError } from '../types/api'
import { eventBus } from './eventBus'

export interface ApiServiceInterface extends BaseApiService {}

class ApiService implements ApiServiceInterface {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        eventBus.emit('api.request.started', { 
          method: config.method, 
          url: config.url 
        }, 'ApiService')
        return config
      },
      (error) => {
        console.error('🌐 API Request Error:', error)
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`🌐 API Response: ${response.status} ${response.config.url}`)
        eventBus.emit('api.request.completed', { 
          status: response.status, 
          url: response.config.url 
        }, 'ApiService')
        return response
      },
      (error) => {
        console.error('🌐 API Response Error:', error.response?.data || error.message)
        eventBus.emit('api.request.failed', { 
          error: error.response?.data || error.message,
          url: error.config?.url 
        }, 'ApiService')
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || error.response.statusText,
        details: error.response.data
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - please check your connection',
        details: error.request
      }
    } else {
      // Something else happened
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(endpoint, { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(endpoint, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(endpoint, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(endpoint)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch (error) {
      return false
    }
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL
  }

  // Update base URL
  setBaseURL(url: string): void {
    this.baseURL = url
    this.client.defaults.baseURL = url
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export for dependency injection
export default ApiService