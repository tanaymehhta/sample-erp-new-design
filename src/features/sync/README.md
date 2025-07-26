# Sync Feature

## Purpose
Handles data synchronization between the Polymer Trading System and external services like Google Sheets. Manages bidirectional sync operations and data consistency.

## Dependencies
- **ApiService** (for sync API operations)
- **EventBus** (for sync status notifications)
- **Google Sheets API** (for external data sync)

## Components
- **SyncManager**: UI for managing sync operations and status
- Sync status indicators and progress displays
- Conflict resolution interfaces

## Services
- **DealSyncService**: Manages deal data synchronization
- **GoogleSheetsSyncService**: Handles Google Sheets integration
- **SyncApiService**: Core sync operations and API calls

## APIs

### SyncApiService
- `syncToSheets(data)`: Pushes data to Google Sheets
- `syncFromSheets()`: Pulls data from Google Sheets
- `getSyncStatus()`: Returns current sync status and history
- `resolveSyncConflicts(conflicts)`: Handles data conflicts during sync

### GoogleSheetsSyncService
- `authenticateWithSheets()`: Handles Google Sheets authentication
- `uploadDealData(deals)`: Uploads deal data to sheets
- `downloadSheetData()`: Downloads data from sheets
- `validateSheetFormat()`: Ensures sheet structure compatibility

### DealSyncService
- `syncDealsToSheets(deals)`: Syncs deal data to external sheets
- `processSyncQueue()`: Handles queued sync operations
- `retryFailedSyncs()`: Retries failed sync operations

## Events Emitted
- `sync.started`: When sync operation begins
- `sync.completed`: When sync operation finishes successfully
- `sync.failed`: When sync operation encounters errors
- `sync.conflict.detected`: When data conflicts are found

## Events Consumed
- `deal.created`: Triggers automatic sync for new deals
- `deal.updated`: Syncs deal modifications
- `inventory.updated`: Syncs inventory changes

## Types
- `SyncStatus`: Sync operation status and metadata
- `SyncConflict`: Data conflict information for resolution
- `SyncConfiguration`: Sync settings and preferences

## Features
- Automatic sync on data changes
- Manual sync triggers
- Conflict detection and resolution
- Sync history and audit trail
- Error handling and retry mechanisms
- Batch sync operations for performance

## State Management
Uses feature-specific state for sync status, progress tracking, and conflict resolution workflows.