import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, CreditCard, TrendingUp, X } from 'lucide-react'
import { Deal } from '../types'

interface DealDetailViewProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
}

export default function DealDetailView({ deal, isOpen, onClose }: DealDetailViewProps) {
  if (!deal) return null

  // Calculate performance metrics
  const totalRevenue = deal.quantitySold * deal.saleRate
  const totalCost = deal.purchaseQuantity * deal.purchaseRate
  const profit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
  const unitPrice = deal.saleRate

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {deal.id}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatDate(deal.date)}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {deal.date.split('-')[0]} {/* Day */}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(deal.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {deal.saleParty}
                      </h2>
                      <div className="text-lg text-gray-600">
                        {deal.productCode}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Quantity</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {deal.quantitySold.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">MT</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Value</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {formatCurrency(totalRevenue)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Profit</div>
                      <div className="flex items-center justify-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-xl font-semibold text-blue-600">
                          {formatCurrency(profit)}
                        </span>
                        <span className="text-sm text-blue-500">
                          ({profitMargin.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Grade</div>
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded font-bold">
                        {deal.grade?.charAt(0) || 'A'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Location & Logistics */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Location & Logistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Mumbai</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Delivered on {formatDate(deal.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Payment Terms
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">NET 30</div>
                      </div>
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Completed
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(unitPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="font-semibold text-blue-600">
                        {profitMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Material Grade:</span>
                      <span className="font-semibold text-gray-900">
                        {deal.grade || 'A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sale Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Party:</span>
                        <span className="font-medium">{deal.saleParty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{deal.quantitySold.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">{formatCurrency(deal.saleRate)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Purchase Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Party:</span>
                        <span className="font-medium">{deal.purchaseParty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{deal.purchaseQuantity.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">{formatCurrency(deal.purchaseRate)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-red-600">{formatCurrency(totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}