import { ApiResponse } from '../../../shared/types/api'
import { ApiServiceInterface } from '../../../shared/services/apiService'
import { EventBusInterface } from '../../../shared/services/eventBus'
import { Deal } from '../../deals/types'

export interface InventoryItem {
  id: string
  productCode: string
  grade: string
  company: string
  specificGrade: string
  quantity: number
  rate: number
  purchaseParty: string
  dateAdded: string
  createdAt: Date
}

export interface CreateInventoryRequest {
  productCode: string
  grade: string
  company: string
  specificGrade: string
  quantity: number
  rate: number
  purchaseParty: string
  dateAdded: string
}

export interface InventoryServiceInterface {
  getAllInventory(): Promise<ApiResponse<InventoryItem[]>>
  getInventoryItem(id: string): Promise<ApiResponse<InventoryItem>>
  createInventoryItem(item: CreateInventoryRequest): Promise<ApiResponse<InventoryItem>>
  updateInventoryItem(id: string, item: Partial<CreateInventoryRequest>): Promise<ApiResponse<InventoryItem>>
  deleteInventoryItem(id: string): Promise<ApiResponse<void>>
  addRemainingStock(deal: Deal): Promise<ApiResponse<InventoryItem | null>>
  deductFromInventory(productCode: string, grade: string, company: string, specificGrade: string, quantity: number): Promise<ApiResponse<boolean>>
}

class InventoryService implements InventoryServiceInterface {
  private readonly endpoint = '/inventory'

  constructor(
    private apiService: ApiServiceInterface,
    private eventBus: EventBusInterface
  ) {}

  async getAllInventory(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      console.log('📦 InventoryService: Fetching all inventory items')
      const response = await this.apiService.get<InventoryItem[]>(this.endpoint)
      console.log('✅ InventoryService: Inventory items fetched successfully')
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to fetch inventory items', error)
      throw error
    }
  }

  async getInventoryItem(id: string): Promise<ApiResponse<InventoryItem>> {
    try {
      console.log('📦 InventoryService: Fetching inventory item', id)
      const response = await this.apiService.get<InventoryItem>(`${this.endpoint}/${id}`)
      console.log('✅ InventoryService: Inventory item fetched successfully')
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to fetch inventory item', error)
      throw error
    }
  }

  async createInventoryItem(item: CreateInventoryRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      console.log('📦 InventoryService: Creating inventory item', item)
      const response = await this.apiService.post<InventoryItem>(this.endpoint, item)
      
      if (response.success && response.data) {
        this.eventBus.emit('inventory.item.created', response.data, 'InventoryService')
        console.log('✅ InventoryService: Inventory item created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to create inventory item', error)
      throw error
    }
  }

  async updateInventoryItem(id: string, item: Partial<CreateInventoryRequest>): Promise<ApiResponse<InventoryItem>> {
    try {
      console.log('📦 InventoryService: Updating inventory item', id, item)
      const response = await this.apiService.put<InventoryItem>(`${this.endpoint}/update`, { id, ...item })
      
      if (response.success && response.data) {
        this.eventBus.emit('inventory.item.updated', response.data, 'InventoryService')
        console.log('✅ InventoryService: Inventory item updated successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to update inventory item', error)
      throw error
    }
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse<void>> {
    try {
      console.log('📦 InventoryService: Deleting inventory item', id)
      const response = await this.apiService.delete<void>(`${this.endpoint}/remove/${id}`)
      
      if (response.success) {
        this.eventBus.emit('inventory.item.deleted', { id }, 'InventoryService')
        console.log('✅ InventoryService: Inventory item deleted successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to delete inventory item', error)
      throw error
    }
  }

  async addRemainingStock(deal: Deal): Promise<ApiResponse<InventoryItem | null>> {
    try {
      console.log('📦 InventoryService: Adding remaining stock from deal', deal.id)
      
      // Calculate remaining quantity
      const remainingQuantity = deal.purchaseQuantity - deal.quantitySold
      
      if (remainingQuantity <= 0) {
        console.log('ℹ️  No remaining stock to add (sold quantity >= purchased quantity)')
        return { success: true, data: null }
      }
      
      // Create inventory item for remaining stock
      const inventoryItem: CreateInventoryRequest = {
        productCode: deal.productCode,
        grade: deal.grade,
        company: deal.company,
        specificGrade: deal.specificGrade,
        quantity: remainingQuantity,
        rate: deal.purchaseRate,
        purchaseParty: deal.purchaseParty,
        dateAdded: deal.date
      }
      
      const response = await this.createInventoryItem(inventoryItem)
      
      if (response.success) {
        console.log(`✅ Added ${remainingQuantity}kg to inventory from deal ${deal.id}`)
        this.eventBus.emit('inventory.stock.added', { deal, inventoryItem: response.data }, 'InventoryService')
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to add remaining stock', error)
      throw error
    }
  }

  async getAvailableInventoryItems(productCode: string, grade: string, company: string, specificGrade: string): Promise<ApiResponse<InventoryItem[]>> {
    try {
      console.log(`📦 InventoryService: Fetching available inventory items for ${productCode}`)
      
      const response = await this.apiService.get<InventoryItem[]>(`${this.endpoint}/available/${productCode}/${grade}/${company}/${specificGrade}`)
      
      if (response.success) {
        console.log(`✅ Found ${response.data?.length || 0} available inventory items`)
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to fetch available inventory items', error)
      throw error
    }
  }

  async deductFromInventory(productCode: string, grade: string, company: string, specificGrade: string, quantity: number): Promise<ApiResponse<boolean>> {
    try {
      console.log(`📦 InventoryService: Deducting ${quantity} from ${productCode}`)
      const response = await this.apiService.post<boolean>(`${this.endpoint}/deduct`, {
        productCode,
        grade,
        company,
        specificGrade,
        quantity
      })
      if (response.success && response.data) {
        this.eventBus.emit('inventory.stock.deducted', { productCode, quantity }, 'InventoryService')
        console.log(`✅ Successfully deducted from inventory`)
      }
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to deduct from inventory', error)
      throw error
    }
  }

  async deductFromSelectedInventoryItems(selectedItems: Array<{id: string, quantity: number}>): Promise<ApiResponse<boolean>> {
    try {
      console.log(`📦 InventoryService: Deducting from ${selectedItems.length} selected inventory items`)
      
      const response = await this.apiService.post<boolean>(`${this.endpoint}/deduct-selected`, {
        selectedItems
      })
      
      if (response.success && response.data) {
        const totalDeducted = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
        this.eventBus.emit('inventory.selected.deducted', { selectedItems, totalDeducted }, 'InventoryService')
        console.log(`✅ Successfully deducted from selected inventory items`)
      }
      
      return response
    } catch (error) {
      console.error('❌ InventoryService: Failed to deduct from selected inventory items', error)
      throw error
    }
  }
}

// Export class for dependency injection
export default InventoryService

// Temporary backward compatibility without DI container to avoid circular dependency
import { apiService } from '../../../shared/services/apiService'
import { eventBus } from '../../../shared/services/eventBus'

export const inventoryService = new InventoryService(apiService, eventBus)