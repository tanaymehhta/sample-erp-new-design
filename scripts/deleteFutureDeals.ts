import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteFutureDeals() {
  try {
    console.log('🗑️  Deleting deals after July 27th, 2025...')
    
    // Find deals after July 27th, 2025 (date format is DD-MM-YYYY)
    const futureDeals = await prisma.$queryRaw`
      SELECT id, date, saleParty FROM deals WHERE 
      CASE 
          WHEN substr(date, 7, 4) > '2025' THEN 1
          WHEN substr(date, 7, 4) = '2025' AND substr(date, 4, 2) > '07' THEN 1
          WHEN substr(date, 7, 4) = '2025' AND substr(date, 4, 2) = '07' AND substr(date, 1, 2) > '27' THEN 1
          ELSE 0
      END = 1
    ` as any[]

    console.log(`Found ${futureDeals.length} deals to delete:`)
    futureDeals.forEach(deal => {
      console.log(`- ${deal.date}: ${deal.saleParty} (ID: ${deal.id})`)
    })

    if (futureDeals.length === 0) {
      console.log('✅ No future deals found to delete.')
      return
    }

    // Delete the deals
    const dealIds = futureDeals.map(deal => deal.id)
    
    // First delete related deal sources
    const deletedSources = await prisma.dealSource.deleteMany({
      where: {
        dealId: {
          in: dealIds
        }
      }
    })
    console.log(`🗑️  Deleted ${deletedSources.count} deal sources`)

    // Then delete the deals
    const deletedDeals = await prisma.deal.deleteMany({
      where: {
        id: {
          in: dealIds
        }
      }
    })
    
    console.log(`✅ Successfully deleted ${deletedDeals.count} deals after July 27th, 2025`)
  } catch (error) {
    console.error('❌ Error deleting future deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteFutureDeals()