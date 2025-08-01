export type NotificationPlatform = 'whatsapp' | 'telegram'
export type SubscriptionStatus = 'pending' | 'confirmed' | 'failed'

export interface BossNotificationPreference {
  platform: NotificationPlatform
  phoneNumber: string
  isSubscribed: boolean
}

export interface SubscriptionRecord {
  id: string
  phoneNumber: string
  platform: NotificationPlatform
  status: SubscriptionStatus
  createdAt: Date
  confirmedAt?: Date
  lastMessageAt?: Date
  chatId?: string // For Telegram
  whatsappId?: string // For WhatsApp
}

export interface PlatformConfig {
  whatsapp: {
    businessNumber: string
    linkTemplate: string
  }
  telegram: {
    botUsername: string
    botLink: string
  }
}