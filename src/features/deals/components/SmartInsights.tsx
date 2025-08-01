import { TrendingUp, Users, Package } from 'lucide-react'
import { FilterInsights } from '../types'

interface SmartInsightsProps {
  insights: FilterInsights
  isLoading?: boolean
}

export default function SmartInsights({ insights, isLoading }: SmartInsightsProps) {
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

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse flex space-x-4">
            <div className="w-12 h-4 bg-blue-200 rounded"></div>
            <div className="w-16 h-4 bg-blue-200 rounded"></div>
            <div className="w-20 h-4 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          {/* Main Stats */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {insights.totalDeals} deals worth {formatCurrency(insights.totalValue)}
              </p>
              <p className="text-sm text-gray-600">{insights.timeFrameDescription}</p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Secondary Stats */}
          <div className="flex items-center space-x-4">
            {insights.topCustomer && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Top Customer</p>
                  <p className="text-xs text-gray-600">{insights.topCustomer}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Avg Deal Size</p>
                <p className="text-xs text-gray-600">{formatCurrency(insights.avgDealSize)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
            Export
          </button>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Share
          </button>
        </div>
      </div>
      
      {/* Additional Insights */}
      {insights.totalDeals === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            💡 No deals found for this time period. Try adjusting your filters or check a different date range.
          </p>
        </div>
      )}
    </div>
  )
}