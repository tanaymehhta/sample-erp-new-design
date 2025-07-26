import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '../utils/cn'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'success' | 'info'
  isLoading?: boolean
}

const variantStyles = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmButton: 'bg-red-600 hover:bg-red-700'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    confirmButton: 'bg-green-600 hover:bg-green-700'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmButton: 'bg-blue-600 hover:bg-blue-700'
  }
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant]
  const Icon = styles.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn('p-2 rounded-xl', styles.iconBg)}>
                    <Icon className={cn('w-6 h-6', styles.iconColor)} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
              
              {/* Actions */}
              <div className="flex space-x-3 justify-end">
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>
                
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2',
                    styles.confirmButton
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{confirmText}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}