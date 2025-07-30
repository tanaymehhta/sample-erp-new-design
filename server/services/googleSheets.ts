import { google } from 'googleapis'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

interface DealSource {
  id: string
  quantityUsed: number
  costPerKg: number
  supplierName: string
  selectionOrder: number
  inventory?: {
    purchaseParty: string
  }
}

interface DealData {
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
  purchaseParty: string
  purchaseQuantity: number
  purchaseRate: number
  saleComments?: string
  purchaseComments?: string
  finalComments?: string
  warehouse?: string
  sources?: DealSource[]
}

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID
const GOOGLE_SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'gen-lang-client-0238807985-2056cd44e1e5.json')

let auth: any = null

async function getGoogleAuth() {
  if (!auth) {
    auth = new google.auth.GoogleAuth({
      keyFile: GOOGLE_SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
  }
  return auth
}

async function getGoogleSheetsClient() {
  const auth = await getGoogleAuth()
  return google.sheets({ version: 'v4', auth })
}

export async function syncToGoogleSheets(deal: DealData) {
  try {
    const sheets = await getGoogleSheetsClient()
    
    // Multi-source deals create multiple rows
    if (deal.sources && deal.sources.length > 0) {
      console.log(`📊 Syncing multi-source deal with ${deal.sources.length} sources to Google Sheets`)
      
      const responses = []
      
      for (let i = 0; i < deal.sources.length; i++) {
        const source = deal.sources[i]
        
        // Prepare row data with source-specific information
        // | A=Empty | B=Date | C=Sale Party | D=Qty Sold | E=Sale Rate | F=Delivery Terms |
        // | G=Product Code | H=Grade | I=Company | J=Specific Grade | K=Purchase Party | L=Purchase Qty | M=Purchase Rate | N=Notes |
        const rowData = [
          '', // Column A - Empty (as requested)
          deal.date, // Column B - Date
          deal.saleParty, // Column C - Sale Party
          i === 0 ? deal.quantitySold : '', // Column D - Only show total quantity on first row
          i === 0 ? deal.saleRate : '', // Column E - Only show sale rate on first row
          i === 0 ? deal.deliveryTerms : '', // Column F - Only show delivery terms on first row
          deal.productCode, // Column G - Product Code
          deal.grade, // Column H - Grade
          deal.company, // Column I - Company
          deal.specificGrade, // Column J - Specific Grade
          source.supplierName, // Column K - Source-specific supplier
          source.quantityUsed, // Column L - Source-specific quantity
          source.costPerKg, // Column M - Source-specific rate
          `Part ${i + 1} of ${deal.sources.length}` // Column N - Notes (moved from A as requested)
        ]
        
        // Append each row to Main sheet
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: GOOGLE_SHEETS_ID,
          range: 'Main!A:N',
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData]
          }
        })
        
        responses.push(response.data)
      }
      
      console.log(`✅ Multi-source deal synced: ${responses.length} rows added to Google Sheets`)
      return responses
      
    } else {
      // Single source or traditional deal
      console.log('📊 Syncing single-source deal to Google Sheets')
      
      const rowData = [
        '', // Column A - Empty
        deal.date, // Column B - Date
        deal.saleParty, // Column C - Sale Party
        deal.quantitySold, // Column D - Quantity Sold
        deal.saleRate, // Column E - Sale Rate
        deal.deliveryTerms, // Column F - Delivery Terms
        deal.productCode, // Column G - Product Code
        deal.grade, // Column H - Grade
        deal.company, // Column I - Company
        deal.specificGrade, // Column J - Specific Grade
        deal.purchaseParty, // Column K - Purchase Party
        deal.purchaseQuantity, // Column L - Purchase Quantity
        deal.purchaseRate, // Column M - Purchase Rate
        '' // Column N - Notes (empty for single source)
      ]
      
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Main!A:N',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData]
        }
      })
      
      console.log('✅ Single-source deal synced to Google Sheets')
      return response.data
    }
    
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error)
    throw error
  }
}

export async function getGoogleSheetsData(sheetName: string) {
  try {
    const sheets = await getGoogleSheetsClient()
    
    let range = `${sheetName}!A:Z` // Default range
    
    // Set specific ranges based on sheet type
    switch (sheetName) {
      case 'Main':
        range = `${sheetName}!A:M`
        break
      case 'Product Database':
        range = `${sheetName}!B4:F`
        break
      case 'Sale Parties':
      case 'Purchase Parties':
        range = `${sheetName}!A2:F`
        break
      case 'Inventory':
        range = `${sheetName}!A2:I`
        break
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range
    })
    
    return response.data.values || []
    
  } catch (error) {
    console.error(`Error fetching data from ${sheetName} sheet:`, error)
    throw error
  }
}

export async function addProductToDatabase(product: {
  productCode: string
  grade: string
  company: string
  specificGrade: string
}) {
  try {
    const sheets = await getGoogleSheetsClient()
    
    const rowData = [
      product.productCode,
      product.grade,
      product.company,
      product.specificGrade,
      new Date().toISOString() // Timestamp
    ]
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Product Database!B:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    })
    
    console.log('Product added to Google Sheets:', response.data)
    return response.data
    
  } catch (error) {
    console.error('Error adding product to Google Sheets:', error)
    throw error
  }
}

export async function updateInventory(inventoryItem: {
  productCode: string
  grade: string
  company: string
  specificGrade: string
  quantity: number
  rate: number
  purchaseParty: string
  dateAdded: string
}) {
  try {
    const sheets = await getGoogleSheetsClient()
    
    const rowData = [
      '', // ID - will be auto-generated
      inventoryItem.productCode,
      inventoryItem.grade,
      inventoryItem.company,
      inventoryItem.specificGrade,
      inventoryItem.quantity,
      inventoryItem.rate,
      inventoryItem.purchaseParty,
      inventoryItem.dateAdded
    ]
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Inventory!A:I',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    })
    
    console.log('Inventory updated in Google Sheets:', response.data)
    return response.data
    
  } catch (error) {
    console.error('Error updating inventory in Google Sheets:', error)
    throw error
  }
}