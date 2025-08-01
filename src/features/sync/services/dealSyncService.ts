import { Deal } from '../../deals/types'
import { googleSheetsSyncService } from './googleSheetsSync'
import { eventBus } from '../../../shared/services/eventBus'
import { 
  SyncServiceInterface, 
  SyncResult, 
  SyncComparison, 
  SyncConflict, 
  SyncConfig,
  SheetDeal,
  SYNC_EVENTS 
} from '../types'

export interface DatabaseServiceInterface {
  getAllDeals(): Promise<Deal[]>
  getDealById(id: string): Promise<Deal | null>
  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal>
  updateDeal(id: string, deal: Partial<Deal>): Promise<Deal>
  deleteDeal(id: string): Promise<void>
}

class DealSyncService implements SyncServiceInterface {
  private config: SyncConfig = {
    autoSyncEnabled: true,
    syncInterval: 5, // 5 minutes
    conflictResolution: 'database_wins',
    batchSize: 100,
    retryAttempts: 3
  }

  constructor(private databaseService: DatabaseServiceInterface) {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Listen to deal events from dealService
    eventBus.subscribe('deal.created', async (event) => {
      if (this.config.autoSyncEnabled && event.payload) {
        await this.syncDealToSheets(event.payload.id)
      }
    })

    eventBus.subscribe('deal.updated', async (event) => {
      if (this.config.autoSyncEnabled && event.payload) {
        await this.syncDealToSheets(event.payload.id)
      }
    })

    eventBus.subscribe('deal.deleted', async (event) => {
      if (this.config.autoSyncEnabled && event.payload?.id) {
        try {
          await googleSheetsSyncService.deleteDeal(event.payload.id)
        } catch (error) {
          console.error(`Failed to delete deal ${event.payload.id} from sheets:`, error)
        }
      }
    })
  }

  async syncDealToSheets(dealId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      errors: [],
      conflictsResolved: 0,
      message: ''
    }

    try {
      eventBus.emit(SYNC_EVENTS.SYNC_STARTED, { type: 'single', dealId })

      const deal = await this.databaseService.getDealById(dealId)
      if (!deal) {
        result.errors.push({
          id: dealId,
          type: 'database',
          message: 'Deal not found in database'
        })
        result.message = 'Deal not found'
        return result
      }

      // Check if deal exists in sheets
      const sheetDeals = await googleSheetsSyncService.getAllDeals()
      const existingDeal = sheetDeals.find(d => d.id === dealId)

      if (existingDeal) {
        // Update existing deal
        if (existingDeal.rowNumber) {
          await googleSheetsSyncService.updateDeal(deal, existingDeal.rowNumber)
        }
      } else {
        // Add new deal
        await googleSheetsSyncService.addDeal(deal)
      }

      result.success = true
      result.synced = 1
      result.message = 'Deal synced successfully'

      eventBus.emit(SYNC_EVENTS.SYNC_COMPLETED, { type: 'single', dealId, result })

    } catch (error) {
      result.errors.push({
        id: dealId,
        type: 'sheets',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      result.message = 'Sync failed'
      
      eventBus.emit(SYNC_EVENTS.SYNC_FAILED, { type: 'single', dealId, error })
    }

    return result
  }

  async syncAllDealsToSheets(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      errors: [],
      conflictsResolved: 0,
      message: ''
    }

    try {
      eventBus.emit(SYNC_EVENTS.SYNC_STARTED, { type: 'all_to_sheets' })

      const dbDeals = await this.databaseService.getAllDeals()
      
      // Use batch update for efficiency
      await googleSheetsSyncService.batchUpdateDeals(dbDeals)

      result.success = true
      result.synced = dbDeals.length
      result.message = `Successfully synced ${dbDeals.length} deals to Google Sheets`

      eventBus.emit(SYNC_EVENTS.SYNC_COMPLETED, { type: 'all_to_sheets', result })

    } catch (error) {
      result.errors.push({
        id: 'batch',
        type: 'sheets',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      result.message = 'Batch sync failed'
      
      eventBus.emit(SYNC_EVENTS.SYNC_FAILED, { type: 'all_to_sheets', error })
    }

    return result
  }

  async syncSheetsToDatabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      errors: [],
      conflictsResolved: 0,
      message: ''
    }

    try {
      eventBus.emit(SYNC_EVENTS.SYNC_STARTED, { type: 'sheets_to_db' })

      const sheetDeals = await this.getSheetData()
      const dbDeals = await this.getDatabaseData()
      
      const dbDealMap = new Map(dbDeals.map(d => [d.id, d]))

      for (const sheetDeal of sheetDeals) {
        try {
          const existingDeal = dbDealMap.get(sheetDeal.id)
          
          if (existingDeal) {
            // Check for conflicts and update if needed
            const conflicts = this.detectConflicts(existingDeal, sheetDeal)
            if (conflicts.length > 0) {
              if (this.config.conflictResolution === 'sheets_wins') {
                await this.databaseService.updateDeal(sheetDeal.id, this.sheetDealToDeal(sheetDeal))
                result.conflictsResolved++
              }
              // If database_wins, do nothing
              // If manual, emit conflict event
              else if (this.config.conflictResolution === 'manual') {
                eventBus.emit(SYNC_EVENTS.CONFLICT_DETECTED, { dealId: sheetDeal.id, conflicts })
              }
            }
          } else {
            // Create new deal in database
            await this.databaseService.createDeal(this.sheetDealToDeal(sheetDeal))
            result.synced++
          }
        } catch (error) {
          result.errors.push({
            id: sheetDeal.id,
            type: 'database',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      result.success = true
      result.message = `Synced ${result.synced} deals from sheets to database`

      eventBus.emit(SYNC_EVENTS.SYNC_COMPLETED, { type: 'sheets_to_db', result })

    } catch (error) {
      result.errors.push({
        id: 'batch',
        type: 'database', 
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      result.message = 'Sheets to database sync failed'
      
      eventBus.emit(SYNC_EVENTS.SYNC_FAILED, { type: 'sheets_to_db', error })
    }

    return result
  }

  async getSheetData(): Promise<SheetDeal[]> {
    return await googleSheetsSyncService.getAllDeals()
  }

  async getDatabaseData(): Promise<Deal[]> {
    return await this.databaseService.getAllDeals()
  }

  async compareTables(): Promise<SyncComparison> {
    const [dbDeals, sheetDeals] = await Promise.all([
      this.getDatabaseData(),
      this.getSheetData()
    ])

    const dbIds = new Set(dbDeals.map(d => d.id))
    const sheetIds = new Set(sheetDeals.map(d => d.id))
    const dbDealMap = new Map(dbDeals.map(d => [d.id, d]))

    const missingInSheets = dbDeals
      .filter(d => !sheetIds.has(d.id))
      .map(d => d.id)

    const missingInDatabase = sheetDeals
      .filter(d => !dbIds.has(d.id))
      .map(d => d.id)

    const conflicts: SyncConflict[] = []
    
    // Check for conflicts in common deals
    for (const sheetDeal of sheetDeals) {
      const dbDeal = dbDealMap.get(sheetDeal.id)
      if (dbDeal) {
        const dealConflicts = this.detectConflicts(dbDeal, sheetDeal)
        conflicts.push(...dealConflicts)
      }
    }

    return {
      databaseCount: dbDeals.length,
      sheetsCount: sheetDeals.length,
      missingInSheets,
      missingInDatabase,
      conflicts
    }
  }

  private detectConflicts(dbDeal: Deal, sheetDeal: SheetDeal): SyncConflict[] {
    const conflicts: SyncConflict[] = []
    const fieldsToCheck = [
      'date', 'saleParty', 'quantitySold', 'saleRate', 'deliveryTerms',
      'productCode', 'grade', 'company', 'specificGrade', 'saleSource',
      'purchaseParty', 'purchaseQuantity', 'purchaseRate', 'saleComments',
      'purchaseComments', 'finalComments', 'warehouse'
    ]

    for (const field of fieldsToCheck) {
      const dbValue = (dbDeal as any)[field]
      const sheetValue = (sheetDeal as any)[field]
      
      if (dbValue !== sheetValue) {
        conflicts.push({
          id: dbDeal.id,
          field,
          databaseValue: dbValue,
          sheetsValue: sheetValue,
          lastModified: {
            database: new Date(dbDeal.updatedAt || dbDeal.createdAt),
            sheets: undefined // Google Sheets doesn't track modification time
          }
        })
      }
    }

    return conflicts
  }

  private sheetDealToDeal(sheetDeal: SheetDeal): Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      date: sheetDeal.date,
      saleParty: sheetDeal.saleParty,
      quantitySold: sheetDeal.quantitySold,
      saleRate: sheetDeal.saleRate,
      deliveryTerms: sheetDeal.deliveryTerms as 'delivered' | 'pickup',
      productCode: sheetDeal.productCode,
      grade: sheetDeal.grade,
      company: sheetDeal.company,
      specificGrade: sheetDeal.specificGrade,
      saleSource: sheetDeal.saleSource as 'new' | 'inventory',
      purchaseParty: sheetDeal.purchaseParty,
      purchaseQuantity: sheetDeal.purchaseQuantity,
      purchaseRate: sheetDeal.purchaseRate,
      saleComments: sheetDeal.saleComments,
      purchaseComments: sheetDeal.purchaseComments,
      finalComments: sheetDeal.finalComments,
      warehouse: sheetDeal.warehouse
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<SyncConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): SyncConfig {
    return { ...this.config }
  }
}

export default DealSyncService