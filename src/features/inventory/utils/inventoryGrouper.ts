import { InventoryItem } from '../services/inventoryService'

export interface GroupedInventoryItem {
  // Unique identifier for this product group
  productKey: string
  
  // Product identification
  productCode: string
  grade: string
  company: string
  specificGrade: string
  
  // Aggregated values
  totalQuantity: number
  totalValue: number
  averageRate: number
  purchaseCount: number
  
  // Individual purchase details
  purchases: InventoryItem[]
  
  // Dates
  firstPurchaseDate: string
  lastPurchaseDate: string
}

/**
 * Groups inventory items by product specifications
 * Combines multiple purchases of the same product into single entries
 */
export function groupInventoryByProduct(inventory: InventoryItem[]): GroupedInventoryItem[] {
  // Group items by product specifications
  const groups = new Map<string, InventoryItem[]>()
  
  inventory.forEach(item => {
    // Create unique key for each product variant
    const productKey = `${item.productCode}|${item.grade}|${item.company}|${item.specificGrade}`
    
    if (!groups.has(productKey)) {
      groups.set(productKey, [])
    }
    groups.get(productKey)!.push(item)
  })
  
  // Transform groups into aggregated items
  const groupedItems: GroupedInventoryItem[] = []
  
  groups.forEach((purchases, productKey) => {
    // Sort purchases by date (most recent first)
    const sortedPurchases = purchases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Calculate aggregated values
    const totalQuantity = purchases.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = purchases.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    const averageRate = totalQuantity > 0 ? totalValue / totalQuantity : 0
    
    // Get date range with proper validation
    const dates = purchases.map(p => {
      const dateStr = p.dateAdded || p.createdAt
      const date = new Date(dateStr)
      // Return current date if invalid date
      return isNaN(date.getTime()) ? new Date() : date
    })
    
    const validDates = dates.filter(d => !isNaN(d.getTime()))
    const firstPurchaseDate = validDates.length > 0 
      ? new Date(Math.min(...validDates.map(d => d.getTime()))).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    const lastPurchaseDate = validDates.length > 0
      ? new Date(Math.max(...validDates.map(d => d.getTime()))).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    
    // Use the first item for product details
    const firstItem = sortedPurchases[0]
    
    groupedItems.push({
      productKey,
      productCode: firstItem.productCode,
      grade: firstItem.grade,
      company: firstItem.company,
      specificGrade: firstItem.specificGrade,
      totalQuantity,
      totalValue,
      averageRate,
      purchaseCount: purchases.length,
      purchases: sortedPurchases,
      firstPurchaseDate,
      lastPurchaseDate
    })
  })
  
  // Sort by total value (highest first)
  return groupedItems.sort((a, b) => b.totalValue - a.totalValue)
}

/**
 * Calculates summary statistics for grouped inventory
 */
export function calculateGroupedSummary(groupedInventory: GroupedInventoryItem[]) {
  return {
    totalUniqueProducts: groupedInventory.length,
    totalItems: groupedInventory.reduce((sum, group) => sum + group.purchaseCount, 0),
    totalQuantity: groupedInventory.reduce((sum, group) => sum + group.totalQuantity, 0),
    totalValue: groupedInventory.reduce((sum, group) => sum + group.totalValue, 0),
    topProducts: groupedInventory
      .slice(0, 5)
      .map(group => ({
        product: `${group.productCode} - ${group.grade}`,
        quantity: group.totalQuantity,
        value: group.totalValue
      }))
  }
}