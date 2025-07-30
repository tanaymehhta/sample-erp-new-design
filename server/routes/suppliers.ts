import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get all suppliers (purchase parties)
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.purchaseParty.findMany({
      orderBy: { partyName: 'asc' }
    })
    res.json({ success: true, data: suppliers })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch suppliers',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const supplierData = req.body
    
    const supplier = await prisma.purchaseParty.create({
      data: supplierData
    })

    res.json({ 
      success: true, 
      data: supplier,
      message: 'Supplier created successfully'
    })
  } catch (error) {
    console.error('Error creating supplier:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create supplier',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})


// Get supplier statistics - counts total suppliers
router.get('/stats', async (req, res) => {
  res.json({ success: true, message: 'Supplier stats endpoint - TODO: implement supplier statistics' })
})

// Search suppliers with filters - advanced supplier search by name, location, performance
router.get('/search', async (req, res) => {
  res.json({ success: true, message: 'Search suppliers endpoint - TODO: implement flexible search' })
})

// Get supplier suggestions for autocomplete - provides typeahead suggestions for forms
router.get('/suggestions', async (req, res) => {
  res.json({ success: true, message: 'Supplier suggestions endpoint - TODO: implement autocomplete' })
})

// Bulk import suppliers - imports supplier list from CSV/Excel files
router.post('/import', async (req, res) => {
  res.json({ success: true, message: 'Import suppliers endpoint - TODO: implement bulk import' })
})

// Export supplier data - generates supplier reports in multiple formats
router.get('/export', async (req, res) => {
  res.json({ success: true, message: 'Export suppliers endpoint - TODO: implement data export' })
})

export default router