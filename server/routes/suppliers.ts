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

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supplier = await prisma.purchaseParty.findUnique({
      where: { id }
    })
    
    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Supplier not found' 
      })
    }
    
    res.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch supplier',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router