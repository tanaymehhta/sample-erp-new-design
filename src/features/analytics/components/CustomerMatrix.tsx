// Customer Matrix Component - Performance table with expandable rows
// Following CLAUDE.md: Single responsibility, clear interfaces

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  Filter
} from 'lucide-react'
import { CustomerMetrics } from '../types'

interface CustomerMatrixProps {
  customers: CustomerMetrics[]
  onCustomerSelect?: (customer: CustomerMetrics) => void
  loading?: boolean
}

interface CustomerRowProps {
  customer: CustomerMetrics
  onSelect?: (customer: CustomerMetrics) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function CustomerRow({ customer, onSelect, isExpanded, onToggleExpand }: CustomerRowProps) {
  const getPerformanceColor = (variancePercentage: number) => {
    if (variancePercentage > 10) return 'text-green-600 bg-green-50'
    if (variancePercentage < -10) return 'text-red-600 bg-red-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getPerformanceIndicator = (variancePercentage: number) => {
    if (variancePercentage > 10) return '🟢'
    if (variancePercentage < -10) return '🔴'
    return '🟡'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toLocaleString()}`
  }

  const formatDays = (days: number) => {
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.floor(days / 7)} weeks`
    return `${Math.floor(days / 30)} months`
  }

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => {
          onSelect?.(customer)
          onToggleExpand?.()
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Performance Indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getPerformanceIndicator(customer.variancePercentage)}</span>
              <button className="text-gray-400 hover:text-gray-600">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Customer Name */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{customer.customerName}</h3>
              <p className="text-sm text-gray-500">{customer.dealCount} deals</p>
            </div>

            {/* Revenue */}
            <div className="text-right min-w-0">
              <p className="font-semibold text-gray-900">{formatCurrency(customer.currentPeriodSales)}</p>
              <p className="text-sm text-gray-500">Target: {formatCurrency(customer.targetSales)}</p>
            </div>

            {/* Variance */}
            <div className="text-right min-w-0">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(customer.variancePercentage)}`}>
                {customer.variancePercentage > 0 ? '+' : ''}{customer.variancePercentage.toFixed(1)}%
              </span>
            </div>

            {/* Trend */}
            <div className="flex items-center space-x-2">
              {getTrendIcon(customer.trend)}
              <span className="text-sm text-gray-600">{formatDays(customer.daysSinceLastDeal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4 space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Average Deal Size</p>
                  <p className="font-semibold">{formatCurrency(customer.averageDealSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Growth Rate</p>
                  <p className="font-semibold">{customer.growthRate > 0 ? '+' : ''}{customer.growthRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  <p className={`font-semibold ${customer.riskScore > 70 ? 'text-red-600' : customer.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {customer.riskScore}/100
                  </p>
                </div>
              </div>

              {/* Top Products */}
              {customer.productMix.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Top Products</p>
                  <div className="space-y-1">
                    {customer.productMix.slice(0, 3).map((product, index) => (
                      <div key={product.productId} className="flex justify-between text-sm">
                        <span className="text-gray-700">{product.productName}</span>
                        <span className="text-gray-900 font-medium">{product.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {customer.insights.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Insights</p>
                  <div className="space-y-1">
                    {customer.insights.slice(0, 2).map((insight, index) => (
                      <p key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        💡 {insight}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LoadingRow() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

export default function CustomerMatrix({ customers, onCustomerSelect, loading = false }: CustomerMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'revenue' | 'variance' | 'name' | 'lastDeal'>('revenue')
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())

  const filteredAndSortedCustomers = customers
    .filter(customer => 
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.currentPeriodSales - a.currentPeriodSales
        case 'variance':
          return b.variancePercentage - a.variancePercentage
        case 'name':
          return a.customerName.localeCompare(b.customerName)
        case 'lastDeal':
          return a.daysSinceLastDeal - b.daysSinceLastDeal
        default:
          return 0
      }
    })

  const toggleExpanded = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers)
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId)
    } else {
      newExpanded.add(customerId)
    }
    setExpandedCustomers(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingRow key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="variance">Sort by Performance</option>
            <option value="lastDeal">Sort by Recency</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredAndSortedCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No customers found matching your search.</p>
          </div>
        ) : (
          filteredAndSortedCustomers.map(customer => (
            <CustomerRow
              key={customer.customerId}
              customer={customer}
              onSelect={onCustomerSelect}
              isExpanded={expandedCustomers.has(customer.customerId)}
              onToggleExpand={() => toggleExpanded(customer.customerId)}
            />
          ))
        )}
      </div>
    </div>
  )
}