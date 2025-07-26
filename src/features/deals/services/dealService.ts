import { ApiResponse, PaginatedResponse } from '../../../shared/types/api'
import { ApiServiceInterface } from '../../../shared/services/apiService'
import { EventBusInterface, EVENT_TYPES } from '../../../shared/services/eventBus'
import { Deal, CreateDealRequest, DealFilters, DealSummary } from '../types'

export interface DealServiceInterface {
  createDeal(dealData: CreateDealRequest): Promise<ApiResponse<Deal>>
  getDeals(filters?: DealFilters): Promise<PaginatedResponse<Deal>>
  getDeal(id: string): Promise<ApiResponse<Deal>>
  updateDeal(id: string, dealData: Partial<CreateDealRequest>): Promise<ApiResponse<Deal>>
  deleteDeal(id: string): Promise<ApiResponse<void>>
  getDealSummary(filters?: DealFilters): Promise<ApiResponse<DealSummary>>
}

class DealService implements DealServiceInterface {
  private readonly endpoint = '/deals'

  constructor(
    private apiService: ApiServiceInterface,
    private eventBus: EventBusInterface
  ) {}

  async createDeal(dealData: CreateDealRequest): Promise<ApiResponse<Deal>> {
    try {
      console.log('💼 DealService: Creating new deal', dealData)
      
      const response = await this.apiService.post<Deal>(this.endpoint, dealData)
      
      if (response.success && response.data) {
        // Emit event for other features to listen
        this.eventBus.emit(EVENT_TYPES.DEAL_CREATED, response.data, 'DealService')
        console.log('✅ DealService: Deal created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ DealService: Failed to create deal', error)
      this.eventBus.emit('deal.creation.failed', { error }, 'DealService')
      throw error
    }
  }

  async getDeals(filters?: DealFilters): Promise<PaginatedResponse<Deal>> {
    try {
      console.log('💼 DealService: Fetching deals', filters)
      
      const response = await this.apiService.get<Deal[]>(this.endpoint, filters)
      
      console.log('✅ DealService: Deals fetched successfully')
      return response as PaginatedResponse<Deal>
    } catch (error) {
      console.error('❌ DealService: Failed to fetch deals', error)
      throw error
    }
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    try {
      console.log('💼 DealService: Fetching deal', id)
      
      const response = await this.apiService.get<Deal>(`${this.endpoint}/${id}`)
      
      console.log('✅ DealService: Deal fetched successfully')
      return response
    } catch (error) {
      console.error('❌ DealService: Failed to fetch deal', error)
      throw error
    }
  }

  async updateDeal(id: string, dealData: Partial<CreateDealRequest>): Promise<ApiResponse<Deal>> {
    try {
      console.log('💼 DealService: Updating deal', id, dealData)
      
      const response = await this.apiService.put<Deal>(`${this.endpoint}/${id}`, dealData)
      
      if (response.success && response.data) {
        this.eventBus.emit(EVENT_TYPES.DEAL_UPDATED, response.data, 'DealService')
        console.log('✅ DealService: Deal updated successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ DealService: Failed to update deal', error)
      throw error
    }
  }

  async deleteDeal(id: string): Promise<ApiResponse<void>> {
    try {
      console.log('💼 DealService: Deleting deal', id)
      
      const response = await this.apiService.delete<void>(`${this.endpoint}/${id}`)
      
      if (response.success) {
        this.eventBus.emit(EVENT_TYPES.DEAL_DELETED, { id }, 'DealService')
        console.log('✅ DealService: Deal deleted successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ DealService: Failed to delete deal', error)
      throw error
    }
  }

  async getDealSummary(filters?: DealFilters): Promise<ApiResponse<DealSummary>> {
    try {
      console.log('💼 DealService: Fetching deal summary', filters)
      
      const response = await this.apiService.get<DealSummary>(`${this.endpoint}/summary`, filters)
      
      console.log('✅ DealService: Deal summary fetched successfully')
      return response
    } catch (error) {
      console.error('❌ DealService: Failed to fetch deal summary', error)
      throw error
    }
  }
}

// Export class for dependency injection
export default DealService

// Temporary backward compatibility without DI container to avoid circular dependency
import { apiService } from '../../../shared/services/apiService'
import { eventBus } from '../../../shared/services/eventBus'

export const dealService = new DealService(apiService, eventBus)