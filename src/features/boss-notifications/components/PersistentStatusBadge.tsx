import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { SubscriptionStatus } from '../types'
import { cn } from '../../../shared/utils/cn'

interface PersistentStatusBadgeProps {
  status: SubscriptionStatus | null
  isCheckingStatus: boolean
}

export default function PersistentStatusBadge({ 
  status, 
  isCheckingStatus 
}: PersistentStatusBadgeProps) {
  
  const getStatusConfig = () => {
    if (isCheckingStatus) {
      return {
        icon: Clock,
        text: "Configuring...",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-300"
      }
    }

    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: "Totally Configured",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-300"
        }
      case 'pending':
        return {
          icon: Clock,
          text: "Pending Confirmation",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-300"
        }
      case 'failed':
        return {
          icon: XCircle,
          text: "Configuration Failed",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-300"
        }
      default:
        return {
          icon: XCircle,
          text: "Not Configured",
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          borderColor: "border-gray-300"
        }
    }
  }

  const config = getStatusConfig()
  const { icon: Icon, text, bgColor, textColor, borderColor } = config

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
      bgColor,
      textColor,
      borderColor
    )}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  )
}