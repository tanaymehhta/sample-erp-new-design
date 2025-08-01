import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { SubscriptionStatus } from '../types'
import { cn } from '../../../shared/utils/cn'

interface SubscriptionStatusIndicatorProps {
  status: SubscriptionStatus | null
  isChecking: boolean
  platform: 'whatsapp' | 'telegram'
}

export default function SubscriptionStatusIndicator({ 
  status, 
  isChecking, 
  platform 
}: SubscriptionStatusIndicatorProps) {
  if (!status && !isChecking) {
    return null
  }

  const platformName = platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'
  const platformColor = platform === 'whatsapp' ? 'green' : 'blue'

  const getStatusConfig = () => {
    if (isChecking) {
      return {
        icon: Loader2,
        text: `Waiting for your "Hi" message on ${platformName}...`,
        bgColor: `bg-${platformColor}-50`,
        textColor: `text-${platformColor}-700`,
        borderColor: `border-${platformColor}-200`,
        iconColor: `text-${platformColor}-600`,
        animate: true
      }
    }

    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: `Waiting for confirmation on ${platformName}`,
          bgColor: `bg-yellow-50`,
          textColor: `text-yellow-700`,
          borderColor: `border-yellow-200`,
          iconColor: `text-yellow-600`,
          animate: false
        }
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: `✅ Confirmed! You'll receive boss messages on ${platformName}`,
          bgColor: `bg-green-50`,
          textColor: `text-green-700`,
          borderColor: `border-green-200`,
          iconColor: `text-green-600`,
          animate: false
        }
      case 'failed':
        return {
          icon: XCircle,
          text: `Not confirmed yet. Please send "Hi" to ${platformName}`,
          bgColor: `bg-red-50`,
          textColor: `text-red-700`,
          borderColor: `border-red-200`,
          iconColor: `text-red-600`,
          animate: false
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const { icon: Icon, text, bgColor, textColor, borderColor, iconColor, animate } = config

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border mt-3",
      bgColor,
      borderColor
    )}>
      <Icon 
        className={cn(
          "w-5 h-5",
          iconColor,
          animate && "animate-spin"
        )} 
      />
      <p className={cn("text-sm font-medium", textColor)}>
        {text}
      </p>
    </div>
  )
}