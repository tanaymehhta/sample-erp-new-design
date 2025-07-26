import { InventoryService } from './inventoryService'
import { ApiResponse } from '../../../shared/types/api'

// Mock types for inventory
interface InventoryItem {
  id: string
  material: string
  quantity: number
  rate: number
  purchaseParty: string
  warehouse?: string
}

interface CreateInventoryRequest {
  material: string
  quantity: number
  rate: number
  purchaseParty: string
  warehouse?: string
}

interface InventoryFilters {
  material?: string
  warehouse?: string
  minQuantity?: number
}

interface InventorySummary {
  totalItems: number
  totalValue: number
  lowStockItems: number
}

// Mock dependencies
const mockApiService = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

const mockEventBus = {
  emit: jest.fn(),
}

// Mock the imports
jest.mock('../../../shared/services/apiService', () => ({
  apiService: mockApiService,
}))

jest.mock('../../../shared/services/eventBus', () => ({
  eventBus: mockEventBus,
  EVENT_TYPES: {
    INVENTORY_UPDATED: 'inventory.updated',
    INVENTORY_LOW_STOCK: 'inventory.low_stock',
  },
}))

describe('InventoryService', () => {
  let inventoryService: InventoryService
  
  beforeEach(() => {
    inventoryService = new InventoryService()
    jest.clearAllMocks()
  })

  describe('getInventory', () => {
    it('should fetch inventory without affecting other features', async () => {
      const mockInventory: InventoryItem[] = [
        { id: '1', material: 'PVC', quantity: 100, rate: 45, purchaseParty: 'Supplier A' },
        { id: '2', material: 'HDPE', quantity: 200, rate: 50, purchaseParty: 'Supplier B' },
      ]
      
      const mockResponse: ApiResponse<InventoryItem[]> = {
        success: true,
        data: mockInventory,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await inventoryService.getInventory()

      expect(mockApiService.get).toHaveBeenCalledWith('/inventory', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should fetch inventory with filters', async () => {
      const filters: InventoryFilters = { material: 'PVC', minQuantity: 50 }
      const mockResponse: ApiResponse<InventoryItem[]> = {
        success: true,
        data: [],
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      await inventoryService.getInventory(filters)

      expect(mockApiService.get).toHaveBeenCalledWith('/inventory', filters)
    })
  })

  describe('getInventoryItem', () => {
    it('should fetch specific inventory item by ID', async () => {
      const itemId = '1'
      const mockItem: InventoryItem = { 
        id: itemId, 
        material: 'PVC', 
        quantity: 100, 
        rate: 45, 
        purchaseParty: 'Supplier A' 
      }
      
      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: mockItem,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await inventoryService.getInventoryItem(itemId)

      expect(mockApiService.get).toHaveBeenCalledWith('/inventory/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createInventoryItem', () => {
    it('should create inventory item and emit event without affecting deals feature', async () => {
      const inventoryData: CreateInventoryRequest = {
        material: 'PVC',
        quantity: 100,
        rate: 45,
        purchaseParty: 'Supplier A',
        warehouse: 'Warehouse 1',
      }

      const mockItem: InventoryItem = { id: '1', ...inventoryData }
      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: mockItem,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await inventoryService.createInventoryItem(inventoryData)

      expect(mockApiService.post).toHaveBeenCalledWith('/inventory', inventoryData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('inventory.item.created', mockItem, 'InventoryService')
      expect(result).toEqual(mockResponse)
    })

    it('should handle inventory creation failure', async () => {
      const inventoryData: CreateInventoryRequest = {
        material: 'PVC',
        quantity: 100,
        rate: 45,
        purchaseParty: 'Supplier A',
      }

      const error = new Error('Validation error')
      mockApiService.post.mockRejectedValue(error)

      await expect(inventoryService.createInventoryItem(inventoryData)).rejects.toThrow('Validation error')
    })
  })

  describe('updateInventoryItem', () => {
    it('should update inventory item and emit event', async () => {
      const itemId = '1'
      const updateData: Partial<CreateInventoryRequest> = { quantity: 150 }
      const mockUpdatedItem: InventoryItem = { 
        id: itemId, 
        material: 'PVC', 
        quantity: 150, 
        rate: 45, 
        purchaseParty: 'Supplier A' 
      }
      
      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: mockUpdatedItem,
      }

      mockApiService.put.mockResolvedValue(mockResponse)

      const result = await inventoryService.updateInventoryItem(itemId, updateData)

      expect(mockApiService.put).toHaveBeenCalledWith('/inventory/1', updateData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('inventory.updated', mockUpdatedItem, 'InventoryService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteInventoryItem', () => {
    it('should delete inventory item and emit event', async () => {
      const itemId = '1'
      const mockResponse: ApiResponse<void> = { success: true }

      mockApiService.delete.mockResolvedValue(mockResponse)

      const result = await inventoryService.deleteInventoryItem(itemId)

      expect(mockApiService.delete).toHaveBeenCalledWith('/inventory/1')
      expect(mockEventBus.emit).toHaveBeenCalledWith('inventory.item.deleted', { id: itemId }, 'InventoryService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getInventorySummary', () => {
    it('should fetch inventory summary without side effects', async () => {
      const mockSummary: InventorySummary = {
        totalItems: 10,
        totalValue: 50000,
        lowStockItems: 2,
      }
      
      const mockResponse: ApiResponse<InventorySummary> = {
        success: true,
        data: mockSummary,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await inventoryService.getInventorySummary()

      expect(mockApiService.get).toHaveBeenCalledWith('/inventory/summary')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('checkStockLevels', () => {
    it('should validate stock levels and emit low stock warnings', async () => {
      const mockLowStockItems: InventoryItem[] = [
        { id: '1', material: 'PVC', quantity: 5, rate: 45, purchaseParty: 'Supplier A' },
      ]
      
      const mockResponse: ApiResponse<InventoryItem[]> = {
        success: true,
        data: mockLowStockItems,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await inventoryService.checkStockLevels()

      expect(mockApiService.get).toHaveBeenCalledWith('/inventory/low-stock')
      expect(mockEventBus.emit).toHaveBeenCalledWith('inventory.low_stock', mockLowStockItems, 'InventoryService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('feature isolation', () => {
    it('should operate independently without affecting customer feature', async () => {
      const inventoryData: CreateInventoryRequest = {
        material: 'Test Material',
        quantity: 100,
        rate: 45,
        purchaseParty: 'Test Supplier',
      }

      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: { id: '1', ...inventoryData },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await inventoryService.createInventoryItem(inventoryData)

      // Verify only inventory-specific endpoints are called
      expect(mockApiService.post).toHaveBeenCalledWith('/inventory', inventoryData)
      expect(mockApiService.post).not.toHaveBeenCalledWith('/customers', expect.any(Object))
    })

    it('should not directly modify deals or analytics data', async () => {
      const itemId = '1'
      const updateData: Partial<CreateInventoryRequest> = { quantity: 150 }

      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: { id: itemId, material: 'PVC', quantity: 150, rate: 45, purchaseParty: 'Supplier A' },
      }

      mockApiService.put.mockResolvedValue(mockResponse)

      await inventoryService.updateInventoryItem(itemId, updateData)

      // Verify no direct calls to other feature endpoints
      expect(mockApiService.put).not.toHaveBeenCalledWith('/deals', expect.any(Object))
      expect(mockApiService.put).not.toHaveBeenCalledWith('/analytics', expect.any(Object))
    })

    it('should use events for cross-feature communication', async () => {
      const inventoryData: CreateInventoryRequest = {
        material: 'Event Test Material',
        quantity: 100,
        rate: 45,
        purchaseParty: 'Test Supplier',
      }

      const mockItem: InventoryItem = { id: '1', ...inventoryData }
      const mockResponse: ApiResponse<InventoryItem> = {
        success: true,
        data: mockItem,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await inventoryService.createInventoryItem(inventoryData)

      // Verify event emission for loose coupling
      expect(mockEventBus.emit).toHaveBeenCalledWith('inventory.item.created', mockItem, 'InventoryService')
    })
  })
})