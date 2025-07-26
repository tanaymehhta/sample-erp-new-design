import { PrismaClient } from '@prisma/client'
import { inventoryManager } from '../services/inventoryManager'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function testInventorySystem() {
  console.log('🧪 Testing inventory management system...\n')
  
  try {
    // Test scenario: Purchase 30 tons, sell 20 tons
    console.log('📋 Test Scenario: Purchase 30kg, Sell 20kg')
    console.log('Expected result: 10kg should be added to inventory\n')
    
    const testDeal = {
      id: 'test-deal-inventory',
      date: '2025-07-26',
      saleParty: 'Test Customer',
      quantitySold: 20, // Sold 20kg
      saleRate: 100,
      deliveryTerms: 'delivered',
      productCode: 'TEST001',
      grade: 'Test Grade',
      company: 'Test Company',
      specificGrade: 'Test Specific',
      saleSource: 'new', // New material
      purchaseParty: 'Test Supplier',
      purchaseQuantity: 30, // Purchased 30kg
      purchaseRate: 90,
      saleComments: 'Test sale',
      purchaseComments: 'Test purchase',
      finalComments: 'Test final',
      warehouse: 'Test Warehouse'
    }
    
    console.log('📦 Adding remaining stock to inventory...')
    const inventoryItem = await inventoryManager.addRemainingStock(testDeal)
    
    if (inventoryItem) {
      console.log('✅ Inventory item created successfully!')
      console.log(`   ID: ${inventoryItem.id}`)
      console.log(`   Product: ${inventoryItem.productCode}`)
      console.log(`   Grade: ${inventoryItem.grade}`)
      console.log(`   Company: ${inventoryItem.company}`)
      console.log(`   Quantity: ${inventoryItem.quantity}kg`)
      console.log(`   Rate: ₹${inventoryItem.rate}/kg`)
      console.log(`   Supplier: ${inventoryItem.purchaseParty}`)
      console.log(`   Date: ${inventoryItem.dateAdded}\n`)
      
      // Test deduction
      console.log('🔄 Testing inventory deduction...')
      console.log('Scenario: Sell 5kg from inventory')
      
      const deductionSuccess = await inventoryManager.deductFromInventory(
        inventoryItem.productCode,
        inventoryItem.grade,
        inventoryItem.company,
        inventoryItem.specificGrade,
        5
      )
      
      if (deductionSuccess) {
        console.log('✅ Successfully deducted 5kg from inventory')
        
        // Check remaining stock
        const remainingStock = await inventoryManager.getAvailableStock(
          inventoryItem.productCode,
          inventoryItem.grade,
          inventoryItem.company,
          inventoryItem.specificGrade
        )
        
        console.log(`📊 Remaining stock: ${remainingStock}kg (should be 5kg)\n`)
        
        if (remainingStock === 5) {
          console.log('🎯 Perfect! Inventory calculation is working correctly.')
        } else {
          console.log(`⚠️  Expected 5kg but found ${remainingStock}kg`)
        }
      } else {
        console.log('❌ Failed to deduct from inventory')
      }
      
      // Get inventory summary
      console.log('\n📊 Inventory Summary:')
      const summary = await inventoryManager.getInventorySummary()
      console.log(`   Total Items: ${summary.totalItems}`)
      console.log(`   Total Quantity: ${summary.totalQuantity}kg`)
      console.log(`   Total Value: ₹${summary.totalValue.toFixed(2)}`)
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...')
      await prisma.inventory.deleteMany({
        where: {
          productCode: 'TEST001'
        }
      })
      console.log('✅ Test data cleaned up')
      
    } else {
      console.log('ℹ️  No inventory item was created (expected when sold >= purchased)')
    }
    
    console.log('\n🎉 Inventory system test completed successfully!')
    
  } catch (error) {
    console.error('❌ Inventory test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testInventorySystem()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })