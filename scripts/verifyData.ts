import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying generated data...\n')
  
  // Count total deals
  const totalDeals = await prisma.deal.count()
  console.log('📊 Total deals:', totalDeals)
  
  // Check date range
  const deals = await prisma.deal.findMany({
    select: { date: true },
    orderBy: { createdAt: 'asc' }
  })
  console.log('📅 Date range:', deals[0]?.date, 'to', deals[deals.length-1]?.date)
  
  // Verify monthly distribution
  const monthlyStats = await prisma.deal.groupBy({
    by: ['date'],
    _count: { id: true }
  })
  
  // Group by month/year
  const monthlyData: Record<string, number> = {}
  monthlyStats.forEach(stat => {
    const [day, month, year] = stat.date.split('-')
    const key = `${month}/${year}`
    monthlyData[key] = (monthlyData[key] || 0) + stat._count.id
  })
  
  console.log('\n📈 Monthly distribution (first 10 months):')
  Object.entries(monthlyData).slice(0, 10).forEach(([month, count]) => {
    console.log(`  ${month}: ${count} deals`)
  })
  
  // Check inventory items
  const inventoryCount = await prisma.inventory.count()
  console.log('\n📦 Inventory items:', inventoryCount)
  
  // Check average quantities and pricing
  const avgStats = await prisma.deal.aggregate({
    _avg: {
      quantitySold: true,
      saleRate: true,
      purchaseRate: true
    },
    _sum: {
      quantitySold: true
    }
  })
  
  console.log('\n💰 Pricing Statistics:')
  console.log('  Average sale rate: ₹' + avgStats._avg.saleRate?.toFixed(2))
  console.log('  Average purchase rate: ₹' + avgStats._avg.purchaseRate?.toFixed(2))
  console.log('  Average quantity sold:', (avgStats._avg.quantitySold! / 1000).toFixed(1), 'tons')
  console.log('  Total volume sold:', (avgStats._sum.quantitySold! / 1000000).toFixed(1), 'million tons')
  
  // Check margin distribution
  const dealsWithMargin = await prisma.deal.findMany({
    select: { saleRate: true, purchaseRate: true }
  })
  
  const margins = dealsWithMargin
    .filter(d => d.purchaseRate > 0)
    .map(d => ((d.saleRate - d.purchaseRate) / d.purchaseRate * 100))
  
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length
  const minMargin = Math.min(...margins)
  const maxMargin = Math.max(...margins)
  
  console.log('\n📊 Margin Analysis:')
  console.log('  Average margin:', avgMargin.toFixed(2) + '%')
  console.log('  Margin range:', minMargin.toFixed(2) + '% to', maxMargin.toFixed(2) + '%')
  
  // Check sale source distribution
  const saleSourceStats = await prisma.deal.groupBy({
    by: ['saleSource'],
    _count: { id: true }
  })
  
  console.log('\n🏭 Sale Source Distribution:')
  saleSourceStats.forEach(stat => {
    const percentage = (stat._count.id / totalDeals * 100).toFixed(1)
    console.log(`  ${stat.saleSource}: ${stat._count.id} deals (${percentage}%)`)
  })
  
  console.log('\n✅ Data verification complete!')
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })