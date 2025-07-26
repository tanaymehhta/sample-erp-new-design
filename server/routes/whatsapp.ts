import express from 'express'
import { sendWhatsAppMessage } from '../services/whatsapp'

const router = express.Router()

// Test WhatsApp API
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      })
    }
    
    const result = await sendWhatsAppMessage(phoneNumber, message)
    
    res.json({
      success: true,
      data: result,
      message: 'WhatsApp message sent successfully'
    })
  } catch (error) {
    console.error('WhatsApp test failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp message',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get WhatsApp API status
router.get('/status', async (req, res) => {
  try {
    // Simple health check - you could enhance this
    res.json({
      success: true,
      status: 'active',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      recipients: {
        accounts: process.env.WHATSAPP_PHONE_ACCOUNTS,
        logistics: process.env.WHATSAPP_PHONE_LOGISTICS,
        boss1: process.env.WHATSAPP_PHONE_BOSS1,
        bossOg: process.env.WHATSAPP_PHONE_BOSSOG
      }
    })
  } catch (error) {
    console.error('WhatsApp status check failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check WhatsApp status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router