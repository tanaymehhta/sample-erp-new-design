import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { productCode: 'asc' }
    })
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      })
    }
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { productCode: { contains: q, mode: 'insensitive' } },
          { grade: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
          { specificGrade: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { productCode: 'asc' }
    })
    
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Error searching products:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search products',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body
    
    const product = await prisma.product.create({
      data: productData
    })

    res.json({ 
      success: true, 
      data: product,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      })
    }
    
    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const productData = req.body
    
    const product = await prisma.product.update({
      where: { id },
      data: productData
    })

    res.json({ 
      success: true, 
      data: product,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.product.delete({
      where: { id }
    })

    res.json({ 
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router