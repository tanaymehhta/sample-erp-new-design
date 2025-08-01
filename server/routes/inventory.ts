import express from 'express'
import { PrismaClient } from '@prisma/client'
import { updateInventory } from '../services/googleSheets'

const router = express.Router()
const prisma = new PrismaClient()

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    res.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})


// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const itemData = req.body
    
    const inventoryItem = await prisma.inventory.create({
      data: {
        ...itemData,
        quantity: parseFloat(itemData.quantity),
        rate: parseFloat(itemData.rate)
      }
    })

    // Sync to Google Sheets (non-blocking)
    updateInventory(inventoryItem).catch(error => {
      console.error('Google Sheets inventory sync failed:', error)
    })

    res.json({ 
      success: true, 
      data: inventoryItem,
      message: 'Inventory item created successfully'
    })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update inventory item
router.put('/update', async (req, res) => {
  try {
    const { id, ...updateData } = req.body
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
        message: 'Inventory item ID must be provided'
      })
    }
    
    // Convert numeric fields
    if (updateData.quantity !== undefined) {
      updateData.quantity = parseFloat(updateData.quantity)
    }
    if (updateData.rate !== undefined) {
      updateData.rate = parseFloat(updateData.rate)
    }
    
    const updatedItem = await prisma.inventory.update({
      where: { id },
      data: updateData
    })

    // Sync to Google Sheets (non-blocking)
    updateInventory(updatedItem).catch(error => {
      console.error('Google Sheets inventory sync failed:', error)
    })

    res.json({ 
      success: true, 
      data: updatedItem,
      message: 'Inventory item updated successfully'
    })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ 
        success: false, 
        error: 'Inventory item not found',
        message: `Inventory item with id ${req.body.id} not found`
      })
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update inventory item',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
})

// Delete inventory item
router.delete('/remove', async (req, res) => {
  try {
    const { id } = req.body
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
        message: 'Inventory item ID must be provided'
      })
    }
    
    // Check if inventory item exists before deletion
    const existingItem = await prisma.inventory.findUnique({
      where: { id }
    })
    
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        message: `Inventory item with id ${id} not found`
      })
    }
    
    // Check if item is referenced in any deals
    const referencedInDeals = await prisma.dealSource.findFirst({
      where: { inventoryId: id }
    })
    
    if (referencedInDeals) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete inventory item',
        message: 'This inventory item is referenced in existing deals and cannot be deleted'
      })
    }
    
    await prisma.inventory.delete({
      where: { id }
    })

    res.json({ 
      success: true, 
      data: null,
      message: 'Inventory item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get available inventory items for a specific product (for manual selection)
router.get('/available/:productCode/:grade/:company/:specificGrade', async (req, res) => {
  try {
    const { productCode, grade, company, specificGrade } = req.params
    
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        productCode,
        grade,
        company,
        specificGrade,
        quantity: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const formattedItems = inventoryItems.map(item => ({
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
    
    res.json({
      success: true,
      data: formattedItems,
      message: `Found ${formattedItems.length} available inventory items`
    })
    
  } catch (error) {
    console.error('Error fetching available inventory:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch available inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Deduct quantity from specific inventory items (manual selection)
router.post('/deduct-selected', async (req, res) => {
  try {
    const { selectedItems } = req.body
    // selectedItems format: [{ id: "inventory_id", quantity: 100 }, ...]
    
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid selectedItems',
        message: 'selectedItems must be an array with id and quantity for each item'
      })
    }
    
    const updates: Promise<any>[] = []
    
    for (const selection of selectedItems) {
      const { id, quantity } = selection
      
      if (!id || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid selection',
          message: 'Each selected item must have valid id and quantity'
        })
      }
      
      // Get current inventory item
      const inventoryItem = await prisma.inventory.findUnique({
        where: { id }
      })
      
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found',
          message: `Inventory item with id ${id} not found`
        })
      }
      
      if (inventoryItem.quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient stock',
          message: `Requested ${quantity}kg from item ${id} but only ${inventoryItem.quantity}kg available`
        })
      }
      
      const newQuantity = inventoryItem.quantity - quantity
      
      if (newQuantity === 0) {
        updates.push(prisma.inventory.delete({ where: { id } }))
      } else {
        updates.push(prisma.inventory.update({
          where: { id },
          data: { quantity: newQuantity }
        }))
      }
    }
    
    // Execute all updates
    await Promise.all(updates)
    
    const totalDeducted = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
    
    res.json({
      success: true,
      data: true,
      message: `Successfully deducted ${totalDeducted}kg from ${selectedItems.length} inventory items`
    })
    
  } catch (error) {
    console.error('Error deducting from selected inventory:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to deduct from selected inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get inventory summary
router.get('/summary/stats', async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany()
    
    const totalItems = inventory.length
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    
    const productCounts = inventory.reduce((acc, item) => {
      const key = `${item.productCode} - ${item.grade}`
      acc[key] = (acc[key] || 0) + item.quantity
      return acc
    }, {} as Record<string, number>)
    
    const topProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product, quantity]) => ({ product, quantity }))
    
    res.json({
      success: true,
      data: {
        totalItems,
        totalQuantity,
        totalValue,
        topProducts
      }
    })
  } catch (error) {
    console.error('Error fetching inventory summary:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get inventory statistics (total quantity)
router.get('/stats', async (req, res) => {
  try {
    const inventorySum = await prisma.inventory.aggregate({
      _sum: { quantity: true }
    })
    
    res.json({ 
      success: true, 
      data: { 
        total: inventorySum._sum.quantity || 0 
      } 
    })
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get inventory movement history - tracks all stock changes with timestamps and reasons
router.get('/movements', async (req, res) => {
  res.json({ success: true, message: 'Inventory movements endpoint - TODO: implement movement tracking' })
})

// Reserve inventory for deals - holds stock during deal creation process
router.post('/reserve', async (req, res) => {
  res.json({ success: true, message: 'Reserve inventory endpoint - TODO: implement stock reservation' })
})

// Release reserved inventory - frees up stock if deal creation fails
router.post('/release', async (req, res) => {
  res.json({ success: true, message: 'Release inventory endpoint - TODO: implement reservation release' })
})

// Get low stock alerts - identifies items below minimum threshold
router.get('/low-stock', async (req, res) => {
  res.json({ success: true, message: 'Low stock alerts endpoint - TODO: implement stock monitoring' })
})

// Manual stock adjustments - corrects inventory discrepancies with audit trail
router.post('/adjustments', async (req, res) => {
  res.json({ success: true, message: 'Stock adjustments endpoint - TODO: implement manual corrections' })
})

// Current inventory valuation - calculates total value of all stock at current rates
router.get('/valuation', async (req, res) => {
  res.json({ success: true, message: 'Inventory valuation endpoint - TODO: implement value calculation' })
})

// Bulk import inventory - imports multiple items from CSV/Excel files
router.post('/bulk-import', async (req, res) => {
  res.json({ success: true, message: 'Bulk import endpoint - TODO: implement file import' })
})

// Export inventory data - generates reports in multiple formats
router.get('/export', async (req, res) => {
  res.json({ success: true, message: 'Export inventory endpoint - TODO: implement data export' })
})

// Search inventory with filters - advanced filtering by product, date, quantity ranges
router.get('/search', async (req, res) => {
  res.json({ success: true, message: 'Search inventory endpoint - TODO: implement flexible search' })
})

// Get inventory aging report - shows how long items have been in stock
router.get('/aging', async (req, res) => {
  res.json({ success: true, message: 'Inventory aging endpoint - TODO: implement aging analysis' })
})

// Transfer inventory between locations - moves stock between warehouses
router.post('/transfer', async (req, res) => {
  res.json({ success: true, message: 'Inventory transfer endpoint - TODO: implement location transfers' })
})

export default router