import { motion } from 'framer-motion'
import { BarChart3, Download, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'

// Analytics feature components - following CLAUDE.md modular structure
import ExecutiveOverview from '../features/analytics/components/ExecutiveOverview'
import CustomerProjectionTable from '../features/analytics/components/CustomerProjectionTable'
import InsightsPanel from '../features/analytics/components/InsightsPanel'
import TimeRangeSelector from '../features/analytics/components/TimeRangeSelector'

// Analytics hooks and services
import { useAnalytics } from '../features/analytics/hooks/useAnalytics'
import { useDealDataProvider } from '../features/analytics/hooks/useDealDataProvider'
import { AnalyticsDataService } from '../features/analytics/services/analyticsDataService'
import { formatToDDMMYYYY } from '../features/analytics/utils/dateUtils'

export default function Analytics() {
  // Dependency injection - following CLAUDE.md principles
  const dataProvider = useDealDataProvider()
  const analyticsService = useMemo(() => new AnalyticsDataService(dataProvider), [dataProvider])
  
  // Isolated analytics state
  const {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshData,
    hasData,
    isEmpty
  } = useAnalytics(analyticsService, { autoRefresh: true, refreshInterval: 60000 })

  const handleExportReport = () => {
    if (!data) {
      console.warn('No data available for export')
      return
    }

    try {
      // Create CSV content
      const csvHeaders = [
        'Customer Name',
        'Current Sales',
        'Previous Sales', 
        'Growth Rate',
        'Total Volume',
        'Average Rate',
        'Profit Margin'
      ]

      const csvRows = data.customerMetrics.map(customer => [
        customer.customerName,
        customer.currentPeriodSales.toFixed(2),
        customer.currentPeriodSales.toFixed(2), // Placeholder for previousPeriodSales
        customer.growthRate.toFixed(2),
        customer.quantity.toFixed(2),
        customer.quantity.toFixed(2),
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('Analytics report exported successfully')
    } catch (error) {
      console.error('Failed to export analytics report:', error)
    }
  }

  const topPerformers = useMemo(() => {
    if (!data) return []
    return data.customerMetrics
      .sort((a, b) => b.currentPeriodSales - a.currentPeriodSales)
      .slice(0, 5)
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
            Customer Sales Analytics
          </h1>
          <p className="text-gray-600 mt-2">Real-time customer performance insights and business intelligence</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportReport}
            disabled={!hasData}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <TimeRangeSelector
          timeRange={timeRange}
          onChange={setTimeRange}
          disabled={loading}
        />
        {data && (
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6"
        >
          <div className="text-red-800">
            <h3 className="font-bold text-lg mb-2">❌ Analytics Data Error</h3>
            <p className="text-sm mb-3 font-medium">What's not working:</p>
            <div className="bg-red-100 p-3 rounded text-sm font-mono">
              {error}
            </div>
            <div className="mt-4 text-sm">
              <p className="font-medium">Troubleshooting steps:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check if deals database has data in dd-mm-yyyy format</li>
                <li>Verify /api/deals and /api/customers endpoints are working</li>
                <li>Ensure required deal fields: saleParty, date, quantitySold, saleRate</li>
                <li>Ensure required customer fields: partyName (or name)</li>
                <li>Check browser console for detailed error logs</li>
              </ul>
            </div>
            <button
              onClick={refreshData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {isEmpty && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">📊 No deals found for selected time period</h3>
            <p className="text-gray-600 mb-4">
              No deals were found for the current time range ({formatToDDMMYYYY(timeRange.startDate)} - {formatToDDMMYYYY(timeRange.endDate)})
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✅ Database connection successful</p>
              <p>✅ API calls completed successfully</p>
              <p>ℹ️ Try selecting a different time range or register some deals</p>
            </div>
          </div>
        </motion.div>
      )}

      {(hasData || loading) && (
        <>
          {/* Executive Overview */}
          <ExecutiveOverview
            stats={data?.summaryStats || {
              totalSales: 0,
              totalTargetSales: 0,
              activeCustomers: 0,
              newCustomers: 0,
              averageSalesPerCustomer: 0,
              totalVolume: 0,
              averageVolume: 0,
              periodGrowthRate: 0,
              customersExceedingTarget: 0,
              customersAtRisk: 0
            }}
            loading={loading}
          />

          {/* Customer Sales Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CustomerProjectionTable
              customers={data?.customerMetrics || []}
              loading={loading}
            />
          </motion.div>

          {/* Business Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Intelligence</h2>
              <p className="text-gray-600">AI-powered insights, alerts, and performance trends</p>
            </div>
            
            <InsightsPanel
              alerts={data?.alerts || []}
              trends={data?.trends || []}
              topPerformers={topPerformers}
              loading={loading}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}