import express from 'express'
import { PrismaClient } from '@prisma/client'
import { sendWhatsAppNotifications } from '../services/whatsapp'
import { syncToGoogleSheets } from '../services/googleSheets'
import { inventoryManager } from '../services/inventoryManager'

const router = express.Router()
const prisma = new PrismaClient()

// Get all deals
router.get('/', async (req, res) => {
  try {
    const deals = await prisma.deal.findMany()
    
    // Sort by date (DD-MM-YYYY format) in descending order
    deals.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('-').map(Number)
      const [dayB, monthB, yearB] = b.date.split('-').map(Number)
      
      const dateA = new Date(yearA, monthA - 1, dayA)
      const dateB = new Date(yearB, monthB - 1, dayB)
      
      return dateB.getTime() - dateA.getTime() // Descending order
    })
    res.json({ success: true, data: deals })
  } catch (error) {
    console.error('Error fetching deals:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch deals',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create new deal
router.post('/', async (req, res) => {
  try {
    const dealData = req.body
    
    // Create deal in database with transaction for multi-source support
    const result = await prisma.$transaction(async (tx) => {
      // Prepare deal data with proper defaults for backward compatibility
      const dealCreateData = {
        ...dealData,
        quantitySold: parseFloat(dealData.quantitySold),
        saleRate: parseFloat(dealData.saleRate),
        purchaseQuantity: parseFloat(dealData.purchaseQuantity || 0),
        purchaseRate: parseFloat(dealData.purchaseRate || 0),
        // Ensure required fields have defaults for inventory deals
        purchaseParty: dealData.purchaseParty || 'Multiple Suppliers',
        warehouse: dealData.warehouse || null,
        saleComments: dealData.saleComments || null,
        purchaseComments: dealData.purchaseComments || null,
        finalComments: dealData.finalComments || null
      }

      // Create the main deal record
      const deal = await tx.deal.create({
        data: dealCreateData
      })

      // Handle multi-source inventory selection
      if (dealData.saleSource === 'inventory' || dealData.saleSource === 'From Inventory') {
        if (dealData.selectedInventoryItems && Array.isArray(dealData.selectedInventoryItems)) {
          console.log('📦 Processing multi-source inventory selection:', dealData.selectedInventoryItems.length, 'items')
          
          // Create DealSource records for each selected inventory item
          for (let i = 0; i < dealData.selectedInventoryItems.length; i++) {
            const item = dealData.selectedInventoryItems[i]
            
            // Get inventory item details
            const inventoryItem = await tx.inventory.findUnique({
              where: { id: item.id }
            })
            
            if (!inventoryItem) {
              throw new Error(`Inventory item ${item.id} not found`)
            }
            
            if (inventoryItem.quantity < item.quantity) {
              throw new Error(`Insufficient quantity in inventory item ${item.id}. Available: ${inventoryItem.quantity}kg, Required: ${item.quantity}kg`)
            }
            
            // Create deal source record
            await tx.dealSource.create({
              data: {
                dealId: deal.id,
                inventoryId: item.id,
                quantityUsed: parseFloat(item.quantity),
                costPerKg: inventoryItem.rate,
                supplierName: inventoryItem.purchaseParty,
                selectionOrder: i + 1
              }
            })
            
            // Deduct from inventory
            await tx.inventory.update({
              where: { id: item.id },
              data: {
                quantity: {
                  decrement: parseFloat(item.quantity)
                }
              }
            })
          }
        } else {
          console.log('⚠️  No specific inventory items selected for deal from inventory')
        }
      }

      // Fetch the complete deal with sources for notifications
      const dealWithSources = await tx.deal.findUnique({
        where: { id: deal.id },
        include: {
          sources: {
            orderBy: { selectionOrder: 'asc' },
            include: { inventory: true }
          }
        }
      })

      return dealWithSources
    })

    // Handle remaining stock for new material deals (outside transaction)
    if (dealData.saleSource === 'new' || dealData.saleSource === 'New Material') {
      inventoryManager.addRemainingStock(result).catch(error => {
        console.error('Failed to add remaining stock to inventory:', error)
      })
    }

    // Send WhatsApp notifications (non-blocking)
    sendWhatsAppNotifications(result).catch(error => {
      console.error('WhatsApp notification failed:', error)
    })

    // Sync to Google Sheets (non-blocking)
    syncToGoogleSheets(result).catch(error => {
      console.error('Google Sheets sync failed:', error)
    })

    res.json({ 
      success: true, 
      data: result,
      message: 'Deal registered successfully'
    })
  } catch (error) {
    console.error('Error creating deal:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create deal',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get deal by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deal = await prisma.deal.findUnique({
      where: { id }
    })
    
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        error: 'Deal not found' 
      })
    }
    
    res.json({ success: true, data: deal })
  } catch (error) {
    console.error('Error fetching deal:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch deal',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router