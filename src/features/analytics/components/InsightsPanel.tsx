// Insights Panel Component - Smart alerts and business intelligence
// Following CLAUDE.md: Single responsibility, reusable alerts system

import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  TrendingUp, 
  Trophy, 
  Bell,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react'
import { AlertData, CustomerMetrics, TrendData } from '../types'

interface InsightsPanelProps {
  alerts: AlertData[]
  trends: TrendData[]
  topPerformers: CustomerMetrics[]
  loading?: boolean
}

interface AlertItemProps {
  alert: AlertData
  onClick?: (alert: AlertData) => void
}

interface TrendItemProps {
  label: string
  value: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

function AlertItem({ alert, onClick }: AlertItemProps) {
  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      case 'opportunity': return <TrendingUp className="w-4 h-4" />
      case 'milestone': return <Trophy className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (severity: AlertData['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <motion.div
      className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getAlertColor(alert.severity)}`}
      onClick={() => onClick?.(alert)}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{alert.customerName}</p>
          <p className="text-xs mt-1 opacity-90">{alert.message}</p>
        </div>
        {alert.actionRequired && (
          <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-60" />
        )}
      </div>
    </motion.div>
  )
}

function TrendItem({ label, value, trend, icon }: TrendItemProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />
      case 'down': return <TrendingUp className="w-3 h-3 rotate-180" />
      default: return null
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <div className="text-gray-400">
          {icon}
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
        <span className="text-sm font-medium">{value}</span>
        {getTrendIcon()}
      </div>
    </div>
  )
}

function LoadingCard({ title }: { title: string }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InsightsPanel({ alerts, trends, topPerformers, loading = false }: InsightsPanelProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toLocaleString()}`
  }

  const calculateTrendDirection = (trends: TrendData[]): 'up' | 'down' | 'stable' => {
    if (trends.length < 2) return 'stable'
    const latest = trends[trends.length - 1]
    const previous = trends[trends.length - 2]
    if (latest.sales > previous.sales * 1.1) return 'up'
    if (latest.sales < previous.sales * 0.9) return 'down'
    return 'stable'
  }

  const getMonthlyGrowth = (trends: TrendData[]): string => {
    if (trends.length < 2) return '0%'
    const latest = trends[trends.length - 1]
    const previous = trends[trends.length - 2]
    const growth = ((latest.sales - previous.sales) / previous.sales) * 100
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LoadingCard title="Smart Alerts" />
        <LoadingCard title="Performance Trends" />
        <LoadingCard title="Top Performers" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Smart Alerts */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Bell className="w-4 h-4 mr-2 text-orange-500" />
            Smart Alerts
          </h3>
          {alerts.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">All good! No alerts.</p>
            </div>
          ) : (
            alerts.slice(0, 5).map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))
          )}
        </div>
      </motion.div>

      {/* Performance Trends */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
          Performance Trends
        </h3>
        
        <div className="space-y-1">
          <TrendItem
            label="Monthly Growth"
            value={getMonthlyGrowth(trends)}
            trend={calculateTrendDirection(trends)}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <TrendItem
            label="Active Customers"
            value={trends.length > 0 ? trends[trends.length - 1].customers.toString() : '0'}
            trend="stable"
            icon={<Calendar className="w-4 h-4" />}
          />
          <TrendItem
            label="Avg Deal Size"
            value={trends.length > 0 ? formatCurrency(trends[trends.length - 1].sales / Math.max(trends[trends.length - 1].deals, 1)) : '₹0'}
            trend="up"
            icon={<Trophy className="w-4 h-4" />}
          />
        </div>

        {trends.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Insight:</strong> {calculateTrendDirection(trends) === 'up' ? 'Business is growing steadily' : calculateTrendDirection(trends) === 'down' ? 'Consider reviewing customer engagement' : 'Performance is stable'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Top Performers */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
          Top Performers
        </h3>
        
        <div className="space-y-3">
          {topPerformers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            topPerformers.slice(0, 5).map((customer, index) => (
              <motion.div
                key={customer.customerId}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customer.customerName}</p>
                    <p className="text-xs text-gray-500">{customer.dealCount} deals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(customer.currentPeriodSales)}
                  </p>
                  <p className="text-xs text-green-600">
                    +{customer.variancePercentage.toFixed(0)}%
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}