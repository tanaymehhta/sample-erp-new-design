import { Deal } from '../../deals/types'

export interface SyncServiceInterface {
  syncDealToSheets(dealId: string): Promise<SyncResult>
  syncAllDealsToSheets(): Promise<SyncResult>
  syncSheetsToDatabase(): Promise<SyncResult>
  getSheetData(): Promise<SheetDeal[]>
  getDatabaseData(): Promise<Deal[]>
  compareTables(): Promise<SyncComparison>
}

export interface SyncResult {
  success: boolean
  synced: number
  errors: SyncError[]
  conflictsResolved: number
  message: string
}

export interface SyncError {
  id: string
  type: 'database' | 'sheets' | 'conflict'
  message: string
  data?: any
}

export interface SyncComparison {
  databaseCount: number
  sheetsCount: number
  missingInSheets: string[]
  missingInDatabase: string[]
  conflicts: SyncConflict[]
}

export interface SyncConflict {
  id: string
  field: string
  databaseValue: any
  sheetsValue: any
  lastModified: {
    database: Date
    sheets?: Date
  }
}

export interface SheetDeal {
  id: string
  date: string
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: string
  productCode: string
  grade: string
  company: string
  specificGrade: string
  saleSource: string
  purchaseParty: string
  purchaseQuantity: number
  purchaseRate: number
  saleComments?: string
  purchaseComments?: string
  finalComments?: string
  warehouse?: string
  rowNumber?: number
}

export interface SyncConfig {
  autoSyncEnabled: boolean
  syncInterval: number // minutes
  conflictResolution: 'database_wins' | 'sheets_wins' | 'manual'
  batchSize: number
  retryAttempts: number
}

// Event types for sync operations
export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',
  CONFLICT_DETECTED: 'sync.conflict.detected',
  CONFLICT_RESOLVED: 'sync.conflict.resolved'
} as const