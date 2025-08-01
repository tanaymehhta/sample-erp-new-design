import { useState } from 'react'
import { Crown, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBossNotifications } from '../hooks/useBossNotifications'
import PlatformToggle from './PlatformToggle'
import WhatsAppInstructions from './WhatsAppInstructions'
import TelegramInstructions from './TelegramInstructions'
import PersistentStatusBadge from './PersistentStatusBadge'

export default function BossNotificationSubscription() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    selectedPlatform,
    setSelectedPlatform,
    phoneNumber,
    setPhoneNumber,
    subscriptionStatus,
    isCheckingStatus,
    generateWhatsAppLink,
    getTelegramBotLink,
    subscribe,
    validatePhoneNumber,
    platformConfig
  } = useBossNotifications()

  const handleSubscribe = async (phone: string) => {
    try {
      await subscribe(selectedPlatform, phone)
      // Could show success toast here
    } catch (error) {
      console.error('Subscription failed:', error)
      // Could show error toast here
    }
  }

  return (
    <div>
      {/* Collapsible Header Bar - Thinner design like Additional Notification */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              Boss Message Subscription
            </span>
            <span className="text-xs text-gray-500 -ml-0.5">Receive notifications on your phone</span>
          </div>
          <span className="text-xs text-gray-500">(Optional)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Persistent Status Badge */}
          <PersistentStatusBadge 
            status={subscriptionStatus}
            isCheckingStatus={isCheckingStatus}
          />
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden mt-3"
          >
            <div className="card space-y-4">
              <p className="text-sm text-gray-600">
                Get boss notifications directly on your preferred messaging platform
              </p>

              {/* Platform Toggle */}
              <PlatformToggle 
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />

              {/* Instructions based on selected platform */}
              {selectedPlatform === 'whatsapp' ? (
                <WhatsAppInstructions
                  phoneNumber={phoneNumber}
                  onPhoneChange={setPhoneNumber}
                  onSubscribe={handleSubscribe}
                  generateWhatsAppLink={generateWhatsAppLink}
                  validatePhoneNumber={validatePhoneNumber}
                  subscriptionStatus={subscriptionStatus}
                  isCheckingStatus={isCheckingStatus}
                />
              ) : (
                <TelegramInstructions
                  phoneNumber={phoneNumber}
                  onPhoneChange={setPhoneNumber}
                  onSubscribe={handleSubscribe}
                  getTelegramBotLink={getTelegramBotLink}
                  validatePhoneNumber={validatePhoneNumber}
                  botUsername={platformConfig.telegram.botUsername}
                  subscriptionStatus={subscriptionStatus}
                  isCheckingStatus={isCheckingStatus}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}