import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import dealsRouter from './routes/deals'
import whatsappRouter from './routes/whatsapp'
import sheetsRouter from './routes/sheets'
import customersRouter from './routes/customers'
import suppliersRouter from './routes/suppliers'
import productsRouter from './routes/products'
import syncRouter from './routes/sync'
import inventoryRouter from './routes/inventory'
import additionalNotificationsRouter from './routes/additional-notifications'
import bossNotificationsRouter from './routes/boss-notifications'
import webhooksRouter from './routes/webhooks'
import analyticsRouter from './routes/analytics'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/deals', dealsRouter)
app.use('/api/whatsapp', whatsappRouter)
app.use('/api/sheets', sheetsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/suppliers', suppliersRouter)
app.use('/api/products', productsRouter)
app.use('/api/sync', syncRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/whatsapp', additionalNotificationsRouter)
app.use('/api/boss-notifications', bossNotificationsRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/analytics', analyticsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Polymer Trading System API is running'
  })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})