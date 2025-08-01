// Analytics Feature - Data Contracts and Interfaces
// Following CLAUDE.md: Define interfaces first for loose coupling

export interface TimeRange {
  startDate: Date
  endDate: Date
  preset: 'thisMonth' | 'lastMonth' | 'quarter' | 'year' | 'custom'
  compareWith?: 'previousPeriod' | 'sameLastYear' | null
}

export interface Deal {
  id: string
  customerId: string
  customerName: string
  productId: string
  productName: string  
  totalAmount: number
  quantity: number
  rate: number
  dealDate: string
  status: string
}

export interface Customer {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
}

export interface CustomerMetrics {
  customerId: string
  customerName: string
  currentPeriodSales: number
  quantity: number
  targetSales: number
  variance: number
  variancePercentage: number
  trend: 'up' | 'down' | 'stable'
  growthRate: number
  dealCount: number
  averageDealSize: number
  lastDealDate: string | null
  daysSinceLastDeal: number
  monthlyBreakdown: MonthlyData[]
  productMix: ProductSalesData[]
  riskScore: number
  insights: string[]
}

export interface MonthlyData {
  month: string
  year: number
  sales: number
  quantity: number
  dealCount: number
  averageDealSize: number
}

export interface ProductSalesData {
  productId: string
  productName: string
  quantity: number
  totalValue: number
  percentage: number
}

export interface SummaryStats {
  totalSales: number
  totalTargetSales: number
  activeCustomers: number
  newCustomers: number
  averageSalesPerCustomer: number
  totalVolume: number
  averageVolume: number
  periodGrowthRate: number
  customersExceedingTarget: number
  customersAtRisk: number
}

export interface TrendData {
  period: string
  sales: number
  customers: number
  deals: number
}

export interface AlertData {
  id: string
  type: 'risk' | 'opportunity' | 'milestone'
  customerId: string
  customerName: string
  message: string
  severity: 'low' | 'medium' | 'high'
  actionRequired: boolean
}

export interface AnalyticsData {
  customerMetrics: CustomerMetrics[]
  summaryStats: SummaryStats
  trends: TrendData[]
  alerts: AlertData[]
  timeRange: TimeRange
}

// Interface for dependency injection - no direct imports from other features
export interface DealDataProvider {
  getDeals(timeRange?: TimeRange): Promise<Deal[]>
  getCustomers(): Promise<Customer[]>
}

// Configuration interface
export interface AnalyticsConfig {
  defaultTimeRange: TimeRange
  targetGrowthRate: number
  riskThresholdDays: number
  topPerformersLimit: number
}