import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID
const GOOGLE_SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'gen-lang-client-0238807985-2056cd44e1e5.json')

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  return google.sheets({ version: 'v4', auth })
}

function dealToSheetRow(deal: any): any[] {
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

async function batchUploadAllDeals() {
  console.log('🚀 Starting batch upload of all deals to Google Sheets...')
  
  try {
    // Initialize Google Sheets client
    const sheets = await getGoogleSheetsClient()
    
    // Get all deals from database
    console.log('📊 Fetching all deals from database...')
    const allDeals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${allDeals.length} deals in database`)
    
    if (allDeals.length === 0) {
      console.log('ℹ️  No deals found in database. Nothing to upload.')
      return
    }
    
    // First, clear existing data in sheets (keep header if it exists)
    console.log('🧹 Clearing existing data in Google Sheets...')
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Main!A2:M' // Clear all data except potential header row
      })
      console.log('✅ Existing data cleared')
    } catch (error) {
      console.log('⚠️  Could not clear existing data (sheet might be empty):', error)
    }
    
    // Convert all deals to sheet rows
    console.log('🔄 Converting deals to sheet format...')
    const sheetRows = allDeals.map(deal => dealToSheetRow(deal))
    
    // Add header row if needed
    const headerRow = [
      '', 'Date', 'Sale Party', 'Quantity Sold', 'Sale Rate', 
      'Delivery Terms', 'Product Code', 'Grade', 'Company', 
      'Specific Grade', 'Purchase Party', 'Purchase Quantity', 'Purchase Rate'
    ]
    
    const allRows = [headerRow, ...sheetRows]
    
    // Batch upload using a single API call
    console.log(`📤 Batch uploading ${allDeals.length} deals to Google Sheets...`)
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Main!A1:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: allRows
      }
    })
    
    console.log('\n📊 Upload Results:')
    console.log(`✅ Successfully uploaded: ${allDeals.length} deals`)
    console.log(`📋 Updated range: ${response.data.updatedRange}`)
    console.log(`📊 Updated rows: ${response.data.updatedRows}`)
    console.log(`📊 Updated columns: ${response.data.updatedColumns}`)
    console.log(`📊 Updated cells: ${response.data.updatedCells}`)
    
    console.log('\n🎉 Batch upload completed successfully!')
    console.log(`📊 Total deals in Google Sheets: ${allDeals.length}`)
    
    // Verify the upload
    console.log('\n🔍 Verifying upload...')
    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Main!A:M'
    })
    
    const uploadedRows = verifyResponse.data.values || []
    const dataRows = uploadedRows.slice(1) // Exclude header
    console.log(`✅ Verification: Found ${dataRows.length} data rows in Google Sheets`)
    
    if (dataRows.length === allDeals.length) {
      console.log('🎯 Perfect match! All deals uploaded successfully.')
    } else {
      console.log(`⚠️  Mismatch detected: Expected ${allDeals.length}, found ${dataRows.length}`)
    }
    
  } catch (error) {
    console.error('💥 Batch upload failed with error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  } finally {
    // Clean up
    await prisma.$disconnect()
    console.log('🏁 Script completed.')
  }
}

// Run the script
batchUploadAllDeals()
  .then(() => {
    console.log('✅ Batch upload script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Batch upload script failed:', error)
    process.exit(1)
  })