import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { credentialManager } from './config/credentials'
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

// =================================
// SECURITY & ENVIRONMENT VALIDATION
// =================================
console.log('🔍 Validating environment configuration...')

try {
  // Validate all required environment variables
  credentialManager.validateRequiredEnvVars()
  console.log('✅ Required environment variables validated')
  
  // Validate credential configurations
  const validation = credentialManager.validateAllCredentials()
  if (!validation.valid) {
    console.error('❌ Credential validation failed:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    console.log('\n📋 Setup Instructions:')
    console.log('1. Copy .env.example to .env')
    console.log('2. Fill in all required values')
    console.log('3. Place Google service account JSON file in secure location')
    console.log('4. Update GOOGLE_CREDENTIALS_PATH in .env')
    process.exit(1)
  }
  
  console.log('✅ All credential configurations validated')
  console.log('🚀 Security validation passed - starting server...')
  
} catch (error) {
  console.error('❌ Environment validation failed:', error.message)
  console.log('\n📋 Quick Setup:')
  console.log('1. cp .env.example .env')
  console.log('2. Edit .env with your actual values')
  console.log('3. Ensure Google credentials file exists')
  console.log('4. npm run dev')
  process.exit(1)
}

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

// Enhanced health check with security status
app.get('/api/health', (req, res) => {
  const validation = credentialManager.validateAllCredentials()
  
  res.json({ 
    status: validation.valid ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    message: 'Polymer Trading System API is running',
    security: {
      credentialsValid: validation.valid,
      errors: validation.errors
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
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