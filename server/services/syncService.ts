import { PrismaClient } from '@prisma/client'
import { syncToGoogleSheets } from './googleSheets'

const prisma = new PrismaClient()

export interface SyncConfig {
  autoSyncEnabled: boolean
  syncInterval: number
  conflictResolution: 'database_wins' | 'sheets_wins' | 'manual'
  batchSize: number
  retryAttempts: number
}

export interface SyncResult {
  success: boolean
  synced: number
  errors: Array<{
    id: string
    type: 'database' | 'sheets' | 'conflict'
    message: string
    data?: any
  }>
  conflictsResolved: number
  message: string
}

class ServerSyncService {
  private config: SyncConfig = {
    autoSyncEnabled: true,
    syncInterval: 5,
    conflictResolution: 'database_wins',
    batchSize: 100,
    retryAttempts: 3
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
      console.log('🔄 Starting sync of all deals to Google Sheets...')
      
      const deals = await prisma.deal.findMany({
        orderBy: { createdAt: 'desc' }
      })

      console.log(`Found ${deals.length} deals to sync`)

      for (const deal of deals) {
        try {
          await syncToGoogleSheets(deal)
          result.synced++
        } catch (error) {
          result.errors.push({
            id: deal.id,
            type: 'sheets',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      result.success = result.errors.length === 0
      result.message = result.success 
        ? `Successfully synced ${result.synced} deals`
        : `Synced ${result.synced} deals with ${result.errors.length} errors`

      console.log(`✅ Sync completed: ${result.message}`)
      
    } catch (error) {
      result.errors.push({
        id: 'batch',
        type: 'database',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      result.message = 'Sync failed'
      console.error('❌ Sync failed:', error)
    }

    return result
  }

  async syncSheetsToDatabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      errors: [],
      conflictsResolved: 0,
      message: 'Sheets to database sync not yet implemented'
    }

    // This would be implemented to read from Google Sheets and update database
    // For now, just return a placeholder result

    return result
  }

  async getSheetData(): Promise<any[]> {
    // Placeholder - would integrate with Google Sheets service
    return []
  }

  async getDatabaseData(): Promise<any[]> {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return deals
  }

  async compareTables(): Promise<any> {
    const dbDeals = await this.getDatabaseData()
    const sheetDeals = await this.getSheetData()

    return {
      databaseCount: dbDeals.length,
      sheetsCount: sheetDeals.length,
      missingInSheets: [],
      missingInDatabase: [],
      conflicts: []
    }
  }

  getConfig(): SyncConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<SyncConfig>): SyncConfig {
    this.config = { ...this.config, ...newConfig }
    return this.getConfig()
  }
}

// Create singleton instance
export const serverSyncService = new ServerSyncService()
export default ServerSyncService