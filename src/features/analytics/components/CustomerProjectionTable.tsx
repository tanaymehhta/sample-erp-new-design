import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { CustomerMetrics } from '../types'

interface CustomerProjectionTableProps {
  customers: CustomerMetrics[]
  loading?: boolean
}

interface MonthlyProjection {
  month: string
  volume: number
  growth: number
  isProjected?: boolean
}

interface CustomerProjectionData {
  customer: CustomerMetrics
  monthlyData: MonthlyProjection[]
  overallTrend: 'rising' | 'falling' | 'stable'
  suddenChange: {
    type: 'spike' | 'drop' | 'none'
    magnitude: number
    month?: string
  }
  riskLevel: 'high' | 'medium' | 'low'
  volumeGrowthRate: number
  currentMonthVolume: number
  lastMonthVolume: number
}

function CustomerProjectionTable({ customers, loading = false }: CustomerProjectionTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<'revenue' | 'growth' | 'change'>('revenue')

  // Generate projection data with trend analysis
  const projectionData = useMemo((): CustomerProjectionData[] => {
    return customers.map(customer => {
      // Convert monthly breakdown to projection format (use actual monthly quantities)
      const monthlyData: MonthlyProjection[] = customer.monthlyBreakdown.map((month, index) => {
        const prevMonth = customer.monthlyBreakdown[index - 1]
        const currentVolume = month.quantity || 0 // Use actual monthly quantity
        const prevVolume = prevMonth ? (prevMonth.quantity || 0) : 0
        const growth = prevVolume ? ((currentVolume - prevVolume) / prevVolume) * 100 : 0
        
        console.log(`Monthly data for ${customer.customerName} - ${month.month} ${month.year}:`, {
          currentVolume,
          prevVolume,
          growth
        })
        
        return {
          month: `${month.month} ${month.year}`,
          volume: currentVolume,
          growth,
          isProjected: false
        }
      })

      // Add next month projection (simple trend-based)
      if (monthlyData.length > 0) {
        const lastMonth = monthlyData[monthlyData.length - 1]
        const avgGrowth = monthlyData.reduce((sum, m) => sum + m.growth, 0) / monthlyData.length
        const projectedVolume = lastMonth.volume * (1 + (avgGrowth / 100))
        
        monthlyData.push({
          month: 'Next Month',
          volume: projectedVolume,
          growth: avgGrowth,
          isProjected: true
        })
      }

      // Calculate actual volume growth from monthly data
      let volumeGrowthRate = 0
      if (monthlyData.length >= 2) {
        const latestMonth = monthlyData[monthlyData.length - 2] // Exclude projection
        const previousMonth = monthlyData[monthlyData.length - 3]
        if (latestMonth && previousMonth && previousMonth.volume > 0) {
          volumeGrowthRate = ((latestMonth.volume - previousMonth.volume) / previousMonth.volume) * 100
        }
      }

      // Analyze overall trend based on volume
      let overallTrend: 'rising' | 'falling' | 'stable' = 'stable'
      if (volumeGrowthRate > 15) overallTrend = 'rising'
      else if (volumeGrowthRate < -15) overallTrend = 'falling'

      // Detect sudden changes
      let suddenChange: CustomerProjectionData['suddenChange'] = { type: 'none', magnitude: 0 }
      
      for (let i = 1; i < monthlyData.length - 1; i++) {
        const currentGrowth = monthlyData[i].growth
        const prevGrowth = monthlyData[i - 1].growth
        const growthChange = Math.abs(currentGrowth - prevGrowth)
        
        if (growthChange > 50) { // Sudden change threshold
          suddenChange = {
            type: currentGrowth > prevGrowth ? 'spike' : 'drop',
            magnitude: growthChange,
            month: monthlyData[i].month
          }
          break
        }
      }

      // Calculate risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (customer.riskScore > 70) riskLevel = 'high'
      else if (customer.riskScore > 40) riskLevel = 'medium'

      // Calculate current month and last month volumes for display (exclude projection)
      const actualMonthlyData = monthlyData.filter(m => !m.isProjected)
      const currentMonthVolume = actualMonthlyData.length > 0 ? actualMonthlyData[actualMonthlyData.length - 1].volume : customer.quantity
      const lastMonthVolume = actualMonthlyData.length > 1 ? actualMonthlyData[actualMonthlyData.length - 2].volume : 0

      return {
        customer,
        monthlyData,
        overallTrend,
        suddenChange,
        riskLevel,
        volumeGrowthRate,
        currentMonthVolume,
        lastMonthVolume
      }
    })
  }, [customers])

  // Sort projection data
  const sortedData = useMemo(() => {
    return [...projectionData].sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.customer.currentPeriodSales - a.customer.currentPeriodSales
        case 'growth':
          return b.volumeGrowthRate - a.volumeGrowthRate
        case 'change':
          return b.suddenChange.magnitude - a.suddenChange.magnitude
        default:
          return 0
      }
    })
  }, [projectionData, sortBy])

  const formatVolume = (volume: number) => {
    if (!volume || isNaN(volume) || volume === 0) return '0 MT'
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M MT`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K MT`
    return `${Math.round(volume).toLocaleString()} MT`
  }

  const getTrendIcon = (growth: number) => {
    if (growth > 10) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (growth < -10) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4 border border-gray-400 rounded-sm"></div>
  }

  const getChangeIndicator = (change: CustomerProjectionData['suddenChange']) => {
    if (change.type === 'spike') {
      return <Zap className="w-4 h-4 text-yellow-500" />
    }
    if (change.type === 'drop') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const displayedData = isExpanded ? sortedData : sortedData.slice(0, 8)

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            📦 Customer Volume Projection
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monthly volume tracking with trend analysis and change detection
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded px-3 py-1"
          >
            <option value="revenue">Sort by Volume</option>
            <option value="growth">Sort by Growth</option>
            <option value="change">Sort by Change</option>
          </select>
        </div>
      </div>

      {/* Projection Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-700">Customer</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700">This Month</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700">Last Month</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700">Growth %</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Trend</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Changes</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Risk</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((data, index) => (
              <motion.tr
                key={data.customer.customerId}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      data.overallTrend === 'rising' ? 'bg-green-500' :
                      data.overallTrend === 'falling' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{data.customer.customerName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.customer.dealCount} deals • {formatVolume(data.customer.quantity || 0)} total
                  </div>
                </td>
                
                {/* This Month Volume */}
                <td className="py-3 px-2 text-right">
                  <div className="font-semibold text-gray-900">
                    {formatVolume(data.currentMonthVolume || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.customer.dealCount} deals
                  </div>
                </td>

                {/* Last Month Volume */}
                <td className="py-3 px-2 text-right">
                  <div className="font-semibold text-gray-600">
                    {data.lastMonthVolume > 0 ? formatVolume(data.lastMonthVolume) : '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.lastMonthVolume > 0 ? 'previous' : 'no data'}
                  </div>
                </td>
                
                <td className="py-3 px-2 text-right">
                  <div className={`font-medium ${
                    data.volumeGrowthRate > 0 ? 'text-green-600' : 
                    data.volumeGrowthRate < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {data.volumeGrowthRate === 0 ? 'N/A' : 
                     `${data.volumeGrowthRate > 0 ? '+' : ''}${data.volumeGrowthRate.toFixed(1)}%`}
                  </div>
                </td>
                
                <td className="py-3 px-2 text-center">
                  {getTrendIcon(data.volumeGrowthRate)}
                </td>
                
                <td className="py-3 px-2 text-center">
                  {getChangeIndicator(data.suddenChange)}
                </td>
                
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    data.riskLevel === 'high' ? 'bg-red-500' :
                    data.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand/Collapse Button */}
      {sortedData.length > 8 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isExpanded ? 'Show Less' : `Show All ${sortedData.length} Customers`}
            </span>
          </button>
        </div>
      )}

      {/* Key */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Rising</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Falling</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>Sudden Spike</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Sudden Drop</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CustomerProjectionTable