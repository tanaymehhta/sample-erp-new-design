import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, Search, Download, Filter, Calendar, Eye } from 'lucide-react'
import { useDeals } from '../hooks/useDeals'
import { DealFilters } from '../types'
import { LoadingSpinner } from '../../../shared/components'
import { cn } from '../../../shared/utils/cn'

interface DealsHistoryProps {
  onViewDeal?: (dealId: string) => void
}

export default function DealsHistory({ onViewDeal }: DealsHistoryProps) {
  const [filters, setFilters] = useState<DealFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { deals, loading, error, fetchDeals, refreshDeals } = useDeals()

  // Apply filters when they change
  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      const appliedFilters: DealFilters = { ...filters }
      
      if (searchTerm) {
        appliedFilters.saleParty = searchTerm
      }
      
      fetchDeals(appliedFilters)
    }, 300)

    return () => clearTimeout(delayedFetch)
  }, [filters, searchTerm, fetchDeals])

  const handleExport = async () => {
    try {
      // This would call an export API
      console.log('Exporting deals...', deals)
      // For now, just download as JSON
      const dataStr = JSON.stringify(deals, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `deals-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }


  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load deals</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={refreshDeals}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <History className="w-8 h-8 mr-3 text-primary-600" />
            Deals History
          </h1>
          <p className="text-gray-600 mt-2">View and manage all trading transactions</p>
        </div>
        
        <div className="flex space-x-3">
          <motion.button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "btn-secondary flex items-center space-x-2",
              showFilters && "bg-primary-100 text-primary-700"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </motion.button>
          
          <motion.button
            onClick={handleExport}
            disabled={deals.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Terms
              </label>
              <select
                value={filters.deliveryTerms || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  deliveryTerms: e.target.value === '' ? undefined : e.target.value as 'delivered' | 'pickup'
                }))}
                className="input-field"
              >
                <option value="">All</option>
                <option value="delivered">Delivered</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setFilters({})}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Search and Content */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals by customer, product, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <motion.button
            onClick={refreshDeals}
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-4 h-4" />
          </motion.button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading deals..." />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'No deals match your search criteria.' 
                : 'Start by registering your first deal to see history here.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-auto" style={{ maxHeight: '600px' }}>
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700" style={{ width: '60px' }}>Sr.No</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700" style={{ width: '120px', whiteSpace: 'nowrap' }}>Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700" style={{ width: '180px' }}>Sale Party</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700" style={{ width: '120px' }}>Quantity Sold</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700" style={{ width: '100px' }}>Sale Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700" style={{ width: '150px' }}>Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700" style={{ width: '180px' }}>Purchase Party</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700" style={{ width: '140px' }}>Quantity Purchased</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700" style={{ width: '120px' }}>Purchase Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700" style={{ width: '50px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal, index) => (
                    <motion.tr
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900" style={{ whiteSpace: 'nowrap' }}>
                        {deal.date}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {deal.saleParty}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right">
                        {deal.quantitySold.toLocaleString()} kg
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right">
                        ₹{deal.saleRate.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{deal.productCode}</span>
                          <div className="text-xs text-gray-500">{deal.grade}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {deal.purchaseParty}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right">
                        {deal.purchaseQuantity.toLocaleString()} kg
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right">
                        ₹{deal.purchaseRate.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {onViewDeal && (
                          <motion.button
                            onClick={() => onViewDeal(deal.id)}
                            className="text-primary-600 hover:text-primary-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {deals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                        <h3 className="font-medium text-gray-900">{deal.saleParty}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{deal.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(deal.quantitySold * deal.saleRate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {deal.quantitySold} kg × ₹{deal.saleRate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{deal.productCode}</p>
                      <p className="text-xs text-gray-500">{deal.grade}</p>
                    </div>
                    
                    {onViewDeal && (
                      <motion.button
                        onClick={() => onViewDeal(deal.id)}
                        className="btn-secondary text-sm py-2 px-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination info */}
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {deals.length} deals</span>
              {deals.length > 0 && (
                <span>
                  Total Value: {formatCurrency(
                    deals.reduce((sum, deal) => sum + (deal.quantitySold * deal.saleRate), 0)
                  )}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}