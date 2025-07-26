import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { databaseAdapter } from '../server/services/databaseAdapter'
import DealSyncService from '../src/features/sync/services/dealSyncService'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function uploadAllDealsToSheets() {
  console.log('🚀 Starting upload of all deals to Google Sheets...')
  
  try {
    // Initialize sync service
    const syncService = new DealSyncService(databaseAdapter)
    
    // Get all deals from database
    console.log('📊 Fetching all deals from database...')
    const allDeals = await databaseAdapter.getAllDeals()
    console.log(`Found ${allDeals.length} deals in database`)
    
    if (allDeals.length === 0) {
      console.log('ℹ️  No deals found in database. Nothing to upload.')
      return
    }
    
    // Sync all deals to Google Sheets
    console.log('📤 Uploading deals to Google Sheets...')
    const result = await syncService.syncAllDealsToSheets()
    
    if (result.success) {
      console.log(`✅ Successfully uploaded ${result.synced} deals to Google Sheets!`)
      console.log(`📋 Message: ${result.message}`)
      
      if (result.errors.length > 0) {
        console.log(`⚠️  Encountered ${result.errors.length} errors:`)
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. [${error.type}] ${error.message}`)
        })
      }
      
      // Verify the upload by comparing tables
      console.log('🔍 Verifying upload by comparing tables...')
      const comparison = await syncService.compareTables()
      
      console.log('\n📊 Comparison Results:')
      console.log(`   Database: ${comparison.databaseCount} deals`)
      console.log(`   Google Sheets: ${comparison.sheetsCount} deals`)
      
      if (comparison.missingInSheets.length > 0) {
        console.log(`   ❌ Missing in Sheets: ${comparison.missingInSheets.length} deals`)
        console.log(`      IDs: ${comparison.missingInSheets.slice(0, 5).join(', ')}${comparison.missingInSheets.length > 5 ? '...' : ''}`)
      }
      
      if (comparison.missingInDatabase.length > 0) {
        console.log(`   ❌ Extra in Sheets: ${comparison.missingInDatabase.length} deals`)
        console.log(`      IDs: ${comparison.missingInDatabase.slice(0, 5).join(', ')}${comparison.missingInDatabase.length > 5 ? '...' : ''}`)
      }
      
      if (comparison.conflicts.length > 0) {
        console.log(`   ⚠️  Data conflicts: ${comparison.conflicts.length} field mismatches`)
      }
      
      if (comparison.databaseCount === comparison.sheetsCount && 
          comparison.missingInSheets.length === 0 && 
          comparison.missingInDatabase.length === 0 && 
          comparison.conflicts.length === 0) {
        console.log('🎉 Perfect sync! Database and Google Sheets are identical.')
      }
      
    } else {
      console.log('❌ Upload failed!')
      console.log(`📋 Message: ${result.message}`)
      
      if (result.errors.length > 0) {
        console.log('Errors encountered:')
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. [${error.type}] ${error.message}`)
          if (error.data) {
            console.log(`      Data: ${JSON.stringify(error.data, null, 2)}`)
          }
        })
      }
    }
    
  } catch (error) {
    console.error('💥 Script failed with error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  } finally {
    // Clean up
    await prisma.$disconnect()
    await databaseAdapter.disconnect()
    console.log('🏁 Script completed.')
  }
}

// Check if running directly
if (require.main === module) {
  uploadAllDealsToSheets()
    .then(() => {
      console.log('✅ Upload script finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Upload script failed:', error)
      process.exit(1)
    })
}

export default uploadAllDealsToSheets