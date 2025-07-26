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

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const item = await prisma.inventory.findUnique({
      where: { id }
    })
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inventory item not found' 
      })
    }
    
    res.json({ success: true, data: item })
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory item',
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const inventoryItem = await prisma.inventory.update({
      where: { id },
      data: {
        ...updateData,
        quantity: updateData.quantity !== undefined ? parseFloat(updateData.quantity) : undefined,
        rate: updateData.rate !== undefined ? parseFloat(updateData.rate) : undefined
      }
    })

    res.json({ 
      success: true, 
      data: inventoryItem,
      message: 'Inventory item updated successfully'
    })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.inventory.delete({
      where: { id }
    })

    res.json({ 
      success: true, 
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

export default router