import express from 'express'
import { PrismaClient } from '@prisma/client'
import { serverSyncService } from '../services/syncService'
import { syncToGoogleSheets } from '../services/googleSheets'

const router = express.Router()
const prisma = new PrismaClient()

// Manual sync endpoints
router.post('/deals/to-sheets', async (req, res) => {
  try {
    console.log('🔄 Manual sync: All deals to Google Sheets')
    const result = await serverSyncService.syncAllDealsToSheets()
    
    res.json({
      success: result.success,
      data: result,
      message: result.message
    })
  } catch (error) {
    console.error('❌ Sync to sheets failed:', error)
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.post('/deals/from-sheets', async (req, res) => {
  try {
    console.log('🔄 Manual sync: Google Sheets to database')
    const result = await serverSyncService.syncSheetsToDatabase()
    
    res.json({
      success: result.success,
      data: result,
      message: result.message
    })
  } catch (error) {
    console.error('❌ Sync from sheets failed:', error)
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.post('/deals/:id/to-sheets', async (req, res) => {
  try {
    const { id } = req.params
    console.log(`🔄 Manual sync: Deal ${id} to Google Sheets`)
    
    // For single deal sync, we'll sync it directly
    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found',
        message: `Deal with id ${id} not found`
      })
    }

    await syncToGoogleSheets(deal)
    
    res.json({
      success: true,
      data: { synced: 1, errors: [], conflictsResolved: 0 },
      message: 'Deal synced successfully'
    })
  } catch (error) {
    console.error(`❌ Sync deal ${req.params.id} failed:`, error)
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Comparison endpoint
router.get('/deals/compare', async (req, res) => {
  try {
    console.log('🔍 Comparing database and Google Sheets')
    const comparison = await serverSyncService.compareTables()
    
    res.json({
      success: true,
      data: comparison,
      message: 'Tables compared successfully'
    })
  } catch (error) {
    console.error('❌ Table comparison failed:', error)
    res.status(500).json({
      success: false,
      error: 'Comparison failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Configuration endpoints
router.get('/config', async (req, res) => {
  try {
    const config = serverSyncService.getConfig()
    res.json({
      success: true,
      data: config,
      message: 'Configuration retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.put('/config', async (req, res) => {
  try {
    const newConfig = req.body
    const updatedConfig = serverSyncService.updateConfig(newConfig)
    
    res.json({
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Status endpoint
router.get('/status', async (req, res) => {
  try {
    const [sheetData, dbData] = await Promise.all([
      serverSyncService.getSheetData(),
      serverSyncService.getDatabaseData()
    ])
    
    res.json({
      success: true,
      data: {
        database: {
          count: dbData.length,
          lastUpdated: dbData[0]?.updatedAt || null
        },
        sheets: {
          count: sheetData.length,
          accessible: true
        },
        config: serverSyncService.getConfig()
      },
      message: 'Sync status retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get sync status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Event stream for real-time sync updates (optional - commented out for now)
/*
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n')
  }, 30000)

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive)
  })
})
*/

export default router