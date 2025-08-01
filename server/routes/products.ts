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
          { productCode: { contains: q } },
          { grade: { contains: q } },
          { company: { contains: q } },
          { specificGrade: { contains: q } }
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


// Update product
router.put('/update', async (req, res) => {
  try {
    const { id, ...updateData } = req.body
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
        message: 'Product ID must be provided'
      })
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    })

    res.json({ 
      success: true, 
      data: updatedProduct,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ 
        success: false, 
        error: 'Product not found',
        message: `Product with id ${req.body.id} not found`
      })
    } else if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      res.status(400).json({ 
        success: false, 
        error: 'Product code already exists',
        message: 'A product with this product code already exists'
      })
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
})

// Delete product
router.delete('/remove', async (req, res) => {
  try {
    const { id } = req.body
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
        message: 'Product ID must be provided'
      })
    }
    
    // Check if product exists before deletion
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with id ${id} not found`
      })
    }
    
    // Check if product is referenced in inventory
    const referencedInInventory = await prisma.inventory.findFirst({
      where: { 
        productCode: existingProduct.productCode,
        grade: existingProduct.grade,
        company: existingProduct.company,
        specificGrade: existingProduct.specificGrade
      }
    })
    
    if (referencedInInventory) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product',
        message: 'This product is referenced in existing inventory records and cannot be deleted'
      })
    }
    
    // Check if product is referenced in deals
    const referencedInDeals = await prisma.deal.findFirst({
      where: { 
        productCode: existingProduct.productCode,
        grade: existingProduct.grade,
        company: existingProduct.company,
        specificGrade: existingProduct.specificGrade
      }
    })
    
    if (referencedInDeals) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product',
        message: 'This product is referenced in existing deals and cannot be deleted'
      })
    }
    
    await prisma.product.delete({
      where: { id }
    })

    res.json({ 
      success: true, 
      data: null,
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

// Get products statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await prisma.product.count()
    
    res.json({ 
      success: true, 
      data: { 
        total: totalProducts 
      } 
    })
  } catch (error) {
    console.error('Error fetching products stats:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})


// Bulk import products - imports product catalog from CSV/Excel files
router.post('/bulk-import', async (req, res) => {
  res.json({ success: true, message: 'Bulk import products endpoint - TODO: implement catalog import' })
})

// Get product categories - lists all grades and product types for filtering
router.get('/categories', async (req, res) => {
  res.json({ success: true, message: 'Product categories endpoint - TODO: implement category listing' })
})

// Export product catalog - generates product reports in multiple formats
router.get('/export', async (req, res) => {
  res.json({ success: true, message: 'Export products endpoint - TODO: implement catalog export' })
})

// Get product suggestions for autocomplete - provides typeahead for product selection
router.get('/suggestions', async (req, res) => {
  res.json({ success: true, message: 'Product suggestions endpoint - TODO: implement product autocomplete' })
})

export default router