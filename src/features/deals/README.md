# Deals Feature

## Purpose
Core business feature managing trading deals in the Polymer Trading System. Handles deal creation, tracking, and lifecycle management for polymer trading transactions.

## Dependencies
- **ApiService** (for deal CRUD operations)
- **EventBus** (for deal lifecycle events)
- **InventoryService** (for inventory-based deals)
- **CustomerService** (for customer/supplier selection)

## Components
- **NewDealForm**: Form for creating new deals with inventory selection
- **DealsHistory**: Historical deals display with filtering
- Deal detail views and edit forms

## Services
- **DealService**: Manages all deal-related operations and API calls

## Hooks
- **useDeals**: React hook for deal data management and state

## APIs

### DealService
- `createDeal(data)`: Creates a new deal (supports both new material and inventory-based)
- `getDeals(filters?)`: Fetches deals with optional filtering
- `getDeal(id)`: Fetches specific deal by ID
- `updateDeal(id, data)`: Updates existing deal
- `deleteDeal(id)`: Removes a deal
- `getDealSummary(filters?)`: Gets aggregated deal statistics

## Events Emitted
- `deal.created`: When a new deal is successfully created
- `deal.updated`: When deal data is modified
- `deal.deleted`: When a deal is removed
- `deal.creation.failed`: When deal creation fails

## Events Consumed
- `inventory.updated`: Responds to inventory changes for deal validation
- `customer.added`: Updates customer selection options

## Types
- `Deal`: Main deal entity with sale/purchase details
- `CreateDealRequest`: Deal creation payload
- `DealFilters`: Filtering options for deal queries
- `DealSummary`: Aggregated deal statistics

## Features
- Multi-source inventory selection for deals
- Automatic inventory deduction
- WhatsApp notifications
- Google Sheets synchronization
- Deal history tracking with filters

## State Management
Uses hooks for component-level state and emits events for cross-feature communication.