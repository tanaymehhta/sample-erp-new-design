import { Router } from 'express'

const router = Router()

// In-memory storage for subscription records (in production, use database)
const subscriptionRecords: Array<{
  id: string
  phoneNumber: string
  platform: 'whatsapp' | 'telegram'
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: Date
  confirmedAt?: Date
  lastMessageAt?: Date
  chatId?: string
  whatsappId?: string
}> = []

// WhatsApp webhook to receive messages
router.post('/whatsapp', async (req, res) => {
  try {
    console.log('📱 WhatsApp webhook received:', JSON.stringify(req.body, null, 2))
    
    // Parse WhatsApp webhook format (this depends on your WhatsApp Business API provider)
    const { messages, contacts } = req.body
    
    if (messages && messages.length > 0) {
      const message = messages[0]
      const phoneNumber = message.from
      const messageText = message.text?.body?.toLowerCase().trim()
      
      console.log(`📱 WhatsApp message from ${phoneNumber}: "${messageText}"`)
      
      // Check if this is a "hi" message and if we have a pending subscription
      if (messageText === 'hi' || messageText === 'hello') {
        const pendingSubscription = subscriptionRecords.find(
          sub => sub.platform === 'whatsapp' && 
                 sub.status === 'pending' &&
                 sub.phoneNumber.replace(/\D/g, '').includes(phoneNumber.replace(/\D/g, ''))
        )
        
        if (pendingSubscription) {
          // Confirm subscription
          pendingSubscription.status = 'confirmed'
          pendingSubscription.confirmedAt = new Date()
          pendingSubscription.lastMessageAt = new Date()
          pendingSubscription.whatsappId = phoneNumber
          
          console.log('✅ WhatsApp subscription confirmed for:', phoneNumber)
          
          // You can send a confirmation message here
          // await sendWhatsAppMessage(phoneNumber, "✅ Great! You're now subscribed to boss notifications!")
        }
      }
    }
    
    // WhatsApp expects a 200 response
    res.status(200).json({ status: 'received' })
    
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// Telegram webhook to receive messages
router.post('/telegram', async (req, res) => {
  try {
    console.log('💙 Telegram webhook received:', JSON.stringify(req.body, null, 2))
    
    const { message } = req.body
    
    if (message) {
      const chatId = message.chat.id.toString()
      const messageText = message.text?.toLowerCase().trim()
      const firstName = message.from?.first_name || ''
      const username = message.from?.username || ''
      
      console.log(`💙 Telegram message from ${chatId} (@${username}): "${messageText}"`)
      
      // Check if this is a "hi" message
      if (messageText === 'hi' || messageText === 'hello' || messageText === '/start') {
        // For Telegram, we'll match by chatId since phone numbers aren't always available
        // In practice, you might need the user to provide their phone number in the chat
        
        const allPendingSubscriptions = subscriptionRecords.filter(
          sub => sub.platform === 'telegram' && sub.status === 'pending'
        )
        
        // If there's only one pending Telegram subscription, assume it's this user
        if (allPendingSubscriptions.length === 1) {
          const subscription = allPendingSubscriptions[0]
          subscription.status = 'confirmed'
          subscription.confirmedAt = new Date()
          subscription.lastMessageAt = new Date()
          subscription.chatId = chatId
          
          console.log('✅ Telegram subscription confirmed for chat:', chatId)
          
          // You can send a confirmation message here using Telegram Bot API
          // await sendTelegramMessage(chatId, "✅ Great! You're now subscribed to boss notifications!")
        }
      }
    }
    
    // Telegram expects a 200 response
    res.status(200).json({ ok: true })
    
  } catch (error) {
    console.error('❌ Telegram webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// Get subscription status by phone number and platform
router.get('/subscription-status/:platform/:phoneNumber', async (req, res) => {
  try {
    const { platform, phoneNumber } = req.params
    
    const subscription = subscriptionRecords.find(
      sub => sub.platform === platform && sub.phoneNumber === phoneNumber
    )
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        status: subscription.status,
        confirmedAt: subscription.confirmedAt,
        lastMessageAt: subscription.lastMessageAt
      }
    })
    
  } catch (error) {
    console.error('❌ Status check error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check status'
    })
  }
})

// Create pending subscription (called when user clicks the button)
router.post('/create-pending-subscription', async (req, res) => {
  try {
    const { phoneNumber, platform } = req.body
    
    // Remove existing pending subscription for this phone/platform
    const existingIndex = subscriptionRecords.findIndex(
      sub => sub.phoneNumber === phoneNumber && sub.platform === platform
    )
    
    if (existingIndex !== -1) {
      subscriptionRecords.splice(existingIndex, 1)
    }
    
    // Create new pending subscription
    const newSubscription = {
      id: Date.now().toString(),
      phoneNumber,
      platform,
      status: 'pending' as const,
      createdAt: new Date()
    }
    
    subscriptionRecords.push(newSubscription)
    
    console.log(`⏳ Created pending subscription: ${phoneNumber} via ${platform}`)
    
    res.json({
      success: true,
      data: newSubscription
    })
    
  } catch (error) {
    console.error('❌ Create pending subscription error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create pending subscription'
    })
  }
})

// Get all subscriptions (for debugging)
router.get('/all-subscriptions', async (req, res) => {
  try {
    res.json({
      success: true,
      data: subscriptionRecords
    })
  } catch (error) {
    console.error('❌ Get all subscriptions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get subscriptions'
    })
  }
})

export default router