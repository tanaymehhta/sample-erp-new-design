import { PrismaClient } from '@prisma/client'
import { updateInventory } from './googleSheets'

const prisma = new PrismaClient()

export interface InventoryItem {
  id?: string
  productCode: string
  grade: string
  company: string
  specificGrade: string
  quantity: number
  rate: number
  purchaseParty: string
  dateAdded: string
}

export class InventoryManager {
  
  // Add remaining stock to inventory after a deal
  async addRemainingStock(deal: any): Promise<InventoryItem | null> {
    try {
      // Calculate remaining quantity
      const remainingQuantity = deal.purchaseQuantity - deal.quantitySold
      
      console.log(`📦 InventoryManager: Checking remaining stock for deal ${deal.id}`)
      console.log(`   Purchased: ${deal.purchaseQuantity}kg`)
      console.log(`   Sold: ${deal.quantitySold}kg`)
      console.log(`   Remaining: ${remainingQuantity}kg`)
      
      if (remainingQuantity <= 0) {
        console.log('ℹ️  No remaining stock to add (sold quantity >= purchased quantity)')
        return null
      }
      
      // Create inventory item for remaining stock
      const inventoryData = {
        productCode: deal.productCode,
        grade: deal.grade,
        company: deal.company,
        specificGrade: deal.specificGrade,
        quantity: remainingQuantity,
        rate: deal.purchaseRate,
        purchaseParty: deal.purchaseParty,
        dateAdded: deal.date
      }
      
      console.log(`📦 Adding ${remainingQuantity}kg to inventory...`)
      
      const inventoryItem = await prisma.inventory.create({
        data: inventoryData
      })
      
      // Sync to Google Sheets (non-blocking)
      updateInventory(inventoryItem).catch(error => {
        console.error('Google Sheets inventory sync failed:', error)
      })
      
      console.log(`✅ Successfully added ${remainingQuantity}kg to inventory (ID: ${inventoryItem.id})`)
      
      return inventoryItem
      
    } catch (error) {
      console.error('❌ InventoryManager: Failed to add remaining stock:', error)
      throw error
    }
  }
  
  // Deduct stock from specific inventory items (manual selection)
  async deductFromSpecificInventoryItems(selectedItems: Array<{id: string, quantity: number}>): Promise<boolean> {
    try {
      console.log(`📦 InventoryManager: Deducting from ${selectedItems.length} specific inventory items`)
      
      const updates: Promise<any>[] = []
      
      for (const selection of selectedItems) {
        const { id, quantity } = selection
        
        // Get current inventory item
        const inventoryItem = await prisma.inventory.findUnique({
          where: { id }
        })
        
        if (!inventoryItem) {
          console.log(`❌ Inventory item ${id} not found`)
          return false
        }
        
        if (inventoryItem.quantity < quantity) {
          console.log(`❌ Insufficient stock in item ${id}: requested ${quantity}kg, available ${inventoryItem.quantity}kg`)
          return false
        }
        
        const newQuantity = inventoryItem.quantity - quantity
        
        console.log(`   Deducting ${quantity}kg from inventory item ${id}`)
        
        if (newQuantity === 0) {
          // Delete item if quantity becomes 0
          updates.push(prisma.inventory.delete({ where: { id } }))
          console.log(`   Deleting inventory item ${id} (quantity reached 0)`)
        } else {
          // Update quantity
          updates.push(prisma.inventory.update({
            where: { id },
            data: { quantity: newQuantity }
          }))
          console.log(`   Updated inventory item ${id} quantity to ${newQuantity}kg`)
        }
      }
      
      // Execute all updates
      await Promise.all(updates)
      
      const totalDeducted = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
      console.log(`✅ Successfully deducted ${totalDeducted}kg from ${selectedItems.length} inventory items`)
      return true
      
    } catch (error) {
      console.error('❌ InventoryManager: Failed to deduct from specific inventory items:', error)
      throw error
    }
  }
  
  // Get available inventory items for a specific product (for selection interface)
  async getAvailableInventoryItems(
    productCode: string, 
    grade: string, 
    company: string, 
    specificGrade: string
  ): Promise<any[]> {
    try {
      const inventoryItems = await prisma.inventory.findMany({
        where: {
          productCode,
          grade,
          company,
          specificGrade,
          quantity: { gt: 0 }
        },
        orderBy: { createdAt: 'desc' } // Show newest first for manual selection
      })
      
      console.log(`📦 Found ${inventoryItems.length} available inventory items for ${productCode}-${grade}-${company}-${specificGrade}`)
      
      return inventoryItems.map(item => ({
        id: item.id,
        productCode: item.productCode,
        grade: item.grade,
        company: item.company,
        specificGrade: item.specificGrade,
        quantity: item.quantity,
        rate: item.rate,
        purchaseParty: item.purchaseParty,
        dateAdded: item.dateAdded,
        totalValue: item.quantity * item.rate,
        createdAt: item.createdAt
      }))
    } catch (error) {
      console.error('❌ InventoryManager: Failed to get available inventory items:', error)
      return []
    }
  }
  
  // Get available inventory for a specific product
  async getAvailableStock(
    productCode: string, 
    grade: string, 
    company: string, 
    specificGrade: string
  ): Promise<number> {
    try {
      const inventoryItems = await prisma.inventory.findMany({
        where: {
          productCode,
          grade,
          company,
          specificGrade,
          quantity: { gt: 0 }
        }
      })
      
      const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
      
      console.log(`📦 Available stock for ${productCode}-${grade}-${company}-${specificGrade}: ${totalQuantity}kg`)
      
      return totalQuantity
    } catch (error) {
      console.error('❌ InventoryManager: Failed to get available stock:', error)
      return 0
    }
  }
  
  // Get inventory summary
  async getInventorySummary() {
    try {
      const inventory = await prisma.inventory.findMany()
      
      const totalItems = inventory.length
      const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0)
      const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
      
      const productSummary = inventory.reduce((acc, item) => {
        const key = `${item.productCode} - ${item.grade} - ${item.company}`
        if (!acc[key]) {
          acc[key] = { quantity: 0, value: 0, items: 0 }
        }
        acc[key].quantity += item.quantity
        acc[key].value += item.quantity * item.rate
        acc[key].items += 1
        return acc
      }, {} as Record<string, { quantity: number, value: number, items: number }>)
      
      return {
        totalItems,
        totalQuantity,
        totalValue,
        productSummary
      }
    } catch (error) {
      console.error('❌ InventoryManager: Failed to get inventory summary:', error)
      throw error
    }
  }
}

// Singleton instance
export const inventoryManager = new InventoryManager()
export default InventoryManager