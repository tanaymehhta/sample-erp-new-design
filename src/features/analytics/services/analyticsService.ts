import { ApiResponse } from '../../../shared/types/api'
import { apiService } from '../../../shared/services/apiService'

// Analytics data interfaces
export interface KpiMetrics {
  totalRevenue: number
  totalVolume: number
  activeCustomers: number
  avgVolumePerDeal: number
  totalDeals: number
  revenuePerMT: number
}

export interface KpiResponse {
  current: KpiMetrics
  comparison?: KpiMetrics | null
  changes?: {
    revenueChange: string
    volumeChange: string
    customerChange: string
    avgVolumeChange: string
  } | null
}

export interface VolumeAnalysisPoint {
  period: string
  volume: number
  revenue: number
  dealCount: number
  avgVolume: number
  avgRate: number
}

export interface TopCustomer {
  rank: number
  customerName: string
  totalVolume: number
  totalRevenue: number
  dealCount: number
  avgDealSize: number
  avgRate: number
  lastDealDate: string
  firstDealDate: string
  revenuePerMT: number
}

export interface TopProduct {
  rank: number
  productCode: string
  company: string
  grade: string
  specificGrade: string
  totalVolume: number
  totalRevenue: number
  dealCount: number
  avgRate: number
  avgVolume: number
  lastSaleDate: string
  firstSaleDate: string
  revenuePerMT: number
}

export interface SummaryStats {
  totalRevenue: number
  totalVolume: number
  activeCustomers: number
  totalDeals: number
  avgVolumePerDeal: number
  avgRate: number
  activeProducts: number
  activeCompanies: number
  revenuePerMT: number
}

export interface FilterOptions {
  productCodes: string[]
  companies: string[]
  grades: string[]
  specificGrades: string[]
  customers: string[]
}

export interface AnalyticsFilters {
  timeRange?: string
  startDate?: string
  endDate?: string
  compareWith?: string
  productCodes?: string[]
  companies?: string[]
  grades?: string[]
  specificGrades?: string[]
  groupBy?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  limit?: number
  sortBy?: 'volume' | 'revenue' | 'deals' | 'rate'
}

class AnalyticsService {
  private readonly endpoint = '/analytics'

  async getKpiMetrics(filters: AnalyticsFilters, options?: { forceRefresh?: boolean }): Promise<ApiResponse<KpiResponse>> {
    try {
      const isCurrentPeriod = this.isCurrentPeriod(filters.timeRange || '')
      console.log(`📊 AnalyticsService: Fetching KPI metrics for ${isCurrentPeriod ? 'current' : 'historical'} period`, filters)
      
      const params = new URLSearchParams()
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.compareWith) params.append('compareWith', filters.compareWith)
      if (options?.forceRefresh) params.append('forceRefresh', 'true')
      
      const response = await apiService.get<KpiResponse>(`${this.endpoint}/kpi?${params}`)
      
      const cacheStatus = (response as any).cached ? '(cached)' : '(fresh)'
      console.log(`✅ AnalyticsService: KPI metrics fetched successfully ${cacheStatus}`)
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch KPI metrics', error)
      throw error
    }
  }

  private isCurrentPeriod(timeRange: string): boolean {
    const currentPeriods = ['today', 'this-week', 'this-month', 'this-quarter', 'this-year', 'last-7-days', 'last-30-days', 'last-90-days']
    return currentPeriods.includes(timeRange)
  }

  async getVolumeAnalysis(filters: AnalyticsFilters): Promise<ApiResponse<VolumeAnalysisPoint[]>> {
    try {
      console.log('📊 AnalyticsService: Fetching volume analysis', filters)
      
      const params = new URLSearchParams()
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.groupBy) params.append('groupBy', filters.groupBy)
      if (filters.productCodes?.length) params.append('productCodes', filters.productCodes.join(','))
      if (filters.companies?.length) params.append('companies', filters.companies.join(','))
      if (filters.grades?.length) params.append('grades', filters.grades.join(','))
      if (filters.specificGrades?.length) params.append('specificGrades', filters.specificGrades.join(','))
      
      const response = await apiService.get<VolumeAnalysisPoint[]>(`${this.endpoint}/volume-analysis?${params}`)
      
      console.log('✅ AnalyticsService: Volume analysis fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch volume analysis', error)
      throw error
    }
  }

  async getTopCustomers(filters: AnalyticsFilters): Promise<ApiResponse<TopCustomer[]>> {
    try {
      console.log('📊 AnalyticsService: Fetching top customers', filters)
      
      const params = new URLSearchParams()
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const response = await apiService.get<TopCustomer[]>(`${this.endpoint}/top-customers?${params}`)
      
      console.log('✅ AnalyticsService: Top customers fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch top customers', error)
      throw error
    }
  }

  async getTopProducts(filters: AnalyticsFilters): Promise<ApiResponse<TopProduct[]>> {
    try {
      console.log('📊 AnalyticsService: Fetching top products', filters)
      
      const params = new URLSearchParams()
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      
      const response = await apiService.get<TopProduct[]>(`${this.endpoint}/top-products?${params}`)
      
      console.log('✅ AnalyticsService: Top products fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch top products', error)
      throw error
    }
  }

  async getSummaryStats(filters: AnalyticsFilters): Promise<ApiResponse<SummaryStats>> {
    try {
      console.log('📊 AnalyticsService: Fetching summary stats', filters)
      
      const params = new URLSearchParams()
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      
      const response = await apiService.get<SummaryStats>(`${this.endpoint}/summary?${params}`)
      
      console.log('✅ AnalyticsService: Summary stats fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch summary stats', error)
      throw error
    }
  }

  async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    try {
      console.log('📊 AnalyticsService: Fetching filter options')
      
      const response = await apiService.get<FilterOptions>(`${this.endpoint}/filter-options`)
      
      console.log('✅ AnalyticsService: Filter options fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch filter options', error)
      throw error
    }
  }

  async refreshCache(pattern?: string): Promise<ApiResponse<{ clearedCount: number }>> {
    try {
      console.log('🧹 AnalyticsService: Refreshing cache', pattern ? `(pattern: ${pattern})` : '(all)')
      
      const response = await apiService.post<{ clearedCount: number }>(`${this.endpoint}/cache/refresh`, {
        pattern
      })
      
      console.log('✅ AnalyticsService: Cache refreshed successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to refresh cache', error)
      throw error
    }
  }

  async getCacheStatus(): Promise<ApiResponse<{ totalEntries: number, entries: any[] }>> {
    try {
      console.log('📋 AnalyticsService: Fetching cache status')
      
      const response = await apiService.get<{ totalEntries: number, entries: any[] }>(`${this.endpoint}/cache/status`)
      
      console.log('✅ AnalyticsService: Cache status fetched successfully')
      return response
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch cache status', error)
      throw error
    }
  }

  async getKpiMetricsWithAutoRefresh(filters: AnalyticsFilters): Promise<ApiResponse<KpiResponse>> {
    const isCurrentPeriod = this.isCurrentPeriod(filters.timeRange || '')
    
    if (isCurrentPeriod) {
      // Force refresh for current periods to ensure fresh data
      return this.getKpiMetrics(filters, { forceRefresh: true })
    } else {
      // Use cache for historical periods
      return this.getKpiMetrics(filters)
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()