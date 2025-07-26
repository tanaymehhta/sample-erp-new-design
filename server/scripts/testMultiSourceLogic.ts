import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMultiSourceLogic() {
  try {
    console.log('🧪 Testing Multi-Source Deal Logic (Direct Database)')
    
    // Clean up any existing test data
    await prisma.dealSource.deleteMany({})
    await prisma.deal.deleteMany({
      where: { saleParty: 'Test Customer ABC' }
    })
    await prisma.inventory.deleteMany({
      where: { productCode: '010F18A' }
    })
    
    console.log('\n📦 Setting up test inventory...')
    
    // Create test inventory items
    const inventory1 = await prisma.inventory.create({
      data: {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Bharat Petroleum Corp Ltd (BPCL)',
        specificGrade: 'Standard',
        quantity: 27000,
        rate: 90,
        purchaseParty: 'Bharat Petroleum Corp Ltd (BPCL)',
        dateAdded: '26-07-2025'
      }
    })
    
    const inventory2 = await prisma.inventory.create({
      data: {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Venkatesh PolyBlend Pvt Ltd',
        specificGrade: 'Standard',
        quantity: 2804.7,
        rate: 123.75,
        purchaseParty: 'Venkatesh PolyBlend Pvt Ltd',
        dateAdded: '18-04-2024'
      }
    })
    
    const inventory3 = await prisma.inventory.create({
      data: {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Venkatesh PolyBlend Pvt Ltd',
        specificGrade: 'Standard',
        quantity: 1092.7,
        rate: 123.75,
        purchaseParty: 'Venkatesh PolyBlend Pvt Ltd',
        dateAdded: '01-01-2025'
      }
    })
    
    console.log('✅ Created test inventory items')
    
    console.log('\n🤝 Creating multi-source deal with transaction...')
    
    // Simulate the deal creation logic
    const selectedItems = [
      { id: inventory1.id, quantity: 27000 },
      { id: inventory2.id, quantity: 2000 },
      { id: inventory3.id, quantity: 1000 }
    ]
    
    const result = await prisma.$transaction(async (tx) => {
      // Create the main deal record
      const deal = await tx.deal.create({
        data: {
          date: '26-07-2025',
          saleParty: 'Test Customer ABC',
          quantitySold: 30000,
          saleRate: 125,
          deliveryTerms: 'delivered',
          productCode: '010F18A',
          grade: 'IOCL • LL 1 Mfi Slip',
          company: 'Mixed Suppliers',
          specificGrade: 'Standard',
          saleSource: 'inventory',
          purchaseParty: 'Multiple Suppliers',
          purchaseQuantity: 30000,
          purchaseRate: 95.42
        }
      })
      
      console.log(`✅ Created deal: ${deal.id}`)
      
      // Create DealSource records for each selected inventory item
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i]
        
        // Get inventory item details
        const inventoryItem = await tx.inventory.findUnique({
          where: { id: item.id }
        })
        
        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.id} not found`)
        }
        
        if (inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient quantity in inventory item ${item.id}`)
        }
        
        // Create deal source record
        const dealSource = await tx.dealSource.create({
          data: {
            dealId: deal.id,
            inventoryId: item.id,
            quantityUsed: item.quantity,
            costPerKg: inventoryItem.rate,
            supplierName: inventoryItem.purchaseParty,
            selectionOrder: i + 1
          }
        })
        
        console.log(`✅ Created deal source: ${item.quantity}kg from ${inventoryItem.purchaseParty}`)
        
        // Deduct from inventory
        await tx.inventory.update({
          where: { id: item.id },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        })
        
        console.log(`✅ Deducted ${item.quantity}kg from inventory`)
      }
      
      // Fetch the complete deal with sources
      const dealWithSources = await tx.deal.findUnique({
        where: { id: deal.id },
        include: {
          sources: {
            orderBy: { selectionOrder: 'asc' },
            include: { inventory: true }
          }
        }
      })
      
      return dealWithSources
    })
    
    console.log('\n📊 Multi-Source Deal Created Successfully!')
    console.log(`Deal ID: ${result.id}`)
    console.log(`Customer: ${result.saleParty}`)
    console.log(`Total Quantity: ${result.quantitySold}kg`)
    console.log(`Sale Rate: ₹${result.saleRate}/kg`)
    
    console.log('\n📦 Source Breakdown:')
    if (result.sources) {
      result.sources.forEach((source, index) => {
        console.log(`${index + 1}. ${source.quantityUsed}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg = ₹${(source.quantityUsed * source.costPerKg).toLocaleString()}`)
      })
      
      const totalCost = result.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0)
      const saleValue = result.quantitySold * result.saleRate
      const profit = saleValue - totalCost
      
      console.log(`\n💰 Financial Summary:`)
      console.log(`Total Purchase Cost: ₹${totalCost.toLocaleString()}`)
      console.log(`Total Sale Value: ₹${saleValue.toLocaleString()}`)
      console.log(`Profit: ₹${profit.toLocaleString()}`)
      console.log(`Profit Margin: ${((profit / saleValue) * 100).toFixed(2)}%`)
    }
    
    console.log('\n📦 Inventory Status After Deal:')
    const inventoryAfter = await prisma.inventory.findMany({
      where: { productCode: '010F18A' }
    })
    
    inventoryAfter.forEach(item => {
      console.log(`${item.purchaseParty}: ${item.quantity}kg remaining`)
    })
    
    console.log('\n✅ Multi-source deal test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testMultiSourceLogic()