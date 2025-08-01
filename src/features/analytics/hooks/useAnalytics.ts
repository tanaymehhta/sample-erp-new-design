import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  analyticsService, 
  KpiResponse, 
  VolumeAnalysisPoint, 
  TopCustomer, 
  TopProduct,
  SummaryStats,
  FilterOptions,
  AnalyticsFilters 
} from '../services/analyticsService'

// Generic hook for data fetching with loading and error states
function useAsyncData<T>(
  fetcher: () => Promise<{ success: boolean; data: T }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetcher()
      
      if (response.success) {
        setData(response.data)
      } else {
        setError('Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// KPI Metrics Hook
export function useKpiMetrics(filters: AnalyticsFilters) {
  return useAsyncData<KpiResponse>(
    () => analyticsService.getKpiMetrics(filters),
    [JSON.stringify(filters)]
  )
}

// Volume Analysis Hook - Your main feature
export function useVolumeAnalysis(filters: AnalyticsFilters) {
  const { data, loading, error, refetch } = useAsyncData<VolumeAnalysisPoint[]>(
    () => analyticsService.getVolumeAnalysis(filters),
    [JSON.stringify(filters)]
  )

  // Transform data for chart libraries
  const chartData = useMemo(() => {
    if (!data) return []
    
    return data.map(point => ({
      x: point.period,
      period: point.period,
      volume: point.volume,
      revenue: point.revenue / 100000, // Convert to lakhs for display
      revenueRaw: point.revenue, // Keep raw value for calculations
      deals: point.dealCount,
      avgVolume: point.avgVolume,
      avgRate: point.avgRate
    }))
  }, [data])

  // Calculate trends and insights
  const insights = useMemo(() => {
    if (!data || data.length < 2) return null

    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    
    const volumeChange = previous.volume > 0 ? 
      ((latest.volume - previous.volume) / previous.volume) * 100 : 0
    
    const revenueChange = previous.revenue > 0 ? 
      ((latest.revenue - previous.revenue) / previous.revenue) * 100 : 0

    const dealChange = previous.dealCount > 0 ? 
      ((latest.dealCount - previous.dealCount) / previous.dealCount) * 100 : 0

    return {
      volumeChange: volumeChange.toFixed(1),
      revenueChange: revenueChange.toFixed(1),
      dealChange: dealChange.toFixed(1),
      trend: volumeChange > 0 ? 'up' : volumeChange < 0 ? 'down' : 'stable',
      totalVolume: data.reduce((sum, point) => sum + point.volume, 0),
      totalRevenue: data.reduce((sum, point) => sum + point.revenue, 0),
      totalDeals: data.reduce((sum, point) => sum + point.dealCount, 0)
    }
  }, [data])

  return { 
    data, 
    chartData, 
    insights, 
    loading, 
    error, 
    refetch 
  }
}

// Top Customers Hook
export function useTopCustomers(filters: AnalyticsFilters) {
  const { data, loading, error, refetch } = useAsyncData<TopCustomer[]>(
    () => analyticsService.getTopCustomers(filters),
    [JSON.stringify(filters)]
  )

  // Calculate customer insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) return null

    const totalVolume = data.reduce((sum, customer) => sum + customer.totalVolume, 0)
    const totalRevenue = data.reduce((sum, customer) => sum + customer.totalRevenue, 0)
    
    const topCustomer = data[0]
    const topCustomerShare = totalVolume > 0 ? (topCustomer.totalVolume / totalVolume) * 100 : 0

    return {
      totalCustomers: data.length,
      topCustomer: topCustomer.customerName,
      topCustomerShare: topCustomerShare.toFixed(1),
      avgVolumePerCustomer: totalVolume / data.length,
      avgRevenuePerCustomer: totalRevenue / data.length
    }
  }, [data])

  return { 
    data, 
    insights, 
    loading, 
    error, 
    refetch 
  }
}

// Top Products Hook
export function useTopProducts(filters: AnalyticsFilters) {
  const { data, loading, error, refetch } = useAsyncData<TopProduct[]>(
    () => analyticsService.getTopProducts(filters),
    [JSON.stringify(filters)]
  )

  // Calculate product insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) return null

    const totalVolume = data.reduce((sum, product) => sum + product.totalVolume, 0)
    const totalRevenue = data.reduce((sum, product) => sum + product.totalRevenue, 0)
    
    const topProduct = data[0]
    const topProductShare = totalVolume > 0 ? (topProduct.totalVolume / totalVolume) * 100 : 0

    // Group by company
    const companyCounts = data.reduce((acc, product) => {
      acc[product.company] = (acc[product.company] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCompany = Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      totalProducts: data.length,
      topProduct: `${topProduct.productCode} (${topProduct.company})`,
      topProductShare: topProductShare.toFixed(1),
      avgVolumePerProduct: totalVolume / data.length,
      avgRevenuePerProduct: totalRevenue / data.length,
      topCompany: topCompany ? topCompany[0] : null,
      topCompanyProductCount: topCompany ? topCompany[1] : 0
    }
  }, [data])

  return { 
    data, 
    insights, 
    loading, 
    error, 
    refetch 
  }
}

// Summary Stats Hook
export function useSummaryStats(filters: AnalyticsFilters) {
  return useAsyncData<SummaryStats>(
    () => analyticsService.getSummaryStats(filters),
    [JSON.stringify(filters)]
  )
}

// Filter Options Hook (cached)
export function useFilterOptions() {
  const [data, setData] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchOptions() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await analyticsService.getFilterOptions()
        
        if (mounted) {
          if (response.success) {
            setData(response.data)
          } else {
            setError('Failed to fetch filter options')
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchOptions()

    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}

// Combined Analytics Hook for dashboard
export function useAnalyticsDashboard(filters: AnalyticsFilters) {
  const kpi = useKpiMetrics(filters)
  const volumeAnalysis = useVolumeAnalysis(filters)
  const topCustomers = useTopCustomers({ ...filters, limit: 5 })
  const topProducts = useTopProducts({ ...filters, limit: 10 })
  const summary = useSummaryStats(filters)
  const filterOptions = useFilterOptions()

  const loading = kpi.loading || volumeAnalysis.loading || topCustomers.loading || 
                  topProducts.loading || summary.loading || filterOptions.loading

  const error = kpi.error || volumeAnalysis.error || topCustomers.error || 
                topProducts.error || summary.error || filterOptions.error

  const refetchAll = useCallback(() => {
    kpi.refetch()
    volumeAnalysis.refetch()
    topCustomers.refetch()
    topProducts.refetch()
    summary.refetch()
  }, [kpi.refetch, volumeAnalysis.refetch, topCustomers.refetch, topProducts.refetch, summary.refetch])

  return {
    kpi: kpi.data,
    volumeAnalysis: {
      data: volumeAnalysis.data,
      chartData: volumeAnalysis.chartData,
      insights: volumeAnalysis.insights
    },
    topCustomers: {
      data: topCustomers.data,
      insights: topCustomers.insights
    },
    topProducts: {
      data: topProducts.data,
      insights: topProducts.insights
    },
    summary: summary.data,
    filterOptions: filterOptions.data,
    loading,
    error,
    refetch: refetchAll
  }
}