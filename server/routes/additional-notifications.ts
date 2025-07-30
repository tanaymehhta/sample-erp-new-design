import { Router } from 'express'
import { sendWhatsAppMessage } from '../services/whatsapp'

const router = Router()

// Send additional WhatsApp notification
router.post('/send-additional', async (req, res) => {
  try {
    const { phoneNumber, dealData } = req.body

    if (!phoneNumber || !dealData) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and deal data are required'
      })
    }

    // Validate phone number format
    const cleanedPhone = phoneNumber.replace(/\D/g, '')
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      })
    }

    // Format the message (same as boss notification)
    const message = `🎯 *NEW DEAL REGISTERED*

📅 *Date:* ${dealData.date}
👤 *Customer:* ${dealData.saleParty}
📦 *Product:* ${dealData.productCode} - ${dealData.grade}
🏢 *Company:* ${dealData.company}
⚖️ *Quantity:* ${dealData.quantitySold} kg
💰 *Rate:* ₹${dealData.saleRate}/kg
🚚 *Terms:* ${dealData.deliveryTerms}
🏭 *Supplier:* ${dealData.purchaseParty}
💸 *Purchase Rate:* ₹${dealData.purchaseRate}/kg

🎉 Deal registered successfully!`

    // Send WhatsApp message to additional number
    await sendWhatsAppMessage(cleanedPhone, message)

    res.json({
      success: true,
      message: 'Additional notification sent successfully',
      phoneNumber: phoneNumber
    })

  } catch (error) {
    console.error('Error sending additional notification:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send additional notification'
    })
  }
})

export default router