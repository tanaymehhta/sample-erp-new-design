import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className 
}: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex items-center justify-center space-x-2', className)}
    >
      <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
      {text && (
        <span className="text-gray-600 text-sm">{text}</span>
      )}
    </motion.div>
  )
}