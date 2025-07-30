// Analytics Data Service - Orchestrates data aggregation with dependency injection
// Following CLAUDE.md: Loose coupling via interfaces, single responsibility

import { 
  DealDataProvider, 
  AnalyticsData, 
  TimeRange, 
  AnalyticsConfig,
  CustomerMetrics,
  SummaryStats,
  TrendData,
  AlertData
} from '../types'

import { 
  aggregateCustomerSales,
  calculateSummaryStats,
  generateTrendData,
  generateAlerts,
  filterDealsByTimeRange,
  getDefaultTimeRange
} from '../utils/dataTransforms'

export class AnalyticsDataService {
  private config: AnalyticsConfig

  constructor(
    private dataProvider: DealDataProvider,
    config?: Partial<AnalyticsConfig>
  ) {
    this.config = {
      defaultTimeRange: getDefaultTimeRange(),
      targetGrowthRate: 15,
      riskThresholdDays: 30,
      topPerformersLimit: 5,
      ...config
    }
  }

  async getAnalyticsData(timeRange?: TimeRange): Promise<AnalyticsData> {
    const effectiveTimeRange = timeRange || this.config.defaultTimeRange
    
    try {
      // Fetch raw data through injected provider
      const [allDeals, customers] = await Promise.all([
        this.dataProvider.getDeals(),
        this.dataProvider.getCustomers()
      ])

      // Filter deals by time range
      const filteredDeals = filterDealsByTimeRange(allDeals, effectiveTimeRange)

      // Transform data using pure functions
      const customerMetrics = aggregateCustomerSales(filteredDeals, customers, effectiveTimeRange)
      const summaryStats = calculateSummaryStats(customerMetrics, filteredDeals)
      const trends = generateTrendData(filteredDeals, effectiveTimeRange)
      const alerts = generateAlerts(customerMetrics)

      return {
        customerMetrics,
        summaryStats,
        trends,
        alerts,
        timeRange: effectiveTimeRange
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      throw new Error('Failed to load analytics data')
    }
  }

  async getCustomerDetails(customerId: string, timeRange?: TimeRange): Promise<CustomerMetrics | null> {
    const analyticsData = await this.getAnalyticsData(timeRange)
    return analyticsData.customerMetrics.find(c => c.customerId === customerId) || null
  }

  async getTopPerformers(timeRange?: TimeRange): Promise<CustomerMetrics[]> {
    const analyticsData = await this.getAnalyticsData(timeRange)
    return analyticsData.customerMetrics
      .sort((a, b) => b.currentPeriodSales - a.currentPeriodSales)
      .slice(0, this.config.topPerformersLimit)
  }

  async getCustomersAtRisk(timeRange?: TimeRange): Promise<CustomerMetrics[]> {
    const analyticsData = await this.getAnalyticsData(timeRange)
    return analyticsData.customerMetrics
      .filter(c => c.riskScore > 60)
      .sort((a, b) => b.riskScore - a.riskScore)
  }

  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config }
  }
}