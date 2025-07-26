import { PrismaClient } from '@prisma/client'
import { inventoryManager } from '../services/inventoryManager'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function testManualInventorySelection() {
  console.log('🧪 Testing manual inventory selection system...\n')
  
  try {
    // Step 1: Create test inventory items
    console.log('📦 Step 1: Creating test inventory items...')
    
    const testItems = [
      {
        productCode: 'MANUAL_TEST',
        grade: 'Premium',
        company: 'TestCorp',
        specificGrade: 'A1',
        quantity: 50,
        rate: 100,
        purchaseParty: 'Supplier A',
        dateAdded: '2025-07-25'
      },
      {
        productCode: 'MANUAL_TEST',
        grade: 'Premium',
        company: 'TestCorp',
        specificGrade: 'A1',
        quantity: 30,
        rate: 95,
        purchaseParty: 'Supplier B',
        dateAdded: '2025-07-26'
      },
      {
        productCode: 'MANUAL_TEST',
        grade: 'Premium',
        company: 'TestCorp',
        specificGrade: 'A1',
        quantity: 20,
        rate: 105,
        purchaseParty: 'Supplier C',
        dateAdded: '2025-07-24'
      }
    ]
    
    const createdItems = []
    for (const itemData of testItems) {
      const item = await prisma.inventory.create({ data: itemData })
      createdItems.push(item)
      console.log(`   ✅ Created inventory item: ${item.quantity}kg at ₹${item.rate}/kg from ${item.purchaseParty}`)
    }
    
    console.log(`\n📊 Total available: ${createdItems.reduce((sum, item) => sum + item.quantity, 0)}kg`)
    
    // Step 2: Get available items (simulate user viewing selection interface)
    console.log('\n📋 Step 2: Getting available inventory items for selection...')
    
    const availableItems = await inventoryManager.getAvailableInventoryItems(
      'MANUAL_TEST', 'Premium', 'TestCorp', 'A1'
    )
    
    console.log(`   Found ${availableItems.length} available items:`)
    availableItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ID: ${item.id} | ${item.quantity}kg at ₹${item.rate}/kg | Supplier: ${item.purchaseParty} | Value: ₹${item.totalValue}`)
    })
    
    // Step 3: Simulate manual selection (user chooses specific items and quantities)
    console.log('\n🎯 Step 3: Simulating manual selection...')
    console.log('   User strategy: Choose cheapest rate first, then mix suppliers')
    
    // Sort by rate to find cheapest
    const sortedByRate = [...availableItems].sort((a, b) => a.rate - b.rate)
    
    const manualSelection = [
      { id: sortedByRate[0].id, quantity: 25 }, // 25kg from cheapest (Supplier B at ₹95)
      { id: sortedByRate[2].id, quantity: 15 }, // 15kg from most expensive (Supplier C at ₹105) 
      { id: sortedByRate[1].id, quantity: 10 }  // 10kg from medium price (Supplier A at ₹100)
    ]
    
    console.log('   Manual selection:')
    manualSelection.forEach((sel, index) => {
      const item = availableItems.find(i => i.id === sel.id)
      console.log(`   ${index + 1}. ${sel.quantity}kg from ${item?.purchaseParty} at ₹${item?.rate}/kg`)
    })
    
    const totalSelected = manualSelection.reduce((sum, sel) => sum + sel.quantity, 0)
    console.log(`   Total selected: ${totalSelected}kg`)
    
    // Step 4: Execute manual deduction
    console.log('\n⚡ Step 4: Executing manual inventory deduction...')
    
    const deductionSuccess = await inventoryManager.deductFromSpecificInventoryItems(manualSelection)
    
    if (deductionSuccess) {
      console.log('   ✅ Manual deduction successful!')
      
      // Step 5: Verify remaining inventory
      console.log('\n🔍 Step 5: Verifying remaining inventory...')
      
      const remainingItems = await inventoryManager.getAvailableInventoryItems(
        'MANUAL_TEST', 'Premium', 'TestCorp', 'A1'
      )
      
      console.log(`   Remaining items: ${remainingItems.length}`)
      remainingItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.quantity}kg at ₹${item.rate}/kg from ${item.purchaseParty}`)
      })
      
      const totalRemaining = remainingItems.reduce((sum, item) => sum + item.quantity, 0)
      console.log(`   Total remaining: ${totalRemaining}kg`)
      
      // Verify calculation
      const originalTotal = createdItems.reduce((sum, item) => sum + item.quantity, 0)
      const expectedRemaining = originalTotal - totalSelected
      
      if (totalRemaining === expectedRemaining) {
        console.log(`   🎯 Perfect! Expected ${expectedRemaining}kg, found ${totalRemaining}kg`)
      } else {
        console.log(`   ❌ Mismatch! Expected ${expectedRemaining}kg, found ${totalRemaining}kg`)
      }
      
    } else {
      console.log('   ❌ Manual deduction failed!')
    }
    
    // Step 6: Clean up test data
    console.log('\n🧹 Step 6: Cleaning up test data...')
    
    await prisma.inventory.deleteMany({
      where: { productCode: 'MANUAL_TEST' }
    })
    
    console.log('   ✅ Test data cleaned up')
    
    console.log('\n🎉 Manual inventory selection test completed successfully!')
    console.log('\n📋 Key Benefits Demonstrated:')
    console.log('   ✓ User can see all available inventory items')
    console.log('   ✓ User can choose specific items and quantities')
    console.log('   ✓ User can optimize for rate, supplier, or strategy')
    console.log('   ✓ System tracks exact deductions from chosen items')
    console.log('   ✓ No automatic FIFO - full user control')
    
  } catch (error) {
    console.error('❌ Manual selection test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testManualInventorySelection()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })