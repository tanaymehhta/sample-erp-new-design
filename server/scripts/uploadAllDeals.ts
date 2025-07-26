import { PrismaClient } from '@prisma/client'
import { syncToGoogleSheets } from '../services/googleSheets'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function uploadAllDealsToSheets() {
  console.log('🚀 Starting upload of all deals to Google Sheets...')
  
  try {
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
    
    // Upload each deal to Google Sheets
    console.log('📤 Uploading deals to Google Sheets...')
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < allDeals.length; i++) {
      const deal = allDeals[i]
      try {
        console.log(`Uploading deal ${i + 1}/${allDeals.length}: ${deal.id} (${deal.saleParty})`)
        await syncToGoogleSheets(deal)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to upload deal ${deal.id}:`, error)
        errorCount++
      }
      
      // Add small delay to avoid rate limiting
      if (i < allDeals.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('\n📊 Upload Summary:')
    console.log(`✅ Successfully uploaded: ${successCount} deals`)
    console.log(`❌ Failed uploads: ${errorCount} deals`)
    console.log(`📋 Total processed: ${allDeals.length} deals`)
    
    if (successCount === allDeals.length) {
      console.log('🎉 All deals uploaded successfully!')
    } else if (successCount > 0) {
      console.log('⚠️  Partial success - some deals failed to upload')
    } else {
      console.log('💥 Upload failed completely')
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
    console.log('🏁 Script completed.')
  }
}

// Run the script
uploadAllDealsToSheets()
  .then(() => {
    console.log('✅ Upload script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Upload script failed:', error)
    process.exit(1)
  })