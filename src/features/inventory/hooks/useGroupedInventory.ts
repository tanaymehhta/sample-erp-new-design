import { useState, useMemo } from 'react'
import { useInventory } from './useInventory'
import { groupInventoryByProduct, calculateGroupedSummary } from '../utils/inventoryGrouper'

export function useGroupedInventory() {
  // Get raw inventory data
  const { inventory, loading, error, refetch, createInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory()
  
  // Track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  // Transform raw inventory into grouped data
  const groupedInventory = useMemo(() => {
    return groupInventoryByProduct(inventory)
  }, [inventory])
  
  // Calculate updated summary with grouped data
  const groupedSummary = useMemo(() => {
    return calculateGroupedSummary(groupedInventory)
  }, [groupedInventory])
  
  // Toggle expansion state for a product
  const toggleExpansion = (productKey: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productKey)) {
        newSet.delete(productKey)
      } else {
        newSet.add(productKey)
      }
      return newSet
    })
  }
  
  // Check if a product is expanded
  const isExpanded = (productKey: string) => {
    return expandedItems.has(productKey)
  }
  
  // Expand all items
  const expandAll = () => {
    const allKeys = groupedInventory.map(item => item.productKey)
    setExpandedItems(new Set(allKeys))
  }
  
  // Collapse all items
  const collapseAll = () => {
    setExpandedItems(new Set())
  }
  
  // Get expansion statistics
  const expansionStats = {
    expandedCount: expandedItems.size,
    totalCount: groupedInventory.length,
    isAllExpanded: expandedItems.size === groupedInventory.length,
    isNoneExpanded: expandedItems.size === 0
  }
  
  return {
    // Raw inventory data
    rawInventory: inventory,
    
    // Grouped inventory data
    groupedInventory,
    groupedSummary,
    
    // Loading states
    loading,
    error,
    
    // Expansion state management
    expandedItems,
    toggleExpansion,
    isExpanded,
    expandAll,
    collapseAll,
    expansionStats,
    
    // Actions
    refetch,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  }
}