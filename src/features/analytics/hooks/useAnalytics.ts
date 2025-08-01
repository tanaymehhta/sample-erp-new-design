// Analytics Hook - Isolated state management for analytics feature
// Following CLAUDE.md: Feature state isolation, no global pollution

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnalyticsData, TimeRange, CustomerMetrics } from '../types'
import { AnalyticsDataService } from '../services/analyticsDataService'
import { getDefaultTimeRange } from '../utils/dataTransforms'

interface UseAnalyticsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  timeRange: TimeRange
  selectedCustomer: CustomerMetrics | null
  
  // Actions
  setTimeRange: (timeRange: TimeRange) => void
  selectCustomer: (customer: CustomerMetrics | null) => void
  refreshData: () => Promise<void>
  
  // Computed values
  hasData: boolean
  isEmpty: boolean
}

export function useAnalytics(
  analyticsService: AnalyticsDataService,
  options: UseAnalyticsOptions = {}
): UseAnalyticsReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options
  
  // Isolated analytics state
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(getDefaultTimeRange())
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMetrics | null>(null)

  const fetchData = useCallback(async () => {
    try {
      console.log('useAnalytics: Starting data fetch...')
      setLoading(true)
      setError(null)
      
      const analyticsData = await analyticsService.getAnalyticsData(timeRange)
      console.log('useAnalytics: Received analytics data:', analyticsData)
      setData(analyticsData)
      
      // Clear selected customer if it's no longer in the data
      if (selectedCustomer && !analyticsData.customerMetrics.find(c => c.customerId === selectedCustomer.customerId)) {
        setSelectedCustomer(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      console.error('Analytics data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [analyticsService, timeRange, selectedCustomer])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Fetch data when time range changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  // Handle time range changes
  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
    setSelectedCustomer(null) // Clear selection when time range changes
  }, [])

  // Handle customer selection
  const selectCustomer = useCallback((customer: CustomerMetrics | null) => {
    setSelectedCustomer(customer)
  }, [])

  // Computed values
  const hasData = useMemo(() => {
    return data !== null && data.customerMetrics.length > 0
  }, [data])

  const isEmpty = useMemo(() => {
    return data !== null && data.customerMetrics.length === 0
  }, [data])

  return {
    data,
    loading,
    error,
    timeRange,
    selectedCustomer,
    
    setTimeRange: handleTimeRangeChange,
    selectCustomer,
    refreshData,
    
    hasData,
    isEmpty
  }
}