import { useState, useEffect } from 'react'
import { inventoryService, InventoryItem } from '../services/inventoryService'
import { ApiResponse } from '../../../shared/types/api'

export interface InventorySummary {
  totalItems: number
  totalQuantity: number
  totalValue: number
  topProducts: Array<{
    product: string
    quantity: number
  }>
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventoryService.getAllInventory()
      
      if (response.success && response.data) {
        setInventory(response.data)
      } else {
        setError('Failed to fetch inventory')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInventoryItem = async (item: any) => {
    try {
      const response = await inventoryService.createInventoryItem(item)
      if (response.success) {
        await fetchInventory() // Refresh the list
        return response
      }
      throw new Error(response.error || 'Failed to create inventory item')
    } catch (err) {
      throw err
    }
  }

  const updateInventoryItem = async (id: string, item: any) => {
    try {
      const response = await inventoryService.updateInventoryItem(id, item)
      if (response.success) {
        await fetchInventory() // Refresh the list
        return response
      }
      throw new Error(response.error || 'Failed to update inventory item')
    } catch (err) {
      throw err
    }
  }

  const deleteInventoryItem = async (id: string) => {
    try {
      const response = await inventoryService.deleteInventoryItem(id)
      if (response.success) {
        await fetchInventory() // Refresh the list
        return response
      }
      throw new Error(response.error || 'Failed to delete inventory item')
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // Calculate summary from inventory data
  const summary: InventorySummary = {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.rate), 0),
    topProducts: Object.entries(
      inventory.reduce((acc, item) => {
        const key = `${item.productCode} - ${item.grade}`
        acc[key] = (acc[key] || 0) + item.quantity
        return acc
      }, {} as Record<string, number>)
    )
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product, quantity]) => ({ product, quantity }))
  }

  return {
    inventory,
    summary,
    loading,
    error,
    refetch: fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  }
}