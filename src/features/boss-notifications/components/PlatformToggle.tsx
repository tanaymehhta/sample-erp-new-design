import { MessageCircle, Send } from 'lucide-react'
import { NotificationPlatform } from '../types'
import { cn } from '../../../shared/utils/cn'

interface PlatformToggleProps {
  selectedPlatform: NotificationPlatform
  onPlatformChange: (platform: NotificationPlatform) => void
}

export default function PlatformToggle({ selectedPlatform, onPlatformChange }: PlatformToggleProps) {
  return (
    <div className="flex gap-3 mb-4">
      {/* WhatsApp Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onPlatformChange('whatsapp')
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
          "border-2 font-medium",
          selectedPlatform === 'whatsapp'
            ? "bg-green-500 text-white border-green-500 shadow-lg scale-105"
            : "bg-white text-green-600 border-green-200 hover:bg-green-50"
        )}
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </button>

      {/* Telegram Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onPlatformChange('telegram')
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
          "border-2 font-medium",
          selectedPlatform === 'telegram'
            ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
            : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
        )}
      >
        <Send className="w-4 h-4" />
        Telegram
      </button>
    </div>
  )
}