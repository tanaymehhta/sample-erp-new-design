import { google, sheets_v4 } from 'googleapis'
import path from 'path'
import { Deal } from '../../deals/types'
import { SheetDeal } from '../types'

export interface GoogleSheetsSyncInterface {
  getAllDeals(): Promise<SheetDeal[]>
  addDeal(deal: Deal): Promise<void>
  updateDeal(deal: Deal, rowNumber: number): Promise<void>
  deleteDeal(dealId: string): Promise<void>
  clearAllDeals(): Promise<void>
  batchUpdateDeals(deals: Deal[]): Promise<void>
}

class GoogleSheetsSyncService implements GoogleSheetsSyncInterface {
  private auth: any = null
  private sheets: sheets_v4.Sheets | null = null
  private readonly spreadsheetId: string
  private readonly sheetName = 'Main'
  private readonly range = 'A:M' // Columns A through M for essential fields only

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID || ''
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID environment variable is required')
    }
  }

  private async getGoogleAuth() {
    if (!this.auth) {
      const keyFilePath = path.join(process.cwd(), 'gen-lang-client-0238807985-5ad5a4c250c2.json')
      this.auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })
    }
    return this.auth
  }

  private async getSheetsClient() {
    if (!this.sheets) {
      const auth = await this.getGoogleAuth()
      this.sheets = google.sheets({ version: 'v4', auth })
    }
    return this.sheets
  }

  private dealToSheetRow(deal: Deal): any[] {
    return [
      '', // A: Empty column (no ID)
      deal.date,                  // B: Date  
      deal.saleParty,             // C: Sale Party
      deal.quantitySold,          // D: Quantity Sold
      deal.saleRate,              // E: Sale Rate
      deal.deliveryTerms,         // F: Delivery Terms
      deal.productCode,           // G: Product Code
      deal.grade,                 // H: Grade
      deal.company,               // I: Company
      deal.specificGrade,         // J: Specific Grade
      deal.purchaseParty,         // K: Purchase Party
      deal.purchaseQuantity,      // L: Purchase Quantity
      deal.purchaseRate           // M: Purchase Rate
    ]
  }

  private sheetRowToDeal(row: any[], rowNumber: number): SheetDeal {
    return {
      id: `sheet_row_${rowNumber}`, // Generate ID from row number since we don't store it
      date: row[1] || '',
      saleParty: row[2] || '',
      quantitySold: parseFloat(row[3]) || 0,
      saleRate: parseFloat(row[4]) || 0,
      deliveryTerms: row[5] || '',
      productCode: row[6] || '',
      grade: row[7] || '',
      company: row[8] || '',
      specificGrade: row[9] || '',
      saleSource: 'new', // Default since we don't store this in sheets now
      purchaseParty: row[10] || '',
      purchaseQuantity: parseFloat(row[11]) || 0,
      purchaseRate: parseFloat(row[12]) || 0,
      saleComments: undefined,
      purchaseComments: undefined,
      finalComments: undefined,
      warehouse: undefined,
      rowNumber
    }
  }

  async getAllDeals(): Promise<SheetDeal[]> {
    try {
      const sheets = await this.getSheetsClient()
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!${this.range}`
      })

      const rows = response.data.values || []
      
      // Skip header row (if exists) and convert to deals
      const dataRows = rows.slice(1)
      return dataRows
        .map((row, index) => this.sheetRowToDeal(row, index + 2)) // +2 because of header and 1-based indexing
        .filter(deal => deal.id) // Filter out empty rows
    } catch (error) {
      console.error('Error fetching deals from Google Sheets:', error)
      throw new Error(`Failed to fetch deals from Google Sheets: ${error}`)
    }
  }

  async addDeal(deal: Deal): Promise<void> {
    try {
      const sheets = await this.getSheetsClient()
      const rowData = this.dealToSheetRow(deal)

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!${this.range}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData]
        }
      })

      console.log(`✅ Deal ${deal.id} added to Google Sheets`)
    } catch (error) {
      console.error(`❌ Failed to add deal ${deal.id} to Google Sheets:`, error)
      throw error
    }
  }

  async updateDeal(deal: Deal, rowNumber: number): Promise<void> {
    try {
      const sheets = await this.getSheetsClient()
      const rowData = this.dealToSheetRow(deal)

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A${rowNumber}:M${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData]
        }
      })

      console.log(`✅ Deal ${deal.id} updated in Google Sheets at row ${rowNumber}`)
    } catch (error) {
      console.error(`❌ Failed to update deal ${deal.id} in Google Sheets:`, error)
      throw error
    }
  }

  async deleteDeal(dealId: string): Promise<void> {
    try {
      const allDeals = await this.getAllDeals()
      const dealToDelete = allDeals.find(d => d.id === dealId)
      
      if (!dealToDelete || !dealToDelete.rowNumber) {
        throw new Error(`Deal ${dealId} not found in Google Sheets`)
      }

      const sheets = await this.getSheetsClient()
      
      // Delete the row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming first sheet
                dimension: 'ROWS',
                startIndex: dealToDelete.rowNumber - 1, // 0-based
                endIndex: dealToDelete.rowNumber
              }
            }
          }]
        }
      })

      console.log(`✅ Deal ${dealId} deleted from Google Sheets`)
    } catch (error) {
      console.error(`❌ Failed to delete deal ${dealId} from Google Sheets:`, error)
      throw error
    }
  }

  async clearAllDeals(): Promise<void> {
    try {
      const sheets = await this.getSheetsClient()
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2:M`  // Clear all data except header
      })

      console.log('✅ All deals cleared from Google Sheets')
    } catch (error) {
      console.error('❌ Failed to clear deals from Google Sheets:', error)
      throw error
    }
  }

  async batchUpdateDeals(deals: Deal[]): Promise<void> {
    try {
      if (deals.length === 0) return

      const sheets = await this.getSheetsClient()
      
      // First clear existing data
      await this.clearAllDeals()
      
      // Batch add all deals
      const rowsData = deals.map(deal => this.dealToSheetRow(deal))
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!${this.range}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: rowsData
        }
      })

      console.log(`✅ Batch updated ${deals.length} deals in Google Sheets`)
    } catch (error) {
      console.error('❌ Failed to batch update deals in Google Sheets:', error)
      throw error
    }
  }
}

// Singleton instance
export const googleSheetsSyncService = new GoogleSheetsSyncService()
export default GoogleSheetsSyncService