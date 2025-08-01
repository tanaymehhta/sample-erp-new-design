import { useState, useMemo } from 'react'
import { BusinessFilter, TimeRange, FilterInsights, Deal } from '../types'

// Helper function to get date ranges
const getDateRange = (timeRange: TimeRange): { from: string; to: string } => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (timeRange) {
    case 'all-time':
      return {
        from: '01-01-1900',
        to: '31-12-2099'
      }
    
    case 'today':
      return {
        from: formatDate(today),
        to: formatDate(today)
      }
    
    case 'this-week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return {
        from: formatDate(weekStart),
        to: formatDate(weekEnd)
      }
    
    case 'this-month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return {
        from: formatDate(monthStart),
        to: formatDate(monthEnd)
      }
    
    case 'last-month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      return {
        from: formatDate(lastMonthStart),
        to: formatDate(lastMonthEnd)
      }
    
    case 'this-quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1)
      const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      return {
        from: formatDate(quarterStart),
        to: formatDate(quarterEnd)
      }
    
    case 'last-quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1
      const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const lastQuarterMonth = lastQuarter < 0 ? 3 : lastQuarter * 3
      const lastQuarterStart = new Date(lastQuarterYear, lastQuarterMonth, 1)
      const lastQuarterEnd = new Date(lastQuarterYear, lastQuarterMonth + 3, 0)
      return {
        from: formatDate(lastQuarterStart),
        to: formatDate(lastQuarterEnd)
      }
    
    case 'this-year':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear(), 11, 31)
      return {
        from: formatDate(yearStart),
        to: formatDate(yearEnd)
      }
    
    default:
      return {
        from: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
      }
  }
}

// Format date as DD-MM-YYYY
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Convert date string DD-MM-YYYY to Date object for comparison
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getTimeFrameDescription = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case 'all-time': return 'all time'
    case 'today': return 'for today'
    case 'this-week': return 'this week'
    case 'this-month': return 'this month'
    case 'last-month': return 'last month'
    case 'this-quarter': return 'this quarter'
    case 'last-quarter': return 'last quarter'
    case 'this-year': return 'this year'
    case 'custom': return 'custom range'
    default: return 'all time'
  }
}

interface UseBusinessFiltersReturn {
  filters: BusinessFilter
  setFilters: (filters: BusinessFilter | ((prev: BusinessFilter) => BusinessFilter)) => void
  insights: FilterInsights
  filteredDeals: Deal[]
  availableCustomers: string[]
  availableProducts: string[]
  availableSuppliers: string[]
  availableCompanies: string[]
  availableGrades: string[]
  availableSpecificGrades: string[]
}

export function useBusinessFilters(allDeals: Deal[]): UseBusinessFiltersReturn {
  const [filters, setFilters] = useState<BusinessFilter>({
    timeRange: 'all-time',
    status: [],
    searchTerm: '',
    products: [],
    companies: [],
    grades: [],
    specificGrades: [],
    valueRange: null,
    customers: [],
    suppliers: [],
    deliveryMethod: [],
    dealSource: [],
    warehouse: [],
    quantityRange: null,
    dateFrom: undefined,
    dateTo: undefined,
    quickFilter: undefined,
    deliveryTerms: undefined
  })

  // Extract unique values for filter options
  const availableCustomers = useMemo(() => {
    const customers = [...new Set(allDeals.map(deal => deal.saleParty))].filter(Boolean)
    return customers.sort((a, b) => {
      // Sort by frequency (most common customers first)
      const aCount = allDeals.filter(deal => deal.saleParty === a).length
      const bCount = allDeals.filter(deal => deal.saleParty === b).length
      return bCount - aCount
    })
  }, [allDeals])

  const availableProducts = useMemo(() => {
    const products = [...new Set(allDeals.map(deal => deal.productCode))].filter(Boolean)
    return products.sort()
  }, [allDeals])

  const availableSuppliers = useMemo(() => {
    const suppliers = [...new Set(allDeals.map(deal => deal.purchaseParty))].filter(Boolean)
    return suppliers.sort()
  }, [allDeals])

  const availableCompanies = useMemo(() => {
    const companies = [...new Set(allDeals.map(deal => deal.company))].filter(Boolean)
    return companies.sort()
  }, [allDeals])

  const availableGrades = useMemo(() => {
    const grades = [...new Set(allDeals.map(deal => deal.grade))].filter(Boolean)
    return grades.sort()
  }, [allDeals])

  const availableSpecificGrades = useMemo(() => {
    const specificGrades = [...new Set(allDeals.map(deal => deal.specificGrade))].filter(Boolean)
    return specificGrades.sort()
  }, [allDeals])

  // Filter deals based on current filters
  const filteredDeals = useMemo(() => {
    let filtered = [...allDeals]

    // Time range filter - use dateFrom/dateTo if provided, otherwise use timeRange
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom) {
        const fromDate = parseDate(filters.dateFrom)
        filtered = filtered.filter(deal => {
          const dealDate = parseDate(deal.date)
          return dealDate >= fromDate
        })
      }
      if (filters.dateTo) {
        const toDate = parseDate(filters.dateTo)
        filtered = filtered.filter(deal => {
          const dealDate = parseDate(deal.date)
          return dealDate <= toDate
        })
      }
    } else if (filters.timeRange) {
      const { from, to } = getDateRange(filters.timeRange)
      const fromDate = parseDate(from)
      const toDate = parseDate(to)
      
      filtered = filtered.filter(deal => {
        const dealDate = parseDate(deal.date)
        return dealDate >= fromDate && dealDate <= toDate
      })
    }

    // Customer filter
    if (filters.customers.length > 0) {
      filtered = filtered.filter(deal => 
        filters.customers.includes(deal.saleParty)
      )
    }

    // Product filter
    if (filters.products.length > 0) {
      filtered = filtered.filter(deal => 
        filters.products.includes(deal.productCode)
      )
    }

    // Company filter
    if (filters.companies.length > 0) {
      filtered = filtered.filter(deal => 
        filters.companies.includes(deal.company)
      )
    }

    // Grade filter
    if (filters.grades.length > 0) {
      filtered = filtered.filter(deal => 
        filters.grades.includes(deal.grade)
      )
    }

    // Specific Grade filter
    if (filters.specificGrades.length > 0) {
      filtered = filtered.filter(deal => 
        filters.specificGrades.includes(deal.specificGrade)
      )
    }

    // Supplier filter
    if (filters.suppliers.length > 0) {
      filtered = filtered.filter(deal => 
        filters.suppliers.includes(deal.purchaseParty)
      )
    }

    // Delivery method filter (use individual deliveryTerms or array deliveryMethod)
    if (filters.deliveryTerms) {
      filtered = filtered.filter(deal => 
        deal.deliveryTerms === filters.deliveryTerms
      )
    } else if (filters.deliveryMethod.length > 0) {
      filtered = filtered.filter(deal => 
        filters.deliveryMethod.includes(deal.deliveryTerms)
      )
    }

    // Deal source filter
    if (filters.dealSource.length > 0) {
      filtered = filtered.filter(deal => 
        filters.dealSource.includes(deal.saleSource)
      )
    }

    // Warehouse filter
    if (filters.warehouse.length > 0) {
      filtered = filtered.filter(deal => 
        deal.warehouse && filters.warehouse.includes(deal.warehouse)
      )
    }

    // Value range filter
    if (filters.valueRange) {
      const [min, max] = filters.valueRange
      filtered = filtered.filter(deal => {
        const dealValue = deal.quantitySold * deal.saleRate
        return dealValue >= min && dealValue <= max
      })
    }

    // Quantity range filter
    if (filters.quantityRange) {
      const [min, max] = filters.quantityRange
      filtered = filtered.filter(deal => 
        deal.quantitySold >= min && deal.quantitySold <= max
      )
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(deal => 
        deal.saleParty.toLowerCase().includes(searchLower) ||
        deal.productCode.toLowerCase().includes(searchLower) ||
        deal.purchaseParty.toLowerCase().includes(searchLower) ||
        deal.company.toLowerCase().includes(searchLower) ||
        deal.grade.toLowerCase().includes(searchLower) ||
        deal.specificGrade.toLowerCase().includes(searchLower) ||
        deal.id.toString().includes(searchLower) ||
        (deal.saleComments && deal.saleComments.toLowerCase().includes(searchLower)) ||
        (deal.purchaseComments && deal.purchaseComments.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [allDeals, filters])

  // Calculate insights
  const insights = useMemo((): FilterInsights => {
    const totalDeals = filteredDeals.length
    const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.quantitySold * deal.saleRate), 0)
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0

    // Find top customer
    const customerCounts: Record<string, number> = {}
    filteredDeals.forEach(deal => {
      customerCounts[deal.saleParty] = (customerCounts[deal.saleParty] || 0) + 1
    })
    
    const topCustomer = Object.entries(customerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null

    return {
      totalDeals,
      totalValue,
      topCustomer,
      avgDealSize,
      timeFrameDescription: getTimeFrameDescription(filters.timeRange)
    }
  }, [filteredDeals, filters.timeRange])

  return {
    filters,
    setFilters,
    insights,
    filteredDeals,
    availableCustomers,
    availableProducts,
    availableSuppliers,
    availableCompanies,
    availableGrades,
    availableSpecificGrades
  }
}