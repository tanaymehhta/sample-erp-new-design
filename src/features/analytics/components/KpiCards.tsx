import React from 'react'
import { KpiResponse } from '../services/analyticsService'

interface KpiCardsProps {
  data: KpiResponse | null
  loading: boolean
}

interface KpiCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: string
  loading: boolean
}

function KpiCard({ title, value, change, changeType, icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getChangeArrow = () => {
    switch (changeType) {
      case 'positive':
        return '↗'
      case 'negative':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
              <span className="mr-1">{getChangeArrow()}</span>
              {change}
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-lg">{icon}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`
  }
  return `₹${num.toFixed(0)}`
}

function formatVolume(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K MT`
  }
  return `${num.toFixed(0)} MT`
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  const getChangeType = (changeStr?: string): 'positive' | 'negative' | 'neutral' => {
    if (!changeStr) return 'neutral'
    const change = parseFloat(changeStr)
    if (change > 0) return 'positive'
    if (change < 0) return 'negative'
    return 'neutral'
  }

  const formatChange = (changeStr?: string): string => {
    if (!changeStr) return ''
    const change = parseFloat(changeStr)
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Total Revenue"
        value={data?.current ? formatNumber(data.current.totalRevenue) : '₹0'}
        change={data?.changes ? formatChange(data.changes.revenueChange) : undefined}
        changeType={data?.changes ? getChangeType(data.changes.revenueChange) : 'neutral'}
        icon="₹"
        loading={loading}
      />
      
      <KpiCard
        title="Average Volume per Deal"
        value={data?.current ? `${data.current.avgVolumePerDeal.toFixed(1)} MT` : '0 MT'}
        change={data?.changes ? formatChange(data.changes.avgVolumeChange) : undefined}
        changeType={data?.changes ? getChangeType(data.changes.avgVolumeChange) : 'neutral'}
        icon="📊"
        loading={loading}
      />
      
      <KpiCard
        title="Active Customers"
        value={data?.current ? data.current.activeCustomers.toString() : '0'}
        change={data?.changes ? formatChange(data.changes.customerChange) : undefined}
        changeType={data?.changes ? getChangeType(data.changes.customerChange) : 'neutral'}
        icon="👥"
        loading={loading}
      />
      
      <KpiCard
        title="Total Volume"
        value={data?.current ? formatVolume(data.current.totalVolume) : '0 MT'}
        change={data?.changes ? formatChange(data.changes.volumeChange) : undefined}
        changeType={data?.changes ? getChangeType(data.changes.volumeChange) : 'neutral'}
        icon="📦"
        loading={loading}
      />
    </div>
  )
}