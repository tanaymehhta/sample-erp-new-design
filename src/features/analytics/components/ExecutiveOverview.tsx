// Executive Overview Component - Top-level metrics display
// Following CLAUDE.md: Single responsibility, reusable component

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Target } from 'lucide-react'
import { SummaryStats } from '../types'

interface ExecutiveOverviewProps {
  stats: SummaryStats
  loading?: boolean
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  color: string
}

function MetricCard({ title, value, subtitle, trend, trendValue, icon, color }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <motion.div
      className="card hover:shadow-lg transition-shadow duration-200"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500">{subtitle}</p>
            {trend && trendValue && (
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">{trendValue}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`${color} p-3 rounded-xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

function LoadingCard() {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
  )
}

export default function ExecutiveOverview({ stats, loading = false }: ExecutiveOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount.toLocaleString()}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K MT`
    }
    return `${volume.toLocaleString()} MT`
  }

  const revenueMetrics = {
    title: 'Total Revenue',
    value: formatCurrency(stats.totalSales),
    subtitle: `Target: ${formatCurrency(stats.totalTargetSales)}`,
    trend: stats.periodGrowthRate > 0 ? 'up' as const : stats.periodGrowthRate < 0 ? 'down' as const : 'neutral' as const,
    trendValue: `${stats.periodGrowthRate > 0 ? '+' : ''}${stats.periodGrowthRate.toFixed(1)}%`,
    icon: <DollarSign className="w-6 h-6 text-green-600" />,
    color: 'bg-green-100'
  }

  const customerMetrics = {
    title: 'Active Customers',
    value: stats.activeCustomers.toString(),
    subtitle: `${stats.newCustomers} new this period`,
    trend: stats.newCustomers > 0 ? 'up' as const : 'neutral' as const,
    trendValue: stats.newCustomers > 0 ? `+${stats.newCustomers}` : undefined,
    icon: <Users className="w-6 h-6 text-blue-600" />,
    color: 'bg-blue-100'
  }

  const volumeMetrics = {
    title: 'Volume Traded',
    value: formatVolume(stats.totalVolume),
    subtitle: `Avg: ${formatVolume(stats.averageVolume)} per deal`,
    icon: <Package className="w-6 h-6 text-purple-600" />,
    color: 'bg-purple-100'
  }

  const performanceMetrics = {
    title: 'Performance',
    value: `${stats.customersExceedingTarget}/${stats.activeCustomers}`,
    subtitle: `${stats.customersAtRisk} at risk`,
    trend: stats.customersAtRisk === 0 ? 'up' as const : stats.customersAtRisk > stats.activeCustomers * 0.3 ? 'down' as const : 'neutral' as const,
    trendValue: stats.customersAtRisk > 0 ? `${stats.customersAtRisk} risk` : 'All good',
    icon: <Target className="w-6 h-6 text-orange-600" />,
    color: 'bg-orange-100'
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <MetricCard {...revenueMetrics} />
      <MetricCard {...customerMetrics} />
      <MetricCard {...volumeMetrics} />
      <MetricCard {...performanceMetrics} />
    </motion.div>
  )
}