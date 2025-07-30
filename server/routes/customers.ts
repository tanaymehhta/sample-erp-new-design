import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get all customers (sale parties)
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.saleParty.findMany({
      orderBy: { partyName: 'asc' }
    })
    res.json({ success: true, data: customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customers',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customerData = req.body
    
    const customer = await prisma.saleParty.create({
      data: customerData
    })

    res.json({ 
      success: true, 
      data: customer,
      message: 'Customer created successfully'
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})


// Get customers statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCustomers = await prisma.saleParty.count()
    
    res.json({ 
      success: true, 
      data: { 
        total: totalCustomers 
      } 
    })
  } catch (error) {
    console.error('Error fetching customers stats:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customers statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})


// Bulk import customers - imports customer list from CSV/Excel files
router.post('/import', async (req, res) => {
  res.json({ success: true, message: 'Import customers endpoint - TODO: implement bulk import' })
})

// Export customer data - generates customer reports in multiple formats
router.get('/export', async (req, res) => {
  res.json({ success: true, message: 'Export customers endpoint - TODO: implement data export' })
})

// Search customers with filters - advanced customer search by name, location, deal volume
router.get('/search', async (req, res) => {
  res.json({ success: true, message: 'Search customers endpoint - TODO: implement flexible search' })
})

// Get customer suggestions for autocomplete - provides typeahead suggestions for forms
router.get('/suggestions', async (req, res) => {
  res.json({ success: true, message: 'Customer suggestions endpoint - TODO: implement autocomplete' })
})

export default router