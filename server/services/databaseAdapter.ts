import { PrismaClient } from '@prisma/client'
import { Deal } from '../../src/features/deals/types'
import { DatabaseServiceInterface } from '../../src/features/sync/services/dealSyncService'

class DatabaseAdapter implements DatabaseServiceInterface {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async getAllDeals(): Promise<Deal[]> {
    const deals = await this.prisma.deal.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return deals.map(this.prismaToTypeDeal)
  }

  async getDealById(id: string): Promise<Deal | null> {
    const deal = await this.prisma.deal.findUnique({
      where: { id }
    })
    
    return deal ? this.prismaToTypeDeal(deal) : null
  }

  async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const created = await this.prisma.deal.create({
      data: {
        ...dealData,
        quantitySold: dealData.quantitySold,
        saleRate: dealData.saleRate,
        purchaseQuantity: dealData.purchaseQuantity,
        purchaseRate: dealData.purchaseRate
      }
    })
    
    return this.prismaToTypeDeal(created)
  }

  async updateDeal(id: string, dealData: Partial<Deal>): Promise<Deal> {
    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        ...dealData,
        quantitySold: dealData.quantitySold !== undefined ? dealData.quantitySold : undefined,
        saleRate: dealData.saleRate !== undefined ? dealData.saleRate : undefined,
        purchaseQuantity: dealData.purchaseQuantity !== undefined ? dealData.purchaseQuantity : undefined,
        purchaseRate: dealData.purchaseRate !== undefined ? dealData.purchaseRate : undefined
      }
    })
    
    return this.prismaToTypeDeal(updated)
  }

  async deleteDeal(id: string): Promise<void> {
    await this.prisma.deal.delete({
      where: { id }
    })
  }

  private prismaToTypeDeal(prismaDeal: any): Deal {
    return {
      id: prismaDeal.id,
      date: prismaDeal.date,
      saleParty: prismaDeal.saleParty,
      quantitySold: prismaDeal.quantitySold,
      saleRate: prismaDeal.saleRate,
      deliveryTerms: prismaDeal.deliveryTerms as 'delivered' | 'pickup',
      productCode: prismaDeal.productCode,
      grade: prismaDeal.grade,
      company: prismaDeal.company,
      specificGrade: prismaDeal.specificGrade,
      saleSource: prismaDeal.saleSource as 'new' | 'inventory',
      purchaseParty: prismaDeal.purchaseParty,
      purchaseQuantity: prismaDeal.purchaseQuantity,
      purchaseRate: prismaDeal.purchaseRate,
      saleComments: prismaDeal.saleComments,
      purchaseComments: prismaDeal.purchaseComments,
      finalComments: prismaDeal.finalComments,
      warehouse: prismaDeal.warehouse,
      createdAt: prismaDeal.createdAt,
      updatedAt: prismaDeal.updatedAt
    }
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

// Singleton instance
export const databaseAdapter = new DatabaseAdapter()
export default DatabaseAdapter