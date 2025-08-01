import { Router } from 'express'

const router = Router()

// Simple in-memory storage for demo (in production, use database)
const subscriptions: Array<{
  id: string
  phoneNumber: string
  platform: 'whatsapp' | 'telegram'
  isActive: boolean
  createdAt: Date
}> = []

// Subscribe to boss notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { phoneNumber, platform } = req.body

    if (!phoneNumber || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and platform are required'
      })
    }

    if (!['whatsapp', 'telegram'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Platform must be either whatsapp or telegram'
      })
    }

    // Check if already subscribed
    const existingSubscription = subscriptions.find(
      sub => sub.phoneNumber === phoneNumber && sub.platform === platform
    )

    if (existingSubscription) {
      return res.json({
        success: true,
        message: 'Already subscribed to boss notifications',
        subscription: existingSubscription
      })
    }

    // Create new subscription
    const newSubscription = {
      id: Date.now().toString(),
      phoneNumber,
      platform,
      isActive: true,
      createdAt: new Date()
    }

    subscriptions.push(newSubscription)

    console.log(`📱 New boss notification subscription: ${phoneNumber} via ${platform}`)

    res.json({
      success: true,
      message: 'Successfully subscribed to boss notifications',
      subscription: newSubscription
    })

  } catch (error) {
    console.error('Boss notification subscription error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process subscription'
    })
  }
})

// Get all subscriptions (for admin/debugging)
router.get('/subscriptions', async (req, res) => {
  try {
    res.json({
      success: true,
      data: subscriptions
    })
  } catch (error) {
    console.error('Failed to get subscriptions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get subscriptions'
    })
  }
})

// Unsubscribe
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { phoneNumber, platform } = req.body

    const index = subscriptions.findIndex(
      sub => sub.phoneNumber === phoneNumber && sub.platform === platform
    )

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      })
    }

    subscriptions.splice(index, 1)

    res.json({
      success: true,
      message: 'Successfully unsubscribed from boss notifications'
    })

  } catch (error) {
    console.error('Boss notification unsubscription error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process unsubscription'
    })
  }
})

export default router