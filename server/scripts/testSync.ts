import { PrismaClient } from '@prisma/client'
import { syncToGoogleSheets } from '../services/googleSheets'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testSyncFormat() {
  console.log('🧪 Testing sync format with latest deal...')
  
  try {
    // Get the most recent deal
    const latestDeal = await prisma.deal.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestDeal) {
      console.log('❌ No deals found in database')
      return
    }
    
    console.log('📋 Testing with deal:')
    console.log(`   ID: ${latestDeal.id}`)
    console.log(`   Date: ${latestDeal.date}`)
    console.log(`   Sale Party: ${latestDeal.saleParty}`)
    console.log(`   Product: ${latestDeal.productCode}`)
    
    // Test sync to Google Sheets
    console.log('\n📤 Syncing to Google Sheets...')
    await syncToGoogleSheets(latestDeal)
    
    console.log('✅ Sync test completed successfully!')
    console.log('\n📊 Expected Google Sheets format:')
    console.log('   Column A: Empty')
    console.log(`   Column B: ${latestDeal.date}`)
    console.log(`   Column C: ${latestDeal.saleParty}`)
    console.log(`   Column D: ${latestDeal.quantitySold}`)
    console.log(`   Column E: ${latestDeal.saleRate}`)
    console.log(`   Column F: ${latestDeal.deliveryTerms}`)
    console.log(`   Column G: ${latestDeal.productCode}`)
    console.log(`   Column H: ${latestDeal.grade}`)
    console.log(`   Column I: ${latestDeal.company}`)
    console.log(`   Column J: ${latestDeal.specificGrade}`)
    console.log(`   Column K: ${latestDeal.purchaseParty}`)
    console.log(`   Column L: ${latestDeal.purchaseQuantity}`)
    console.log(`   Column M: ${latestDeal.purchaseRate}`)
    
  } catch (error) {
    console.error('❌ Sync test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testSyncFormat()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })