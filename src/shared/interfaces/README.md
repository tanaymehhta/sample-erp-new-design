# Service Interfaces Documentation

## Overview
This document defines the interfaces and contracts used for inter-feature communication in the Polymer Trading System. These interfaces ensure loose coupling and enable dependency injection.

## Core Service Interfaces

### DealServiceInterface
```typescript
interface DealServiceInterface {
  createDeal(dealData: CreateDealRequest): Promise<ApiResponse<Deal>>
  getDeals(filters?: DealFilters): Promise<PaginatedResponse<Deal>>
  getDeal(id: string): Promise<ApiResponse<Deal>>
  updateDeal(id: string, dealData: Partial<CreateDealRequest>): Promise<ApiResponse<Deal>>
  deleteDeal(id: string): Promise<ApiResponse<void>>
  getDealSummary(filters?: DealFilters): Promise<ApiResponse<DealSummary>>
}
```

**Purpose**: Manages deal lifecycle and trading operations
**Events Emitted**: `deal.created`, `deal.updated`, `deal.deleted`

### CustomerServiceInterface
```typescript
interface CustomerServiceInterface {
  getCustomers(): Promise<ApiResponse<Customer[]>>
  getSuppliers(): Promise<ApiResponse<Supplier[]>>
  createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>>
  createSupplier(supplierData: CreateSupplierRequest): Promise<ApiResponse<Supplier>>
  getCustomer(id: string): Promise<ApiResponse<Customer>>
  getSupplier(id: string): Promise<ApiResponse<Supplier>>
}
```

**Purpose**: Manages customer and supplier data
**Events Emitted**: `customer.added`, `supplier.added`, `customer.updated`

### InventoryServiceInterface
```typescript
interface InventoryServiceInterface {
  getInventory(filters?: InventoryFilters): Promise<ApiResponse<InventoryItem[]>>
  getInventoryItem(id: string): Promise<ApiResponse<InventoryItem>>
  createInventoryItem(data: CreateInventoryRequest): Promise<ApiResponse<InventoryItem>>
  updateInventoryItem(id: string, data: Partial<CreateInventoryRequest>): Promise<ApiResponse<InventoryItem>>
  deleteInventoryItem(id: string): Promise<ApiResponse<void>>
  getInventorySummary(): Promise<ApiResponse<InventorySummary>>
  checkStockLevels(): Promise<ApiResponse<InventoryItem[]>>
}
```

**Purpose**: Manages inventory tracking and stock operations
**Events Emitted**: `inventory.updated`, `inventory.low_stock`, `inventory.item.created`

### SyncServiceInterface
```typescript
interface SyncServiceInterface {
  syncToSheets(data: any): Promise<ApiResponse<SyncResult>>
  syncFromSheets(): Promise<ApiResponse<SyncResult>>
  getSyncStatus(): Promise<ApiResponse<SyncStatus>>
  resolveSyncConflicts(conflicts: SyncConflict[]): Promise<ApiResponse<void>>
}
```

**Purpose**: Handles external data synchronization
**Events Emitted**: `sync.started`, `sync.completed`, `sync.failed`

## Event Bus Interface

### EventBusInterface
```typescript
interface EventBusInterface {
  subscribe(eventType: string, callback: EventCallback): () => void
  emit(eventType: string, payload: any, source?: string): void
  getEventHistory(eventType?: string): SystemEvent[]
  clearHistory(): void
  getSubscriptions(): string[]
}
```

**Purpose**: Enables event-driven communication between features

## Common Types

### ApiResponse
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

### SystemEvent
```typescript
interface SystemEvent {
  type: string
  payload: any
  timestamp: Date
  source: string
}
```

## Usage Guidelines

### For Implementing Services
1. All services MUST implement their respective interfaces
2. Use dependency injection instead of singleton imports
3. Emit events for cross-feature communication
4. Handle errors gracefully and log them locally

### For Consuming Services
1. Depend on interfaces, not concrete implementations
2. Subscribe to events for loose coupling
3. Use try-catch blocks for error handling
4. Avoid direct calls to other feature services

### For Adding New Features
1. Define clear interfaces for your service
2. Document all events emitted and consumed
3. Use existing shared interfaces when possible
4. Update this documentation when adding new interfaces

## Event-Driven Communication

### Standard Event Types
- **Creation Events**: `feature.created` (e.g., `deal.created`)
- **Update Events**: `feature.updated` (e.g., `inventory.updated`)
- **Deletion Events**: `feature.deleted` (e.g., `customer.deleted`)
- **Status Events**: `feature.status.changed` (e.g., `sync.completed`)
- **Error Events**: `feature.operation.failed` (e.g., `sync.failed`)

### Event Payload Standards
- Include relevant entity data in creation/update events
- Include entity ID in deletion events
- Include error details in failure events
- Always specify the source service name

## Migration Path

### Current State (Singletons)
```typescript
// Current usage
import { dealService } from '../services/dealService'
const deals = await dealService.getDeals()
```

### Target State (Dependency Injection)
```typescript
// Future usage with DI
class DealsComponent {
  constructor(private dealService: DealServiceInterface) {}
  
  async loadDeals() {
    const deals = await this.dealService.getDeals()
  }
}
```

This interface documentation serves as the foundation for implementing proper dependency injection and maintaining loose coupling between features.