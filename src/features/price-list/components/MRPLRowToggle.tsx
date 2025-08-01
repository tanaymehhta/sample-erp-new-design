import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface MRPLRowToggleProps {
  currentMode: 'monthly' | 'annual'
  hasOverride: boolean
  onToggle: () => void
  size?: 'sm' | 'xs'
  type: 'qd' | 'mou'
}

const MRPLRowToggle = ({ 
  currentMode, 
  hasOverride, 
  onToggle, 
  size = 'xs',
  type 
}: MRPLRowToggleProps) => {
  const colorScheme = type === 'qd' ? 'blue' : 'green'
  
  return (
    <motion.button
      onClick={onToggle}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-200 ${
        size === 'sm' ? 'w-6 h-6' : 'w-5 h-5'
      } ${
        currentMode === 'monthly'
          ? `bg-${colorScheme}-100 text-${colorScheme}-600 hover:bg-${colorScheme}-200`
          : `bg-orange-100 text-orange-600 hover:bg-orange-200`
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Toggle ${type.toUpperCase()}: ${currentMode} mode${hasOverride ? ' (overridden)' : ''}`}
    >
      <RefreshCw className={`${size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`} />
      
      {/* Override indicator */}
      {hasOverride && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
      )}
      
      {/* Mode indicator */}
      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
        currentMode === 'monthly' ? `bg-${colorScheme}-600` : 'bg-orange-600'
      }`} />
    </motion.button>
  )
}

export default MRPLRowToggle