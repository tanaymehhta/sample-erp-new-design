import { DealServiceInterface } from '../../features/deals/services/dealService'
import { CustomerServiceInterface } from '../../features/customers/services/customerService'
import { InventoryServiceInterface } from '../../features/inventory/services/inventoryService'
import { ApiServiceInterface } from '../services/apiService'
import { EventBusInterface } from '../services/eventBus'

// Service registry type
export type ServiceRegistry = {
  apiService: ApiServiceInterface
  eventBus: EventBusInterface
  dealService: DealServiceInterface
  customerService: CustomerServiceInterface
  inventoryService: InventoryServiceInterface
}

// Service factory functions
export type ServiceFactory<T> = (container: DIContainer) => T

// Dependency injection container
export class DIContainer {
  private services = new Map<keyof ServiceRegistry, any>()
  private factories = new Map<keyof ServiceRegistry, ServiceFactory<any>>()

  // Register a service factory
  register<K extends keyof ServiceRegistry>(
    name: K,
    factory: ServiceFactory<ServiceRegistry[K]>
  ): void {
    this.factories.set(name, factory)
  }

  // Get a service instance (singleton per container)
  get<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
    if (this.services.has(name)) {
      return this.services.get(name)
    }

    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Service '${String(name)}' not registered`)
    }

    const instance = factory(this)
    this.services.set(name, instance)
    return instance
  }

  // Check if service is registered
  has<K extends keyof ServiceRegistry>(name: K): boolean {
    return this.factories.has(name)
  }

  // Clear all services (useful for testing)
  clear(): void {
    this.services.clear()
  }

  // Create a child container (inherits factories)
  createChild(): DIContainer {
    const child = new DIContainer()
    this.factories.forEach((factory, name) => {
      child.factories.set(name, factory)
    })
    return child
  }
}

// Default container instance
export const container = new DIContainer()

// Import services at the top level
import ApiService from '../services/apiService'
import { EventBus } from '../services/eventBus'
import DealService from '../../features/deals/services/dealService'
import CustomerService from '../../features/customers/services/customerService'
import InventoryService from '../../features/inventory/services/inventoryService'

// Service registration helper  
export function registerServices(container: DIContainer): void {
  // Register core services first
  container.register('apiService', () => {
    return new ApiService()
  })

  container.register('eventBus', () => {
    return new EventBus()
  })

  // Register feature services with dependencies
  container.register('dealService', (c) => {
    return new DealService(c.get('apiService'), c.get('eventBus'))
  })

  container.register('customerService', (c) => {
    return new CustomerService(c.get('apiService'), c.get('eventBus'))
  })

  container.register('inventoryService', (c) => {
    return new InventoryService(c.get('apiService'), c.get('eventBus'))
  })
}

// Initialize the default container
registerServices(container)

// Export convenience functions
export function getService<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
  return container.get(name)
}

export function createTestContainer(): DIContainer {
  const testContainer = new DIContainer()
  registerServices(testContainer)
  return testContainer
}