import { useState } from 'react'
import { Send, ExternalLink, Phone, Bot } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { SubscriptionStatus } from '../types'
import SubscriptionStatusIndicator from './SubscriptionStatusIndicator'

interface TelegramInstructionsProps {
  phoneNumber: string
  onPhoneChange: (phone: string) => void
  onSubscribe: (phone: string) => void
  getTelegramBotLink: () => string
  validatePhoneNumber: (phone: string) => boolean
  botUsername: string
  subscriptionStatus: SubscriptionStatus | null
  isCheckingStatus: boolean
}

export default function TelegramInstructions({ 
  phoneNumber, 
  onPhoneChange, 
  onSubscribe,
  getTelegramBotLink,
  validatePhoneNumber,
  botUsername,
  subscriptionStatus,
  isCheckingStatus
}: TelegramInstructionsProps) {
  const [isValidPhone, setIsValidPhone] = useState(true)

  const handlePhoneChange = (value: string) => {
    onPhoneChange(value)
    setIsValidPhone(validatePhoneNumber(value) || value === '')
  }

  const handleOpenTelegram = () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setIsValidPhone(false)
      return
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setIsValidPhone(false)
      return
    }
    
    const link = getTelegramBotLink()
    window.open(link, '_blank')
    
    onSubscribe(phoneNumber)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-blue-700">
        <Send className="w-5 h-5" />
        <h3 className="font-semibold">Telegram Boss Messages</h3>
      </div>
      
      <div className="space-y-3 text-sm text-blue-700">
        <p>To receive boss notifications via Telegram:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Enter your phone number</li>
          <li>Click "Open Telegram Bot" to start chat</li>
          <li>Send "Hi" to the bot to start receiving boss messages</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Your Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+91 12345 67890"
            className={cn(
              "w-full px-3 py-2 border rounded-md text-gray-900",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              !isValidPhone ? "border-red-300 bg-red-50" : "border-blue-300"
            )}
          />
          {!isValidPhone && (
            <p className="text-red-600 text-xs mt-1">
              {!phoneNumber || phoneNumber.trim() === '' 
                ? 'Phone number is required' 
                : 'Please enter a valid phone number'
              }
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleOpenTelegram()
          }}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Send className="w-4 h-4" />
          Open Telegram Bot
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
        <Bot className="w-3 h-3 inline mr-1" />
        <strong>Bot Username:</strong> @{botUsername}
      </div>

      {/* Subscription Status */}
      <SubscriptionStatusIndicator 
        status={subscriptionStatus}
        isChecking={isCheckingStatus}
        platform="telegram"
      />
    </div>
  )
}