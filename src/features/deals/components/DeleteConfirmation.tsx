import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, X, RotateCcw } from 'lucide-react'
import { Deal } from '../types'
import { useDealService } from '../../../shared/providers/ServiceProvider'

interface DeleteConfirmationProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  onDeleted?: (dealId: string) => void
}

export default function DeleteConfirmation({ deal, isOpen, onClose, onDeleted }: DeleteConfirmationProps) {
  const dealService = useDealService()
  const [step, setStep] = useState<'confirm' | 'deleting' | 'success' | 'undo'>('confirm')
  const [undoTimer, setUndoTimer] = useState<number>(5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDelete = async () => {
    if (!deal) return

    setStep('deleting')
    
    try {
      const response = await dealService.deleteDeal(deal.id)
      
      if (response.success) {
        setStep('success')
        onDeleted?.(deal.id)
        
        // Start undo countdown
        let timer = 5
        setUndoTimer(timer)
        
        const countdown = setInterval(() => {
          timer -= 1
          setUndoTimer(timer)
          
          if (timer <= 0) {
            clearInterval(countdown)
            onClose()
            // Reset for next time
            setTimeout(() => {
              setStep('confirm')
              setUndoTimer(5)
            }, 300)
          }
        }, 1000)
        
        return countdown
      }
    } catch (error) {
      console.error('Failed to delete deal:', error)
      setStep('confirm')
    }
  }

  const handleUndo = async () => {
    if (!deal) return
    
    setStep('deleting')
    
    // Here you would typically call an undo API
    // For now, we'll just simulate the undo
    setTimeout(() => {
      setStep('confirm')
      setUndoTimer(5)
      onClose()
    }, 1000)
  }

  const resetAndClose = () => {
    setStep('confirm')
    setUndoTimer(5)
    onClose()
  }

  if (!deal) return null

  const dealValue = deal.quantitySold * deal.saleRate

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={step === 'confirm' ? resetAndClose : undefined}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white rounded-xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {/* Confirmation Step */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </motion.div>
                      
                      <motion.button
                        onClick={resetAndClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Deal?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This action cannot be undone. This will permanently delete the deal and remove it from your records.
                      </p>

                      {/* Deal Summary */}
                      <motion.div
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{deal.saleParty}</p>
                            <p className="text-sm text-gray-600">{deal.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(dealValue)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {deal.quantitySold.toLocaleString()} kg
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Product:</span>
                          <span className="font-medium text-gray-900">{deal.productCode}</span>
                        </div>
                      </motion.div>

                      {/* Warning */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-start space-x-2 mt-4 p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Warning</p>
                          <p className="text-sm text-red-700">
                            This will also affect inventory calculations and reporting data.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={resetAndClose}
                        className="flex-1 btn-secondary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      
                      <motion.button
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Delete Deal
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Deleting Step */}
                {step === 'deleting' && (
                  <motion.div
                    key="deleting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-6 text-center"
                  >
                    <motion.div
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Trash2 className="w-8 h-8 text-red-600" />
                    </motion.div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Deleting Deal...
                    </h3>
                    <p className="text-gray-600">
                      Please wait while we remove the deal from your records.
                    </p>
                  </motion.div>
                )}

                {/* Success with Undo Step */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-6 text-center"
                  >
                    {/* Success Animation */}
                    <motion.div
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <svg className="w-8 h-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Deal Deleted
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The deal has been successfully removed from your records.
                    </p>

                    {/* Undo Option */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Changed your mind?
                          </span>
                        </div>
                        <motion.button
                          onClick={handleUndo}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Undo Delete
                        </motion.button>
                      </div>
                      
                      {/* Countdown */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-blue-200 rounded-full h-1">
                          <motion.div
                            className="h-1 bg-blue-600 rounded-full"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: "linear" }}
                          />
                        </div>
                        <span className="text-xs text-blue-700 font-mono">
                          {undoTimer}s
                        </span>
                      </div>
                    </motion.div>

                    <motion.button
                      onClick={resetAndClose}
                      className="btn-secondary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Close
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}