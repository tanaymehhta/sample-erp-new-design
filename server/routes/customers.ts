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

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const customer = await prisma.saleParty.findUnique({
      where: { id }
    })
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      })
    }
    
    res.json({ success: true, data: customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router