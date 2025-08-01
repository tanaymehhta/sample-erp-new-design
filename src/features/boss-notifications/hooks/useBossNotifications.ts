import { useState, useEffect } from 'react'
import { NotificationPlatform, SubscriptionStatus } from '../types'

// Platform configuration with placeholders
const PLATFORM_CONFIG = {
  whatsapp: {
    businessNumber: '+91 83694 38329',
    linkTemplate: 'https://wa.me/918369438329?text=Hi'
  },
  telegram: {
    botUsername: 'BizManager1705bot',
    botLink: 'https://t.me/BizManager1705bot'
  }
}

export function useBossNotifications() {
  const [selectedPlatform, setSelectedPlatform] = useState<NotificationPlatform>('whatsapp')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const generateWhatsAppLink = (userPhone?: string) => {
    const message = userPhone 
      ? `Hi, I want to receive boss notifications on ${userPhone}`
      : 'Hi, I want to receive boss notifications'
    
    return `${PLATFORM_CONFIG.whatsapp.linkTemplate.split('?')[0]}?text=${encodeURIComponent(message)}`
  }

  const getTelegramBotLink = () => {
    return PLATFORM_CONFIG.telegram.botLink
  }

  const createPendingSubscription = async (platform: NotificationPlatform, phone: string) => {
    try {
      const response = await fetch('/api/webhooks/create-pending-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          platform
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create pending subscription')
      }

      setSubscriptionStatus('pending')
      console.log('⏳ Created pending subscription:', { platform, phone })
      
      // Start checking for confirmation
      startStatusChecking(platform, phone)
      
      return data
    } catch (error) {
      console.error('❌ Failed to create pending subscription:', error)
      throw error
    }
  }

  const checkSubscriptionStatus = async (platform: NotificationPlatform, phone: string) => {
    try {
      const response = await fetch(`/api/webhooks/subscription-status/${platform}/${encodeURIComponent(phone)}`)
      const data = await response.json()

      if (data.success) {
        setSubscriptionStatus(data.data.status)
        if (data.data.status === 'confirmed') {
          setIsSubscribed(true)
        }
        return data.data.status
      }
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error)
    }
    return null
  }

  const startStatusChecking = (platform: NotificationPlatform, phone: string) => {
    setIsCheckingStatus(true)
    
    const checkInterval = setInterval(async () => {
      const status = await checkSubscriptionStatus(platform, phone)
      
      if (status === 'confirmed') {
        setIsCheckingStatus(false)
        clearInterval(checkInterval)
      }
    }, 3000) // Check every 3 seconds

    // Stop checking after 5 minutes
    setTimeout(() => {
      setIsCheckingStatus(false)
      clearInterval(checkInterval)
    }, 300000)
  }

  const subscribe = async (platform: NotificationPlatform, phone: string) => {
    return await createPendingSubscription(platform, phone)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/
    return phoneRegex.test(phone.trim())
  }

  // Check for existing subscription status on component mount
  useEffect(() => {
    const checkExistingStatus = async () => {
      // Check localStorage for previous phone number and platform
      const savedPhone = localStorage.getItem('boss-notification-phone')
      const savedPlatform = localStorage.getItem('boss-notification-platform') as NotificationPlatform
      
      if (savedPhone && savedPlatform) {
        setPhoneNumber(savedPhone)
        setSelectedPlatform(savedPlatform)
        
        // Check current status
        const status = await checkSubscriptionStatus(savedPlatform, savedPhone)
        if (status === 'confirmed') {
          setIsSubscribed(true)
        }
      }
    }
    
    checkExistingStatus()
  }, [])

  // Save phone and platform to localStorage when they change
  useEffect(() => {
    if (phoneNumber) {
      localStorage.setItem('boss-notification-phone', phoneNumber)
      localStorage.setItem('boss-notification-platform', selectedPlatform)
    }
  }, [phoneNumber, selectedPlatform])

  return {
    selectedPlatform,
    setSelectedPlatform,
    phoneNumber,
    setPhoneNumber,
    isSubscribed,
    subscriptionStatus,
    isCheckingStatus,
    generateWhatsAppLink,
    getTelegramBotLink,
    subscribe,
    checkSubscriptionStatus,
    validatePhoneNumber,
    platformConfig: PLATFORM_CONFIG
  }
}