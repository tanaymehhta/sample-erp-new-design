import express from 'express'
import { syncToGoogleSheets, getGoogleSheetsData } from '../services/googleSheets'

const router = express.Router()

// Sync data to Google Sheets
router.post('/sync', async (req, res) => {
  try {
    const { dealData } = req.body
    
    if (!dealData) {
      return res.status(400).json({
        success: false,
        error: 'Deal data is required'
      })
    }
    
    const result = await syncToGoogleSheets(dealData)
    
    res.json({
      success: true,
      data: result,
      message: 'Data synced to Google Sheets successfully'
    })
  } catch (error) {
    console.error('Google Sheets sync failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync to Google Sheets',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get data from Google Sheets
router.get('/data/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params
    const data = await getGoogleSheetsData(sheetName)
    
    res.json({
      success: true,
      data,
      message: `Data retrieved from ${sheetName} sheet`
    })
  } catch (error) {
    console.error('Google Sheets data fetch failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google Sheets data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Test Google Sheets connection
router.get('/test', async (req, res) => {
  try {
    // Test basic connection
    const testData = await getGoogleSheetsData('Main')
    
    res.json({
      success: true,
      status: 'connected',
      sheetsId: process.env.GOOGLE_SHEETS_ID,
      message: 'Google Sheets connection successful'
    })
  } catch (error) {
    console.error('Google Sheets connection test failed:', error)
    res.status(500).json({
      success: false,
      error: 'Google Sheets connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router