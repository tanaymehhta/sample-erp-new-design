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
      message: 'Sheets to database sync completed'
    }

    try {
      // Get data from Google Sheets
      const sheetsData = await this.getSheetData()
      
      if (!sheetsData || sheetsData.length === 0) {
        result.success = true
        result.message = 'No new data found in sheets'
        return result
      }

      // Process each row from sheets
      for (const row of sheetsData) {
        try {
          // Check if deal already exists in database
          const existingDeal = await prisma.deal.findFirst({
            where: {
              date: row.date,
              saleParty: row.saleParty,
              productCode: row.productCode,
              quantitySold: row.quantitySold
            }
          })

          if (existingDeal) {
            // Skip if already exists
            continue
          }

          // Create new deal from sheets data
          await prisma.deal.create({
            data: {
              date: row.date,
              saleParty: row.saleParty,
              quantitySold: parseFloat(row.quantitySold),
              saleRate: parseFloat(row.saleRate),
              deliveryTerms: row.deliveryTerms || 'pickup',
              productCode: row.productCode,
              grade: row.grade,
              company: row.company,
              specificGrade: row.specificGrade,
              saleSource: row.saleSource || 'New Material',
              purchaseParty: row.purchaseParty,
              purchaseQuantity: parseFloat(row.purchaseQuantity),
              purchaseRate: parseFloat(row.purchaseRate),
              saleComments: row.saleComments,
              purchaseComments: row.purchaseComments,
              finalComments: row.finalComments,
              warehouse: row.warehouse
            }
          })
          
          result.synced++
        } catch (error) {
          result.errors.push(`Failed to sync row: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      result.success = true
      result.message = `Successfully synced ${result.synced} deals from sheets`
      
    } catch (error) {
      result.success = false
      result.message = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return result
  }

  async getSheetData(): Promise<any[]> {
    try {
      // Import Google Sheets service dynamically to avoid circular dependencies
      const { getGoogleSheetsData } = await import('./googleSheets')
      
      // Get data from the main deals sheet
      const sheetsData = await getGoogleSheetsData('Deals')
      
      if (!sheetsData || sheetsData.length === 0) {
        return []
      }

      // Transform sheets data to match our database schema
      return sheetsData.map((row: any) => ({
        date: row['Date'] || row['date'],
        saleParty: row['Sale Party'] || row['saleParty'], 
        quantitySold: row['Quantity Sold'] || row['quantitySold'],
        saleRate: row['Sale Rate'] || row['saleRate'],
        deliveryTerms: row['Delivery Terms'] || row['deliveryTerms'],
        productCode: row['Product Code'] || row['productCode'],
        grade: row['Grade'] || row['grade'],
        company: row['Company'] || row['company'],
        specificGrade: row['Specific Grade'] || row['specificGrade'],
        saleSource: row['Sale Source'] || row['saleSource'],
        purchaseParty: row['Purchase Party'] || row['purchaseParty'],
        purchaseQuantity: row['Purchase Quantity'] || row['purchaseQuantity'],
        purchaseRate: row['Purchase Rate'] || row['purchaseRate'],
        saleComments: row['Sale Comments'] || row['saleComments'],
        purchaseComments: row['Purchase Comments'] || row['purchaseComments'],
        finalComments: row['Final Comments'] || row['finalComments'],
        warehouse: row['Warehouse'] || row['warehouse']
      }))
    } catch (error) {
      console.error('Failed to get sheet data:', error)
      return []
    }
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