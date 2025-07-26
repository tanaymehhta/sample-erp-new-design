import { PrismaClient } from '@prisma/client'
import { saleParties, purchaseParties, products } from '../src/data/mockData'

const prisma = new PrismaClient()

// Helper function to generate random date within a specific month/year
function getRandomDateInMonth(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate()
  const day = Math.floor(Math.random() * daysInMonth) + 1
  return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`
}

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper function to generate price with realistic variation
function generatePrice(basePrice: number, variation: number = 0.2): number {
  const minPrice = basePrice * (1 - variation)
  const maxPrice = basePrice * (1 + variation)
  return Math.round((Math.random() * (maxPrice - minPrice) + minPrice) * 100) / 100
}

// Helper function to generate quantity (weighted towards common sizes)
function generateQuantity(): number {
  const weights = [
    { min: 1000, max: 5000, weight: 0.4 },    // Small orders
    { min: 5001, max: 15000, weight: 0.35 },  // Medium orders
    { min: 15001, max: 30000, weight: 0.2 },  // Large orders
    { min: 30001, max: 50000, weight: 0.05 }  // Bulk orders
  ]
  
  const random = Math.random()
  let cumWeight = 0
  
  for (const range of weights) {
    cumWeight += range.weight
    if (random <= cumWeight) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    }
  }
  
  return 5000 // fallback
}

// Inventory tracking
interface InventoryItem {
  productCode: string
  grade: string
  company: string
  specificGrade: string
  quantity: number
  purchaseRate: number
  purchaseParty: string
}

let inventory: InventoryItem[] = []

async function main() {
  console.log('🎯 Generating 3000 deals over 30 months (Jan 2023 - July 2025)...')
  
  // Clear existing deals
  await prisma.deal.deleteMany()
  await prisma.inventory.deleteMany()
  
  const targetDealsPerMonth = 100
  let totalDeals = 0
  
  // Generate deals from January 2023 to July 2025
  for (let year = 2023; year <= 2025; year++) {
    const endMonth = year === 2025 ? 7 : 12 // Only go till July 2025
    
    for (let month = 1; month <= endMonth; month++) {
      console.log(`📅 Generating deals for ${month}/${year}...`)
      
      const monthlyDeals: any[] = []
      const targetForMonth = year === 2025 && month === 7 ? 100 : targetDealsPerMonth
      
      for (let i = 0; i < targetForMonth; i++) {
        const product = getRandomItem(products)
        const saleParty = getRandomItem(saleParties)
        const purchaseParty = getRandomItem(purchaseParties)
        
        const date = getRandomDateInMonth(year, month)
        const quantitySold = generateQuantity()
        
        // Base prices around 100 with variation
        const basePurchaseRate = generatePrice(100, 0.3)
        const margin = 0.01 + Math.random() * 0.03 // 1-4% margin
        const saleRate = Math.round(basePurchaseRate * (1 + margin) * 100) / 100
        
        // Decide if selling from inventory or buying new material
        const inventoryItem = inventory.find(item => 
          item.productCode === product.productCode && 
          item.quantity >= quantitySold
        )
        
        let saleSource: string
        let purchaseQuantity: number
        let purchaseRate: number
        
        if (inventoryItem && Math.random() > 0.6) {
          // Sell from inventory (40% chance if available)
          saleSource = "From Inventory"
          purchaseQuantity = 0
          purchaseRate = inventoryItem.purchaseRate
          
          // Update inventory
          inventoryItem.quantity -= quantitySold
          if (inventoryItem.quantity <= 0) {
            inventory = inventory.filter(item => item !== inventoryItem)
          }
        } else {
          // Buy new material
          saleSource = "New Material"
          
          // Sometimes buy more than we sell (to build inventory)
          const extraStock = Math.random() > 0.7 ? generateQuantity() * 0.3 : 0
          purchaseQuantity = quantitySold + extraStock
          purchaseRate = basePurchaseRate
          
          // Add to inventory if we bought extra
          if (extraStock > 0) {
            const existingInventory = inventory.find(item => 
              item.productCode === product.productCode &&
              item.purchaseParty === purchaseParty
            )
            
            if (existingInventory) {
              existingInventory.quantity += extraStock
            } else {
              inventory.push({
                productCode: product.productCode,
                grade: product.grade,
                company: product.company,
                specificGrade: product.specificGrade,
                quantity: extraStock,
                purchaseRate: basePurchaseRate,
                purchaseParty: purchaseParty
              })
            }
          }
        }
        
        const deal = {
          date,
          saleParty,
          quantitySold,
          saleRate,
          deliveryTerms: Math.random() > 0.7 ? 'pickup' : 'delivered',
          productCode: product.productCode,
          grade: product.grade,
          company: product.company,
          specificGrade: product.specificGrade,
          saleSource,
          purchaseParty,
          purchaseQuantity,
          purchaseRate,
          saleComments: Math.random() > 0.8 ? 'Repeat customer' : null,
          purchaseComments: Math.random() > 0.9 ? 'Good quality material' : null,
          finalComments: null,
          warehouse: Math.random() > 0.5 ? 'Main Warehouse' : 'Secondary Warehouse'
        }
        
        monthlyDeals.push(deal)
        totalDeals++
      }
      
      // Insert monthly deals in batches
      await prisma.deal.createMany({
        data: monthlyDeals
      })
      
      console.log(`✅ Created ${monthlyDeals.length} deals for ${month}/${year}`)
    }
  }
  
  // Update final inventory in database
  if (inventory.length > 0) {
    const inventoryData = inventory.map(item => ({
      productCode: item.productCode,
      grade: item.grade,
      company: item.company,
      specificGrade: item.specificGrade,
      quantity: item.quantity,
      rate: item.purchaseRate,
      purchaseParty: item.purchaseParty,
      dateAdded: '01-01-2025' // Approximate date
    }))
    
    await prisma.inventory.createMany({
      data: inventoryData
    })
    
    console.log(`📦 Added ${inventory.length} items to inventory`)
  }
  
  console.log(`🎉 Successfully generated ${totalDeals} deals!`)
  console.log(`📊 Average: ${Math.round(totalDeals / 30)} deals per month`)
  
  // Generate summary statistics
  const totalQuantity = await prisma.deal.aggregate({
    _sum: { quantitySold: true }
  })
  
  const avgQuantityPerMonth = totalQuantity._sum.quantitySold! / 30 / 1000 // Convert to tons
  console.log(`📈 Average quantity per month: ${Math.round(avgQuantityPerMonth)} tons`)
}

main()
  .catch((e) => {
    console.error('❌ Error generating deals:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })