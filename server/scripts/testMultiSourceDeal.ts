import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMultiSourceDeal() {
  try {
    console.log('🧪 Testing Multi-Source Deal Registration')
    
    // First, ensure we have some inventory items
    console.log('\n📦 Setting up test inventory...')
    
    // Create test inventory items
    const testInventory = [
      {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Bharat Petroleum Corp Ltd (BPCL)',
        specificGrade: 'Standard',
        quantity: 27000,
        rate: 90,
        purchaseParty: 'Bharat Petroleum Corp Ltd (BPCL)',
        dateAdded: '26-07-2025'
      },
      {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Venkatesh PolyBlend Pvt Ltd',
        specificGrade: 'Standard',
        quantity: 2804.7,
        rate: 123.75,
        purchaseParty: 'Venkatesh PolyBlend Pvt Ltd',
        dateAdded: '18-04-2024'
      },
      {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip',
        company: 'Venkatesh PolyBlend Pvt Ltd',
        specificGrade: 'Standard',
        quantity: 1092.7,
        rate: 123.75,
        purchaseParty: 'Venkatesh PolyBlend Pvt Ltd',
        dateAdded: '01-01-2025'
      }
    ]
    
    // Clean up any existing test inventory
    await prisma.inventory.deleteMany({
      where: {
        productCode: '010F18A',
        grade: 'IOCL • LL 1 Mfi Slip'
      }
    })
    
    // Create test inventory items
    const createdInventory = []
    for (const item of testInventory) {
      const created = await prisma.inventory.create({ data: item })
      createdInventory.push(created)
      console.log(`✅ Created inventory: ${item.quantity}kg from ${item.purchaseParty} @ ₹${item.rate}/kg`)
    }
    
    console.log('\n🤝 Creating multi-source deal...')
    
    // Test multi-source deal data (matching the screenshot scenario)
    const testDealData = {
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
      purchaseParty: 'Multiple Suppliers', // For backward compatibility
      purchaseQuantity: 30000,
      purchaseRate: 95.42, // Average rate
      selectedInventoryItems: [
        { id: createdInventory[0].id, quantity: 27000 }, // Bharat Petroleum
        { id: createdInventory[1].id, quantity: 2000 },  // Venkatesh #1
        { id: createdInventory[2].id, quantity: 1000 }   // Venkatesh #2
      ]
    }
    
    // Make API call to create deal
    const response = await fetch('http://localhost:3001/api/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDealData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Multi-source deal created successfully!')
      console.log('📋 Deal ID:', result.data.id)
      
      // Verify deal sources were created
      const dealWithSources = await prisma.deal.findUnique({
        where: { id: result.data.id },
        include: {
          sources: {
            orderBy: { selectionOrder: 'asc' },
            include: { inventory: true }
          }
        }
      })
      
      console.log('\n📊 Deal Sources Verification:')
      if (dealWithSources?.sources) {
        dealWithSources.sources.forEach((source, index) => {
          console.log(`${index + 1}. ${source.quantityUsed}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg = ₹${(source.quantityUsed * source.costPerKg).toLocaleString()}`)
        })
        
        const totalCost = dealWithSources.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0)
        const totalQuantity = dealWithSources.sources.reduce((sum, s) => sum + s.quantityUsed, 0)
        console.log(`\n💰 Total Cost: ₹${totalCost.toLocaleString()}`)
        console.log(`📦 Total Quantity: ${totalQuantity.toLocaleString()}kg`)
        console.log(`💵 Sale Value: ₹${(dealWithSources.quantitySold * dealWithSources.saleRate).toLocaleString()}`)
        console.log(`📈 Profit: ₹${((dealWithSources.quantitySold * dealWithSources.saleRate) - totalCost).toLocaleString()}`)
      }
      
      // Verify inventory was deducted
      console.log('\n📦 Inventory Verification:')
      for (const inventoryItem of createdInventory) {
        const updated = await prisma.inventory.findUnique({
          where: { id: inventoryItem.id }
        })
        
        if (updated) {
          console.log(`✅ ${inventoryItem.purchaseParty}: ${inventoryItem.quantity}kg → ${updated.quantity}kg`)
        } else {
          console.log(`❌ ${inventoryItem.purchaseParty}: Item deleted (quantity reached 0)`)
        }
      }
      
    } else {
      console.error('❌ Deal creation failed:', result.error)
      console.error('Message:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testMultiSourceDeal()