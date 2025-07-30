import { useState } from 'react'
import { Phone, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../../shared/utils/cn'

interface AdditionalNotificationInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  className?: string
  placeholder?: string
}

export const AdditionalNotificationInput: React.FC<AdditionalNotificationInputProps> = ({
  value,
  onChange,
  error,
  className,
  placeholder = "Enter additional number (optional)"
}) => {
  const [focused, setFocused] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    
    // Allow only digits, spaces, hyphens, parentheses, and plus sign
    input = input.replace(/[^\d\s\-\(\)\+]/g, '')
    
    // Limit to reasonable length
    if (input.length <= 20) {
      onChange(input)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-2", className)}
    >
      <label className="block text-sm font-medium text-gray-700">
        Additional Notification
        <span className="text-gray-500 text-xs ml-2">(Optional)</span>
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className={cn(
            "h-5 w-5 transition-colors",
            focused ? "text-primary-500" : "text-gray-400"
          )} />
        </div>
        
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "block w-full pl-10 pr-3 py-2 border rounded-lg transition-all duration-200",
            "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "placeholder-gray-400 text-gray-900",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 hover:border-gray-400",
            focused && !error && "border-primary-500 shadow-lg"
          )}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500">
        If provided, the boss notification will also be sent to this number
      </div>
    </motion.div>
  )
}

export default AdditionalNotificationInput