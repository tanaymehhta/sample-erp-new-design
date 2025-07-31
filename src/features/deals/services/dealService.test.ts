import DealServiceClass from './dealService' // Import the class directly
import { ApiResponse, PaginatedResponse } from '../../../shared/types/api'
import { Deal, CreateDealRequest, DealFilters } from '../types'
import { createTestContainer } from '../../../shared/di/container'

// Mock dependencies
const mockApiService = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

const mockEventBus = {
  emit: jest.fn(),
  subscribe: jest.fn(),
  getEventHistory: jest.fn(),
  clearHistory: jest.fn(),
  getSubscriptions: jest.fn(),
}

describe('DealService', () => {
  let dealService: DealServiceClass // Use the imported class as a type
  let container: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Create test container with mocked dependencies
    container = createTestContainer()
    container.clear()
    
    // Register mocked services
    container.register('apiService', () => mockApiService)
    container.register('eventBus', () => mockEventBus)
    container.register('dealService', (c: any) => new DealServiceClass(c.get('apiService'), c.get('eventBus')))
    
    dealService = container.get('dealService')
  })

  describe('createDeal', () => {
    it('should create deal without affecting other features', async () => {
      const dealData: CreateDealRequest = {
        date: '01-01-2024',
        saleParty: 'Test Customer',
        quantitySold: 100,
        saleRate: 50,
        purchaseParty: 'Test Supplier',
        purchaseQuantity: 100,
        purchaseRate: 45,
        saleSource: 'new',
        productCode: 'PVC',
        grade: 'A',
        company: 'Test',
        specificGrade: 'A1',
        deliveryTerms: 'delivered'
      }

      const mockDeal: Deal = { id: '1', ...dealData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), grade: dealData.grade || '', company: dealData.company || '', specificGrade: dealData.specificGrade || '' }
      const mockResponse: ApiResponse<Deal> = {
        success: true,
        data: mockDeal,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await dealService.createDeal(dealData)

      expect(mockApiService.post).toHaveBeenCalledWith('/deals', dealData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('deal.created', mockDeal, 'DealService')
      expect(result).toEqual(mockResponse)
    })

    it('should handle deal creation failure without side effects', async () => {
      const dealData: CreateDealRequest = {
        date: '01-01-2024',
        saleParty: 'Test Customer',
        quantitySold: 100,
        saleRate: 50,
        purchaseParty: 'Test Supplier',
        purchaseQuantity: 100,
        purchaseRate: 45,
        saleSource: 'new',
        productCode: 'PVC',
        grade: 'A',
        company: 'Test',
        specificGrade: 'A1',
        deliveryTerms: 'delivered'
      }

      const error = new Error('API Error')
      mockApiService.post.mockRejectedValue(error)

      await expect(dealService.createDeal(dealData)).rejects.toThrow('API Error')
      expect(mockEventBus.emit).toHaveBeenCalledWith('deal.creation.failed', { error }, 'DealService')
    })
  })

  describe('getDeals', () => {
    it('should fetch deals without affecting other features', async () => {
      const mockDeals: Deal[] = [
        { id: '1', date: '01-01-2024', saleParty: 'Customer 1', quantitySold: 100, saleRate: 50, productCode: 'PVC', grade: 'A', company: 'Test', specificGrade: 'A1', purchaseParty: 'S1', purchaseQuantity: 100, purchaseRate: 45, saleSource: 'new', deliveryTerms: 'delivered', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', date: '02-01-2024', saleParty: 'Customer 2', quantitySold: 200, saleRate: 60, productCode: 'HDPE', grade: 'B', company: 'Test2', specificGrade: 'B2', purchaseParty: 'S2', purchaseQuantity: 200, purchaseRate: 55, saleSource: 'inventory', deliveryTerms: 'pickup', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]
      
      const mockResponse: PaginatedResponse<Deal> = {
        success: true,
        data: mockDeals,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await dealService.getDeals()

      expect(mockApiService.get).toHaveBeenCalledWith('/deals', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should fetch deals with filters', async () => {
      const filters: DealFilters = { productCode: 'PVC', dateFrom: '01-01-2024' }
      const mockResponse: PaginatedResponse<Deal> = {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      await dealService.getDeals(filters)

      expect(mockApiService.get).toHaveBeenCalledWith('/deals', filters)
    })
  })

  describe('updateDeal', () => {
    it('should update deal and emit event', async () => {
      const dealId = '1'
      const updateData: Partial<Deal> = { quantitySold: 150 }
      const mockUpdatedDeal: Deal = { 
        id: dealId, 
        date: '01-01-2024', 
        saleParty: 'Customer', 
        quantitySold: 150, 
        saleRate: 50, 
        productCode: 'PVC', 
        grade: 'A', 
        company: 'Test', 
        specificGrade: 'A1', 
        purchaseParty: 'S1', 
        purchaseQuantity: 150, 
        purchaseRate: 45, 
        saleSource: 'new', 
        deliveryTerms: 'delivered', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      }
      
      const mockResponse: ApiResponse<Deal> = {
        success: true,
        data: mockUpdatedDeal,
      }

      mockApiService.put.mockResolvedValue(mockResponse)

      const result = await dealService.updateDeal(dealId, updateData)

      expect(mockApiService.put).toHaveBeenCalledWith('/deals/1', updateData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('deal.updated', mockUpdatedDeal, 'DealService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteDeal', () => {
    it('should delete deal and emit event', async () => {
      const dealId = '1'
      const mockResponse: ApiResponse<void> = { success: true }

      mockApiService.delete.mockResolvedValue(mockResponse)

      const result = await dealService.deleteDeal(dealId)

      expect(mockApiService.delete).toHaveBeenCalledWith('/deals/1')
      expect(mockEventBus.emit).toHaveBeenCalledWith('deal.deleted', { id: dealId }, 'DealService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('feature isolation', () => {
    it('should operate independently without affecting analytics feature', async () => {
      const dealData: CreateDealRequest = {
        date: '01-01-2024',
        saleParty: 'Test Customer',
        quantitySold: 100,
        saleRate: 50,
        purchaseParty: 'Test Supplier',
        purchaseQuantity: 100,
        purchaseRate: 45,
        saleSource: 'new',
        productCode: 'PVC',
        grade: 'A',
        company: 'Test',
        specificGrade: 'A1',
        deliveryTerms: 'delivered'
      }

      const mockResponse: ApiResponse<Deal> = {
        success: true,
        data: { id: '1', ...dealData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), grade: dealData.grade || '', company: dealData.company || '', specificGrade: dealData.specificGrade || '' },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await dealService.createDeal(dealData)

      // Verify only deal-specific endpoints are called
      expect(mockApiService.post).toHaveBeenCalledWith('/deals', dealData)
      expect(mockApiService.post).not.toHaveBeenCalledWith('/analytics', expect.any(Object))
    })

    it('should not directly modify customer or inventory data', async () => {
      const dealData: CreateDealRequest = {
        date: '01-01-2024',
        saleParty: 'Test Customer',
        quantitySold: 100,
        saleRate: 50,
        purchaseParty: 'Test Supplier',
        purchaseQuantity: 100,
        purchaseRate: 45,
        saleSource: 'new',
        productCode: 'PVC',
        grade: 'A',
        company: 'Test',
        specificGrade: 'A1',
        deliveryTerms: 'delivered'
      }

      const mockResponse: ApiResponse<Deal> = {
        success: true,
        data: { id: '1', ...dealData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), grade: dealData.grade || '', company: dealData.company || '', specificGrade: dealData.specificGrade || '' },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await dealService.createDeal(dealData)

      // Verify no direct calls to other feature endpoints
      expect(mockApiService.post).not.toHaveBeenCalledWith('/customers', expect.any(Object))
      expect(mockApiService.post).not.toHaveBeenCalledWith('/inventory', expect.any(Object))
    })
  })
})
