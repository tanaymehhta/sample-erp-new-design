import { useState } from 'react'
import { MessageCircle, ExternalLink, Phone } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { SubscriptionStatus } from '../types'
import SubscriptionStatusIndicator from './SubscriptionStatusIndicator'

interface WhatsAppInstructionsProps {
  phoneNumber: string
  onPhoneChange: (phone: string) => void
  onSubscribe: (phone: string) => void
  generateWhatsAppLink: (phone?: string) => string
  validatePhoneNumber: (phone: string) => boolean
  subscriptionStatus: SubscriptionStatus | null
  isCheckingStatus: boolean
}

export default function WhatsAppInstructions({ 
  phoneNumber, 
  onPhoneChange, 
  onSubscribe,
  generateWhatsAppLink,
  validatePhoneNumber,
  subscriptionStatus,
  isCheckingStatus
}: WhatsAppInstructionsProps) {
  const [isValidPhone, setIsValidPhone] = useState(true)

  const handlePhoneChange = (value: string) => {
    onPhoneChange(value)
    setIsValidPhone(validatePhoneNumber(value) || value === '')
  }

  const handleOpenWhatsApp = () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setIsValidPhone(false)
      return
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setIsValidPhone(false)
      return
    }
    
    const link = generateWhatsAppLink(phoneNumber)
    window.open(link, '_blank')
    
    onSubscribe(phoneNumber)
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-green-700">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">WhatsApp Boss Messages</h3>
      </div>
      
      <div className="space-y-3 text-sm text-green-700">
        <p>To receive boss notifications via WhatsApp:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Enter your phone number</li>
          <li>Click "Open WhatsApp" to message our business</li>
          <li>Send "Hi" to start receiving boss messages</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
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
              "focus:ring-2 focus:ring-green-500 focus:border-green-500",
              !isValidPhone ? "border-red-300 bg-red-50" : "border-green-300"
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
            handleOpenWhatsApp()
          }}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Open WhatsApp
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
        <strong>Business Number:</strong> +91 83694 38329
      </div>

      {/* Subscription Status */}
      <SubscriptionStatusIndicator 
        status={subscriptionStatus}
        isChecking={isCheckingStatus}
        platform="whatsapp"
      />
    </div>
  )
}