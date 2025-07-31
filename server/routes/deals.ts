import express from 'express'
import { PrismaClient } from '@prisma/client'
import { sendDealNotifications } from '../services/notificationService'
import { syncToGoogleSheets } from '../services/googleSheets'
import { inventoryManager } from '../services/inventoryManager'

const router = express.Router()
const prisma = new PrismaClient()

// Get all deals with pagination
router.get('/', async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const skip = (page - 1) * limit

    // Get total count for pagination info
    const total = await prisma.deal.count()
    
    // Fetch paginated deals
    const deals = await prisma.deal.findMany({
      skip: skip,
      take: limit,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    
    res.json({ 
      success: true, 
      data: deals,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })
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
    if (result && (dealData.saleSource === 'new' || dealData.saleSource === 'New Material')) {
      inventoryManager.addRemainingStock(result).catch(error => {
        console.error('Failed to add remaining stock to inventory:', error)
      })
    }

    // Send WhatsApp notifications (non-blocking)
    if (result) {
      const dealForNotifications = {
        ...result,
        saleComments: result.saleComments || undefined,
        purchaseComments: result.purchaseComments || undefined,
        finalComments: result.finalComments || undefined,
        warehouse: result.warehouse || undefined
      }
      sendDealNotifications(dealForNotifications as any).catch(error => {
        console.error('Notification sending failed:', error)
      })
    }

    // Sync to Google Sheets (non-blocking)
    if (result) {
      const dealForSheets = {
        ...result,
        saleComments: result.saleComments || undefined,
        purchaseComments: result.purchaseComments || undefined,
        finalComments: result.finalComments || undefined,
        warehouse: result.warehouse || undefined
      }
      syncToGoogleSheets(dealForSheets as any).catch(error => {
        console.error('Google Sheets sync failed:', error)
      })
    }

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


// Get deals statistics
router.get('/stats', async (req, res) => {
  try {
    const totalDeals = await prisma.deal.count()
    
    res.json({ 
      success: true, 
      data: { 
        total: totalDeals 
      } 
    })
  } catch (error) {
    console.error('Error fetching deals stats:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch deals statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Validate deal data before submission - provides real-time field validation for deal forms
router.post('/validate', async (req, res) => {
  res.json({ success: true, message: 'Deal validation endpoint - TODO: implement validation logic' })
})

// Save incomplete deals as drafts - allows users to save and resume deal creation later
router.post('/draft', async (req, res) => {
  res.json({ success: true, message: 'Save deal draft endpoint - TODO: implement draft saving' })
})

// Resume draft deals - retrieves previously saved incomplete deals
router.get('/drafts', async (req, res) => {
  res.json({ success: true, message: 'Get deal drafts endpoint - TODO: implement draft retrieval' })
})


// Update multiple deals at once - bulk operations for efficiency
router.post('/bulk-update', async (req, res) => {
  res.json({ success: true, message: 'Bulk update deals endpoint - TODO: implement bulk operations' })
})

// Get deal templates - common deal patterns for quick creation
router.get('/templates', async (req, res) => {
  res.json({ success: true, message: 'Deal templates endpoint - TODO: implement template system' })
})

// Advanced deal search with filters - supports complex queries with date ranges, parties, products
router.get('/search', async (req, res) => {
  res.json({ success: true, message: 'Advanced deal search endpoint - TODO: implement flexible search' })
})

// Export deals in various formats - generates Excel, PDF, CSV files for reporting
router.get('/export', async (req, res) => {
  res.json({ success: true, message: 'Export deals endpoint - TODO: implement multi-format export' })
})

export default router