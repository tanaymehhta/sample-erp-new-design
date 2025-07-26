import { container } from './container'

// Backward compatibility layer for existing singleton imports
// This allows gradual migration without breaking existing code

// Export singleton instances that use DI under the hood
export const dealService = {
  get instance() {
    return container.get('dealService')
  }
}

export const customerService = {
  get instance() {
    return container.get('customerService')
  }
}

export const inventoryService = {
  get instance() {
    return container.get('inventoryService')
  }
}

export const apiService = {
  get instance() {
    return container.get('apiService')
  }
}

export const eventBus = {
  get instance() {
    return container.get('eventBus')
  }
}

// Legacy exports for backward compatibility
// These can be gradually replaced with proper DI
export const legacyDealService = dealService.instance
export const legacyCustomerService = customerService.instance
export const legacyInventoryService = inventoryService.instance
export const legacyApiService = apiService.instance
export const legacyEventBus = eventBus.instance

// Modern DI exports
export { container, getService, createTestContainer } from './container'