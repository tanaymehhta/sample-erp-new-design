// Analytics Utilities - Pure transformation functions
// Following CLAUDE.md: Single responsibility, no external dependencies

import { Deal, Customer, CustomerMetrics, MonthlyData, ProductSalesData, SummaryStats, TimeRange, TrendData, AlertData } from '../types'
import { parseDDMMYYYY, isDateInRange, getCurrentMonthRange } from './dateUtils'

export function aggregateCustomerSales(deals: Deal[], customers: Customer[], timeRange: TimeRange): CustomerMetrics[] {
  const customerMap = new Map(customers.map(c => [c.id, c]))
  const customerDeals = groupDealsByCustomer(deals)
  
  return Array.from(customerDeals.entries()).map(([customerId, customerDeals]) => {
    const customer = customerMap.get(customerId)
    if (!customer) return null
    
    const metrics = calculateCustomerMetrics(customerDeals, customer.name, timeRange)
    return metrics
  }).filter(Boolean) as CustomerMetrics[]
}

function groupDealsByCustomer(deals: Deal[]): Map<string, Deal[]> {
  return deals.reduce((acc, deal) => {
    if (!acc.has(deal.customerId)) {
      acc.set(deal.customerId, [])
    }
    acc.get(deal.customerId)!.push(deal)
    return acc
  }, new Map<string, Deal[]>())
}

function calculateCustomerMetrics(deals: Deal[], customerName: string, _timeRange: TimeRange): CustomerMetrics {
  const currentPeriodSales = deals.reduce((sum, deal) => sum + deal.totalAmount, 0)
  const totalQuantity = deals.reduce((sum, deal) => sum + deal.quantity, 0)
  const dealCount = deals.length
  const averageDealSize = dealCount > 0 ? currentPeriodSales / dealCount : 0
  
  // Get last deal date
  const sortedDeals = deals.sort((a, b) => new Date(b.dealDate).getTime() - new Date(a.dealDate).getTime())
  const lastDealDate = sortedDeals.length > 0 ? sortedDeals[0].dealDate : null
  const daysSinceLastDeal = lastDealDate ? 
    Math.floor((new Date().getTime() - new Date(lastDealDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
  
  // Calculate target (simplified - could be made configurable)
  const targetSales = currentPeriodSales * 0.8 // Assume 80% of current as baseline target
  const variance = currentPeriodSales - targetSales
  const variancePercentage = targetSales > 0 ? (variance / targetSales) * 100 : 0
  
  // Determine trend (simplified)
  const trend = variancePercentage > 10 ? 'up' : variancePercentage < -10 ? 'down' : 'stable'
  const growthRate = variancePercentage
  
  // Calculate monthly breakdown
  const monthlyBreakdown = calculateMonthlyBreakdown(deals)
  
  // Calculate product mix
  const productMix = calculateProductMix(deals)
  
  // Calculate risk score (0-100, higher = more risk)
  const riskScore = calculateRiskScore(daysSinceLastDeal, variancePercentage, dealCount)
  
  // Generate insights
  const insights = generateCustomerInsights(customerName, daysSinceLastDeal, variancePercentage, dealCount)
  
  return {
    customerId: deals[0]?.customerId || '',
    customerName,
    currentPeriodSales,
    quantity: totalQuantity,
    targetSales,
    variance,
    variancePercentage,
    trend,
    growthRate,
    dealCount,
    averageDealSize,
    lastDealDate,
    daysSinceLastDeal,
    monthlyBreakdown,
    productMix,
    riskScore,
    insights
  }
}

function calculateMonthlyBreakdown(deals: Deal[]): MonthlyData[] {
  const monthlyMap = new Map<string, { sales: number, count: number, quantity: number }>()
  
  deals.forEach(deal => {
    try {
      const date = parseDDMMYYYY(deal.dealDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { sales: 0, count: 0, quantity: 0 })
      }
      
      const monthData = monthlyMap.get(monthKey)!
      monthData.sales += deal.totalAmount
      monthData.count += 1
      monthData.quantity += deal.quantity
    } catch (error) {
      console.error('calculateMonthlyBreakdown: Error parsing deal date', deal.dealDate, error)
    }
  })
  
  console.log('Monthly breakdown data:', monthlyMap)
  
  return Array.from(monthlyMap.entries()).map(([monthKey, data]) => {
    const [year, month] = monthKey.split('-')
    return {
      month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' }),
      year: parseInt(year),
      sales: data.sales,
      quantity: data.quantity,
      dealCount: data.count,
      averageDealSize: data.sales / data.count
    }
  }).sort((a, b) => a.year - b.year || parseInt(a.month) - parseInt(b.month))
}

function calculateProductMix(deals: Deal[]): ProductSalesData[] {
  const productMap = new Map<string, { quantity: number, value: number, name: string }>()
  const totalValue = deals.reduce((sum, deal) => sum + deal.totalAmount, 0)
  
  deals.forEach(deal => {
    if (!productMap.has(deal.productId)) {
      productMap.set(deal.productId, { quantity: 0, value: 0, name: deal.productName })
    }
    
    const productData = productMap.get(deal.productId)!
    productData.quantity += deal.quantity
    productData.value += deal.totalAmount
  })
  
  return Array.from(productMap.entries()).map(([productId, data]) => ({
    productId,
    productName: data.name,
    quantity: data.quantity,
    totalValue: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
  })).sort((a, b) => b.totalValue - a.totalValue)
}

function calculateRiskScore(daysSinceLastDeal: number, variancePercentage: number, dealCount: number): number {
  let score = 0
  
  // Days since last deal (0-40 points)
  if (daysSinceLastDeal > 60) score += 40
  else if (daysSinceLastDeal > 30) score += 25
  else if (daysSinceLastDeal > 14) score += 10
  
  // Performance variance (0-40 points)
  if (variancePercentage < -50) score += 40
  else if (variancePercentage < -25) score += 25
  else if (variancePercentage < -10) score += 10
  
  // Deal frequency (0-20 points)
  if (dealCount === 0) score += 20
  else if (dealCount < 3) score += 10
  
  return Math.min(score, 100)
}

function generateCustomerInsights(customerName: string, daysSinceLastDeal: number, variancePercentage: number, dealCount: number): string[] {
  const insights: string[] = []
  
  if (daysSinceLastDeal > 30) {
    insights.push(`${customerName} hasn't ordered in ${daysSinceLastDeal} days - follow up recommended`)
  }
  
  if (variancePercentage > 25) {
    insights.push(`${customerName} is performing exceptionally well with +${variancePercentage.toFixed(1)}% growth`)
  } else if (variancePercentage < -25) {
    insights.push(`${customerName} is significantly below target (${variancePercentage.toFixed(1)}%) - needs attention`)
  }
  
  if (dealCount < 2) {
    insights.push(`${customerName} has low order frequency - consider engagement strategy`)
  }
  
  return insights
}

export function calculateSummaryStats(customerMetrics: CustomerMetrics[], deals: Deal[]): SummaryStats {
  const totalSales = customerMetrics.reduce((sum, c) => sum + c.currentPeriodSales, 0)
  const totalTargetSales = customerMetrics.reduce((sum, c) => sum + c.targetSales, 0)
  const activeCustomers = customerMetrics.filter(c => c.dealCount > 0).length
  const newCustomers = customerMetrics.filter(c => c.daysSinceLastDeal <= 30).length
  const averageSalesPerCustomer = activeCustomers > 0 ? totalSales / activeCustomers : 0
  const totalVolume = deals.reduce((sum, deal) => sum + deal.quantity, 0)
  const averageVolume = deals.length > 0 ? totalVolume / deals.length : 0
  const periodGrowthRate = totalTargetSales > 0 ? ((totalSales - totalTargetSales) / totalTargetSales) * 100 : 0
  const customersExceedingTarget = customerMetrics.filter(c => c.variancePercentage > 10).length
  const customersAtRisk = customerMetrics.filter(c => c.riskScore > 60).length
  
  return {
    totalSales,
    totalTargetSales,
    activeCustomers,
    newCustomers,
    averageSalesPerCustomer,
    totalVolume,
    averageVolume,
    periodGrowthRate,
    customersExceedingTarget,
    customersAtRisk
  }
}

export function generateTrendData(deals: Deal[], _timeRange: TimeRange): TrendData[] {
  const monthlyTrends = new Map<string, { sales: number, customers: Set<string>, deals: number }>()
  
  deals.forEach(deal => {
    try {
      const date = parseDDMMYYYY(deal.dealDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyTrends.has(monthKey)) {
        monthlyTrends.set(monthKey, { sales: 0, customers: new Set(), deals: 0 })
      }
      
      const monthData = monthlyTrends.get(monthKey)!
      monthData.sales += deal.totalAmount
      monthData.customers.add(deal.customerId)
      monthData.deals += 1
    } catch (error) {
      console.error('generateTrendData: Error parsing deal date', deal.dealDate, error)
    }
  })
  
  return Array.from(monthlyTrends.entries()).map(([period, data]) => ({
    period,
    sales: data.sales,
    customers: data.customers.size,
    deals: data.deals
  })).sort((a, b) => a.period.localeCompare(b.period))
}

export function generateAlerts(customerMetrics: CustomerMetrics[]): AlertData[] {
  const alerts: AlertData[] = []
  
  customerMetrics.forEach(customer => {
    // Risk alerts
    if (customer.riskScore > 70) {
      alerts.push({
        id: `risk-${customer.customerId}`,
        type: 'risk',
        customerId: customer.customerId,
        customerName: customer.customerName,
        message: `High risk customer - ${customer.daysSinceLastDeal} days since last order`,
        severity: 'high',
        actionRequired: true
      })
    }
    
    // Opportunity alerts
    if (customer.variancePercentage > 50) {
      alerts.push({
        id: `opportunity-${customer.customerId}`,
        type: 'opportunity',
        customerId: customer.customerId,
        customerName: customer.customerName,
        message: `Strong performer - consider upselling opportunities`,
        severity: 'medium',
        actionRequired: false
      })
    }
    
    // Milestone alerts
    if (customer.currentPeriodSales > 100000) {
      alerts.push({
        id: `milestone-${customer.customerId}`,
        type: 'milestone',
        customerId: customer.customerId,
        customerName: customer.customerName,
        message: `Achieved ₹${(customer.currentPeriodSales / 100000).toFixed(1)}L milestone`,
        severity: 'low',
        actionRequired: false
      })
    }
  })
  
  return alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

export function filterDealsByTimeRange(deals: Deal[], timeRange: TimeRange): Deal[] {
  console.log('filterDealsByTimeRange: Filtering', deals.length, 'deals')
  console.log('filterDealsByTimeRange: Time range:', timeRange.startDate, 'to', timeRange.endDate)
  
  const filtered = deals.filter(deal => {
    try {
      const inRange = isDateInRange(deal.dealDate, timeRange.startDate, timeRange.endDate)
      console.log('filterDealsByTimeRange: Deal', deal.id, 'date', deal.dealDate, 'in range:', inRange)
      return inRange
    } catch (error) {
      console.error('filterDealsByTimeRange: Error parsing deal date', deal.dealDate, error)
      return false
    }
  })
  
  console.log('filterDealsByTimeRange: Filtered to', filtered.length, 'deals')
  return filtered
}

export function getDefaultTimeRange(): TimeRange {
  const { startDate, endDate } = getCurrentMonthRange()
  
  return {
    startDate,
    endDate,
    preset: 'thisMonth'
  }
}