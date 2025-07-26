import { PrismaClient } from '@prisma/client'
import { saleParties, purchaseParties, products } from '../src/data/mockData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.deal.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.saleParty.deleteMany()
  await prisma.purchaseParty.deleteMany()

  // Seed products
  console.log('📦 Adding products...')
  for (const product of products) {
    await prisma.product.create({
      data: {
        productCode: product.productCode,
        grade: product.grade,
        company: product.company,
        specificGrade: product.specificGrade,
      }
    })
  }

  // Seed sale parties (customers)
  console.log('👥 Adding customers...')
  for (const party of saleParties) {
    await prisma.saleParty.create({
      data: {
        partyName: party,
      }
    })
  }

  // Seed purchase parties (suppliers)
  console.log('🏭 Adding suppliers...')
  for (const party of purchaseParties) {
    await prisma.purchaseParty.create({
      data: {
        partyName: party,
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${products.length} products`)
  console.log(`👥 Created ${saleParties.length} customers`)
  console.log(`🏭 Created ${purchaseParties.length} suppliers`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })