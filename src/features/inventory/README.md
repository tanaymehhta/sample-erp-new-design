# Inventory Feature

## Purpose
Manages inventory tracking and stock management for the Polymer Trading System. Handles inventory CRUD operations, stock levels, and multi-source selection for deals.

## Dependencies
- **ApiService** (for inventory data operations)
- **EventBus** (for inventory change notifications)
- **DealService** (for deal-inventory integration)

## Components
- **InventorySelector**: Multi-select component for choosing inventory items in deals
- Inventory management forms and displays
- Stock level indicators and alerts

## Services
- **InventoryService**: Manages all inventory-related operations

## Hooks
- **useInventory**: React hook for inventory data management and selection logic

## APIs

### InventoryService
- `getInventory(filters?)`: Fetches inventory items with optional filtering
- `getInventoryItem(id)`: Fetches specific inventory item by ID
- `createInventoryItem(data)`: Creates new inventory record
- `updateInventoryItem(id, data)`: Updates existing inventory item
- `deleteInventoryItem(id)`: Removes inventory item
- `getInventorySummary()`: Gets inventory statistics and totals
- `checkStockLevels()`: Validates current stock against requirements

## Events Emitted
- `inventory.updated`: When inventory quantities change
- `inventory.low_stock`: When stock levels fall below thresholds
- `inventory.item.created`: When new inventory is added
- `inventory.item.deleted`: When inventory is removed

## Events Consumed
- `deal.created`: Updates inventory levels when deals use stock
- `sync.completed`: Refreshes inventory data after external sync

## Types
- `InventoryItem`: Inventory entity with stock details, rates, and metadata
- `InventoryFilters`: Filtering options for inventory queries
- `InventorySummary`: Aggregated inventory statistics
- `StockSelection`: Multi-source inventory selection for deals

## Features
- Multi-source inventory selection for optimal cost/availability
- Automatic stock deduction on deal creation
- Low stock alerts and monitoring
- Inventory valuation and cost tracking
- Integration with deal creation workflow

## State Management
Uses feature-specific hooks for inventory selection state and real-time stock updates.