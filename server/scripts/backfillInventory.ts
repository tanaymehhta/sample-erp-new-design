import { PrismaClient } from '@prisma/client'
import { inventoryManager } from '../services/inventoryManager'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function backfillInventoryFromDeals() {
  console.log('🔄 Starting inventory backfill from existing deals...\n')
  
  try {
    // Get all deals with "new" source (where we should have remaining inventory)
    console.log('📊 Fetching all deals with "new" material source...')
    const newMaterialDeals = await prisma.deal.findMany({
      where: {
        saleSource: 'New Material'
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`Found ${newMaterialDeals.length} deals with new material\n`)
    
    if (newMaterialDeals.length === 0) {
      console.log('ℹ️  No deals with new material found. Nothing to process.')
      return
    }
    
    let addedItems = 0
    let skippedItems = 0
    let totalRemainingStock = 0
    
    console.log('📦 Processing deals for remaining inventory...\n')
    
    for (let i = 0; i < newMaterialDeals.length; i++) {
      const deal = newMaterialDeals[i]
      const remainingQuantity = deal.purchaseQuantity - deal.quantitySold
      
      if (i % 100 === 0) {
        console.log(`Progress: ${i + 1}/${newMaterialDeals.length} deals processed...`)
      }
      
      if (remainingQuantity > 0) {
        try {
          const inventoryItem = await inventoryManager.addRemainingStock(deal)
          if (inventoryItem) {
            addedItems++
            totalRemainingStock += remainingQuantity
            
            if (addedItems <= 10) {
              console.log(`✅ Added ${remainingQuantity}kg from deal ${deal.id} (${deal.saleParty})`)
            }
          }
        } catch (error) {
          console.error(`❌ Failed to process deal ${deal.id}:`, error)
        }
      } else {
        skippedItems++
      }
      
      // Small delay to avoid overwhelming the database
      if (i % 50 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('\n📊 Backfill Summary:')
    console.log(`   Processed deals: ${newMaterialDeals.length}`)
    console.log(`   Added inventory items: ${addedItems}`)
    console.log(`   Skipped (no remaining stock): ${skippedItems}`)
    console.log(`   Total remaining stock added: ${totalRemainingStock}kg`)
    
    // Get updated inventory summary
    console.log('\n📦 Updated Inventory Summary:')
    const summary = await inventoryManager.getInventorySummary()
    console.log(`   Total inventory items: ${summary.totalItems}`)
    console.log(`   Total quantity: ${summary.totalQuantity}kg`)
    console.log(`   Total value: ₹${summary.totalValue.toFixed(2)}`)
    
    // Show top products by quantity
    const topProducts = Object.entries(summary.productSummary)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5)
    
    console.log('\n🏆 Top 5 Products by Inventory Quantity:')
    topProducts.forEach(([product, data], index) => {
      console.log(`   ${index + 1}. ${product}: ${data.quantity}kg (₹${data.value.toFixed(2)})`)
    })
    
    console.log('\n🎉 Inventory backfill completed successfully!')
    
  } catch (error) {
    console.error('❌ Inventory backfill failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if we should actually run the backfill
async function shouldRunBackfill() {
  try {
    const existingInventory = await prisma.inventory.count()
    const newMaterialDeals = await prisma.deal.count({
      where: { saleSource: 'New Material' }
    })
    
    console.log(`Current inventory items: ${existingInventory}`)
    console.log(`New material deals: ${newMaterialDeals}`)
    
    if (existingInventory === 0 && newMaterialDeals > 0) {
      console.log('🚀 No inventory found but new material deals exist. Running backfill...\n')
      return true
    } else if (existingInventory < newMaterialDeals * 0.5) {
      console.log('⚠️  Inventory items seem low compared to new material deals. Running backfill...\n')
      return true
    } else {
      console.log('ℹ️  Inventory seems already populated. Skipping backfill.')
      console.log('   To force backfill, delete existing inventory first.\n')
      return false
    }
  } catch (error) {
    console.error('❌ Failed to check backfill requirements:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if inventory backfill is needed...\n')
  
  const shouldRun = await shouldRunBackfill()
  
  if (shouldRun) {
    await backfillInventoryFromDeals()
  } else {
    console.log('✅ Backfill check completed. No action needed.')
  }
}

// Run the script
main()
  .then(() => {
    console.log('🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })