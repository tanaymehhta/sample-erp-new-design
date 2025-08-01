import express from 'express'
import { PrismaClient, Prisma } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Simple cache for analytics data
const analyticsCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes for historical data
const CURRENT_PERIOD_CACHE_DURATION = 30 * 1000 // 30 seconds for current periods

function isCacheValid(cacheEntry: { data: any, timestamp: number }, isCurrentPeriod: boolean): boolean {
  const now = Date.now()
  const duration = isCurrentPeriod ? CURRENT_PERIOD_CACHE_DURATION : CACHE_DURATION
  return (now - cacheEntry.timestamp) < duration
}

function isCurrentPeriod(timeRange: string): boolean {
  const currentPeriods = ['today', 'this-week', 'this-month', 'this-quarter', 'this-year', 'last-7-days', 'last-30-days', 'last-90-days']
  return currentPeriods.includes(timeRange)
}

// Date utility functions for string date format "DD-MM-YYYY"
function parseDbDate(dateString: string): Date {
  const [day, month, year] = dateString.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

function formatDateToDb(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function getDateRange(timeRange: string): { startDate: string, endDate: string } {
  const now = new Date()
  let start: Date, end: Date

  switch (timeRange) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'yesterday':
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      break
    case 'this-week':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Full week: Sunday to Saturday
      end = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate())
      break
    case 'last-week':
      const lastSunday = new Date(now)
      lastSunday.setDate(now.getDate() - now.getDay() - 1)
      const lastWeekStart = new Date(lastSunday)
      lastWeekStart.setDate(lastSunday.getDate() - 6)
      start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate())
      end = new Date(lastSunday.getFullYear(), lastSunday.getMonth(), lastSunday.getDate())
      break
    case 'this-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month
      break
    case 'last-month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'last-7-days':
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Keep as "to date" for rolling periods
      break
    case 'last-30-days':
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'last-90-days':
      start = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000)
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'this-quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      start = new Date(now.getFullYear(), quarterStart, 1)
      end = new Date(now.getFullYear(), quarterStart + 3, 0) // Last day of current quarter
      break
    case 'last-quarter':
      const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3
      const lastQuarterYear = lastQuarterStart < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const adjustedQuarterStart = lastQuarterStart < 0 ? 9 : lastQuarterStart
      start = new Date(lastQuarterYear, adjustedQuarterStart, 1)
      end = new Date(lastQuarterYear, adjustedQuarterStart + 3, 0)
      break
    case 'this-year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31) // Full year: Jan 1 to Dec 31
      break
    case 'last-year':
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31)
      break
    case 'last-3-years':
      start = new Date(now.getFullYear() - 3, 0, 1)
      end = new Date(now.getFullYear(), 11, 31) // Include full current year
      break
    case 'last-5-years':
      start = new Date(now.getFullYear() - 5, 0, 1)
      end = new Date(now.getFullYear(), 11, 31) // Include full current year
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Default to full current month
  }

  return {
    startDate: formatDateToDb(start),
    endDate: formatDateToDb(end)
  }
}

// KPI Metrics Endpoint
router.get('/kpi', async (req, res) => {
  try {
    const { timeRange = 'this-month', startDate, endDate, compareWith, forceRefresh } = req.query
    
    // Create cache key
    const cacheKey = `kpi-${timeRange}-${startDate}-${endDate}-${compareWith}`
    const currentPeriod = isCurrentPeriod(timeRange as string)
    
    // Check cache unless force refresh is requested
    if (!forceRefresh) {
      const cached = analyticsCache.get(cacheKey)
      if (cached && isCacheValid(cached, currentPeriod)) {
        console.log(`📋 Analytics KPI: Serving from cache (${currentPeriod ? 'current' : 'historical'} period)`)
        return res.json({ success: true, data: cached.data, cached: true })
      }
    }
    
    let dateFilter: { startDate: string, endDate: string }
    
    if (startDate && endDate) {
      dateFilter = { startDate: startDate as string, endDate: endDate as string }
    } else {
      dateFilter = getDateRange(timeRange as string)
    }
    
    console.log(`🔄 Analytics KPI: Fetching fresh data for ${timeRange} (${currentPeriod ? 'current' : 'historical'} period)`)

    // Get current period metrics using raw SQL for better performance
    // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
    const query = `
      SELECT 
        CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
        CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
        COUNT(DISTINCT saleParty) as activeCustomers,
        CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgVolumePerDeal,
        COUNT(*) as totalDeals,
        CASE 
          WHEN SUM(CAST(quantitySold AS REAL)) > 0 
          THEN CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) / SUM(CAST(quantitySold AS REAL)) AS REAL)
          ELSE 0 
        END as revenuePerMT
      FROM deals 
      WHERE (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= 
            (substr('${dateFilter.startDate}', 7, 4) || '-' || substr('${dateFilter.startDate}', 4, 2) || '-' || substr('${dateFilter.startDate}', 1, 2))
        AND (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= 
            (substr('${dateFilter.endDate}', 7, 4) || '-' || substr('${dateFilter.endDate}', 4, 2) || '-' || substr('${dateFilter.endDate}', 1, 2))
    `
    
    console.log('📊 KPI Query:', query)
    const currentMetrics = await prisma.$queryRawUnsafe(query)

    const metrics = Array.isArray(currentMetrics) ? currentMetrics[0] : currentMetrics

    // Get comparison data if requested
    let comparisonMetrics = null
    let changes = null

    if (compareWith) {
      let comparisonDateFilter: { startDate: string, endDate: string }
      
      if (compareWith === 'previous-period') {
        // Calculate previous period of same length
        const startDateObj = parseDbDate(dateFilter.startDate)
        const endDateObj = parseDbDate(dateFilter.endDate)
        const periodLength = endDateObj.getTime() - startDateObj.getTime()
        
        const prevEndDate = new Date(startDateObj.getTime() - 24 * 60 * 60 * 1000)
        const prevStartDate = new Date(prevEndDate.getTime() - periodLength)
        
        comparisonDateFilter = {
          startDate: formatDateToDb(prevStartDate),
          endDate: formatDateToDb(prevEndDate)
        }
      } else if (compareWith === 'same-period-last-year') {
        const startDateObj = parseDbDate(dateFilter.startDate)
        const endDateObj = parseDbDate(dateFilter.endDate)
        
        comparisonDateFilter = {
          startDate: formatDateToDb(new Date(startDateObj.getFullYear() - 1, startDateObj.getMonth(), startDateObj.getDate())),
          endDate: formatDateToDb(new Date(endDateObj.getFullYear() - 1, endDateObj.getMonth(), endDateObj.getDate()))
        }
      }

      if (comparisonDateFilter) {
        const comparisonQuery = `
          SELECT 
            CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
            CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
            COUNT(DISTINCT saleParty) as activeCustomers,
            CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgVolumePerDeal
          FROM deals 
          WHERE (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= 
                (substr('${comparisonDateFilter.startDate}', 7, 4) || '-' || substr('${comparisonDateFilter.startDate}', 4, 2) || '-' || substr('${comparisonDateFilter.startDate}', 1, 2))
            AND (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= 
                (substr('${comparisonDateFilter.endDate}', 7, 4) || '-' || substr('${comparisonDateFilter.endDate}', 4, 2) || '-' || substr('${comparisonDateFilter.endDate}', 1, 2))
        `
        
        const comparisonData = await prisma.$queryRawUnsafe(comparisonQuery)

        comparisonMetrics = Array.isArray(comparisonData) ? comparisonData[0] : comparisonData

        // Calculate percentage changes
        if (comparisonMetrics && comparisonMetrics.totalRevenue > 0) {
          changes = {
            revenueChange: ((Number(metrics.totalRevenue) - Number(comparisonMetrics.totalRevenue)) / Number(comparisonMetrics.totalRevenue) * 100).toFixed(1),
            volumeChange: ((Number(metrics.totalVolume) - Number(comparisonMetrics.totalVolume)) / Number(comparisonMetrics.totalVolume) * 100).toFixed(1),
            customerChange: ((Number(metrics.activeCustomers) - Number(comparisonMetrics.activeCustomers)) / Number(comparisonMetrics.activeCustomers) * 100).toFixed(1),
            avgVolumeChange: ((Number(metrics.avgVolumePerDeal) - Number(comparisonMetrics.avgVolumePerDeal)) / Number(comparisonMetrics.avgVolumePerDeal) * 100).toFixed(1)
          }
        }
      }
    }

    const result = {
      current: {
        totalRevenue: Number(metrics.totalRevenue) || 0,
        totalVolume: Number(metrics.totalVolume) || 0,
        activeCustomers: Number(metrics.activeCustomers) || 0,
        avgVolumePerDeal: Number(metrics.avgVolumePerDeal) || 0,
        totalDeals: Number(metrics.totalDeals) || 0,
        revenuePerMT: Number(metrics.revenuePerMT) || 0
      },
      comparison: comparisonMetrics ? {
        totalRevenue: Number(comparisonMetrics.totalRevenue) || 0,
        totalVolume: Number(comparisonMetrics.totalVolume) || 0,
        activeCustomers: Number(comparisonMetrics.activeCustomers) || 0,
        avgVolumePerDeal: Number(comparisonMetrics.avgVolumePerDeal) || 0
      } : null,
      changes
    }

    // Cache the result
    analyticsCache.set(cacheKey, { data: result, timestamp: Date.now() })
    console.log(`💾 Analytics KPI: Cached result for ${timeRange}`)

    res.json({ success: true, data: result, cached: false })
  } catch (error) {
    console.error('Analytics KPI Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch KPI metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Volume Analysis Endpoint - Your main feature
router.get('/volume-analysis', async (req, res) => {
  try {
    const {
      timeRange = 'this-month',
      groupBy = 'daily',
      productCodes,
      companies,
      grades,
      specificGrades,
      startDate,
      endDate
    } = req.query

    let dateFilter: { startDate: string, endDate: string }
    
    if (startDate && endDate) {
      dateFilter = { startDate: startDate as string, endDate: endDate as string }
    } else {
      dateFilter = getDateRange(timeRange as string)
    }

    // Build dynamic WHERE clause for filters with proper DD-MM-YYYY comparison
    let whereConditions = [
      `(substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= (substr('${dateFilter.startDate}', 7, 4) || '-' || substr('${dateFilter.startDate}', 4, 2) || '-' || substr('${dateFilter.startDate}', 1, 2))`,
      `(substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= (substr('${dateFilter.endDate}', 7, 4) || '-' || substr('${dateFilter.endDate}', 4, 2) || '-' || substr('${dateFilter.endDate}', 1, 2))`
    ]
    
    if (productCodes) {
      const codes = (productCodes as string).split(',').map(code => `'${code.trim()}'`).join(',')
      whereConditions.push(`productCode IN (${codes})`)
    }
    
    if (companies) {
      const companyList = (companies as string).split(',').map(company => `'${company.trim()}'`).join(',')
      whereConditions.push(`company IN (${companyList})`)
    }
    
    if (grades) {
      const gradeList = (grades as string).split(',').map(grade => `'${grade.trim()}'`).join(',')
      whereConditions.push(`grade IN (${gradeList})`)
    }
    
    if (specificGrades) {
      const sgList = (specificGrades as string).split(',').map(sg => `'${sg.trim()}'`).join(',')
      whereConditions.push(`specificGrade IN (${sgList})`)
    }

    const whereClause = whereConditions.join(' AND ')

    // Build dynamic GROUP BY clause
    let selectClause = ''
    let groupByClause = ''
    let orderByClause = ''

    switch (groupBy) {
      case 'daily':
        selectClause = `date as period, date`
        groupByClause = 'GROUP BY date'
        orderByClause = 'ORDER BY date'
        break
      case 'weekly':
        selectClause = `
          'Week ' || strftime('%W', substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) || 
          ' ' || substr(date, 7, 4) as period,
          strftime('%W', substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) as week_num,
          substr(date, 7, 4) as year
        `
        groupByClause = 'GROUP BY week_num, year'
        orderByClause = 'ORDER BY year, week_num'
        break
      case 'monthly':
        selectClause = `
          substr(date, 4, 2) || '-' || substr(date, 7, 4) as period,
          substr(date, 4, 2) as month,
          substr(date, 7, 4) as year
        `
        groupByClause = 'GROUP BY month, year'
        orderByClause = 'ORDER BY year, month'
        break
      case 'yearly':
        selectClause = `substr(date, 7, 4) as period, substr(date, 7, 4) as year`
        groupByClause = 'GROUP BY year'
        orderByClause = 'ORDER BY year'
        break
      default:
        selectClause = `date as period, date`
        groupByClause = 'GROUP BY date'
        orderByClause = 'ORDER BY date'
    }

    const query = `
      SELECT 
        ${selectClause},
        CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
        CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
        COUNT(*) as dealCount,
        CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgVolume,
        CAST(AVG(CAST(saleRate AS REAL)) AS REAL) as avgRate
      FROM deals 
      WHERE ${whereClause}
      ${groupByClause}
      ${orderByClause}
    `

    const volumeData = await prisma.$queryRawUnsafe(query)
    
    // Format data for frontend
    const formattedData = (volumeData as any[]).map(row => ({
      period: row.period,
      volume: Number(row.totalVolume) || 0,
      revenue: Number(row.totalRevenue) || 0,
      dealCount: Number(row.dealCount) || 0,
      avgVolume: Number(row.avgVolume) || 0,
      avgRate: Number(row.avgRate) || 0
    }))

    res.json({ success: true, data: formattedData })
  } catch (error) {
    console.error('Volume Analysis Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch volume analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Top Customers Endpoint
router.get('/top-customers', async (req, res) => {
  try {
    const { timeRange = 'this-month', limit = 5, startDate, endDate } = req.query
    
    let dateFilter: { startDate: string, endDate: string }
    
    if (startDate && endDate) {
      dateFilter = { startDate: startDate as string, endDate: endDate as string }
    } else {
      dateFilter = getDateRange(timeRange as string)
    }

    const customersQuery = `
      SELECT 
        saleParty as customerName,
        CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
        CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
        COUNT(*) as dealCount,
        CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgDealSize,
        CAST(AVG(CAST(saleRate AS REAL)) AS REAL) as avgRate,
        MAX(date) as lastDealDate,
        MIN(date) as firstDealDate
      FROM deals 
      WHERE (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= 
            (substr('${dateFilter.startDate}', 7, 4) || '-' || substr('${dateFilter.startDate}', 4, 2) || '-' || substr('${dateFilter.startDate}', 1, 2))
        AND (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= 
            (substr('${dateFilter.endDate}', 7, 4) || '-' || substr('${dateFilter.endDate}', 4, 2) || '-' || substr('${dateFilter.endDate}', 1, 2))
      GROUP BY saleParty
      ORDER BY totalVolume DESC
      LIMIT ${parseInt(limit as string)}
    `
    
    const customers = await prisma.$queryRawUnsafe(customersQuery)

    // Format data for frontend
    const formattedCustomers = (customers as any[]).map((customer, index) => ({
      rank: index + 1,
      customerName: customer.customerName,
      totalVolume: Number(customer.totalVolume) || 0,
      totalRevenue: Number(customer.totalRevenue) || 0,
      dealCount: Number(customer.dealCount) || 0,
      avgDealSize: Number(customer.avgDealSize) || 0,
      avgRate: Number(customer.avgRate) || 0,
      lastDealDate: customer.lastDealDate,
      firstDealDate: customer.firstDealDate,
      revenuePerMT: Number(customer.totalVolume) > 0 ? Number(customer.totalRevenue) / Number(customer.totalVolume) : 0
    }))

    res.json({ success: true, data: formattedCustomers })
  } catch (error) {
    console.error('Top Customers Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch top customers',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Top Products Endpoint
router.get('/top-products', async (req, res) => {
  try {
    const { timeRange = 'this-month', limit = 10, sortBy = 'volume', startDate, endDate } = req.query
    
    let dateFilter: { startDate: string, endDate: string }
    
    if (startDate && endDate) {
      dateFilter = { startDate: startDate as string, endDate: endDate as string }
    } else {
      dateFilter = getDateRange(timeRange as string)
    }

    let orderByClause = 'ORDER BY totalVolume DESC'
    
    switch (sortBy) {
      case 'revenue':
        orderByClause = 'ORDER BY totalRevenue DESC'
        break
      case 'deals':
        orderByClause = 'ORDER BY dealCount DESC'
        break
      case 'rate':
        orderByClause = 'ORDER BY avgRate DESC'
        break
      default:
        orderByClause = 'ORDER BY totalVolume DESC'
    }

    const query = `
      SELECT 
        productCode,
        company,
        grade,
        specificGrade,
        CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
        CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
        COUNT(*) as dealCount,
        CAST(AVG(CAST(saleRate AS REAL)) AS REAL) as avgRate,
        CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgVolume,
        MAX(date) as lastSaleDate,
        MIN(date) as firstSaleDate
      FROM deals 
      WHERE (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= 
            (substr('${dateFilter.startDate}', 7, 4) || '-' || substr('${dateFilter.startDate}', 4, 2) || '-' || substr('${dateFilter.startDate}', 1, 2))
        AND (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= 
            (substr('${dateFilter.endDate}', 7, 4) || '-' || substr('${dateFilter.endDate}', 4, 2) || '-' || substr('${dateFilter.endDate}', 1, 2))
      GROUP BY productCode, company, grade, specificGrade
      ${orderByClause}
      LIMIT ${parseInt(limit as string)}
    `

    const products = await prisma.$queryRawUnsafe(query)

    // Format data for frontend
    const formattedProducts = (products as any[]).map((product, index) => ({
      rank: index + 1,
      productCode: product.productCode,
      company: product.company,
      grade: product.grade,
      specificGrade: product.specificGrade,
      totalVolume: Number(product.totalVolume) || 0,
      totalRevenue: Number(product.totalRevenue) || 0,
      dealCount: Number(product.dealCount) || 0,
      avgRate: Number(product.avgRate) || 0,
      avgVolume: Number(product.avgVolume) || 0,
      lastSaleDate: product.lastSaleDate,
      firstSaleDate: product.firstSaleDate,
      revenuePerMT: Number(product.totalVolume) > 0 ? Number(product.totalRevenue) / Number(product.totalVolume) : 0
    }))

    res.json({ success: true, data: formattedProducts })
  } catch (error) {
    console.error('Top Products Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch top products',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Filter Options Endpoint
router.get('/filter-options', async (req, res) => {
  try {
    const [productCodes, companies, grades, specificGrades, customers] = await Promise.all([
      prisma.deal.findMany({ 
        select: { productCode: true }, 
        distinct: ['productCode'],
        orderBy: { productCode: 'asc' }
      }),
      prisma.deal.findMany({ 
        select: { company: true }, 
        distinct: ['company'],
        orderBy: { company: 'asc' }
      }),
      prisma.deal.findMany({ 
        select: { grade: true }, 
        distinct: ['grade'],
        orderBy: { grade: 'asc' }
      }),
      prisma.deal.findMany({ 
        select: { specificGrade: true }, 
        distinct: ['specificGrade'],
        orderBy: { specificGrade: 'asc' }
      }),
      prisma.deal.findMany({ 
        select: { saleParty: true }, 
        distinct: ['saleParty'],
        orderBy: { saleParty: 'asc' }
      })
    ])

    const options = {
      productCodes: productCodes.map(p => p.productCode).filter(Boolean),
      companies: companies.map(c => c.company).filter(Boolean),
      grades: grades.map(g => g.grade).filter(Boolean),
      specificGrades: specificGrades.map(sg => sg.specificGrade).filter(Boolean),
      customers: customers.map(c => c.saleParty).filter(Boolean)
    }

    res.json({ success: true, data: options })
  } catch (error) {
    console.error('Filter Options Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch filter options',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Summary Stats for Overview
router.get('/summary', async (req, res) => {
  try {
    const { timeRange = 'this-month', startDate, endDate } = req.query
    
    let dateFilter: { startDate: string, endDate: string }
    
    if (startDate && endDate) {
      dateFilter = { startDate: startDate as string, endDate: endDate as string }
    } else {
      dateFilter = getDateRange(timeRange as string)
    }

    const summaryQuery = `
      SELECT 
        CAST(SUM(CAST(quantitySold AS REAL) * CAST(saleRate AS REAL)) AS REAL) as totalRevenue,
        CAST(SUM(CAST(quantitySold AS REAL)) AS REAL) as totalVolume,
        COUNT(DISTINCT saleParty) as activeCustomers,
        COUNT(*) as totalDeals,
        CAST(AVG(CAST(quantitySold AS REAL)) AS REAL) as avgVolumePerDeal,
        CAST(AVG(CAST(saleRate AS REAL)) AS REAL) as avgRate,
        COUNT(DISTINCT productCode) as activeProducts,
        COUNT(DISTINCT company) as activeCompanies
      FROM deals 
      WHERE (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= 
            (substr('${dateFilter.startDate}', 7, 4) || '-' || substr('${dateFilter.startDate}', 4, 2) || '-' || substr('${dateFilter.startDate}', 1, 2))
        AND (substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= 
            (substr('${dateFilter.endDate}', 7, 4) || '-' || substr('${dateFilter.endDate}', 4, 2) || '-' || substr('${dateFilter.endDate}', 1, 2))
    `
    
    const summary = await prisma.$queryRawUnsafe(summaryQuery)

    const result = Array.isArray(summary) ? summary[0] : summary

    const formattedSummary = {
      totalRevenue: Number(result.totalRevenue) || 0,
      totalVolume: Number(result.totalVolume) || 0,
      activeCustomers: Number(result.activeCustomers) || 0,
      totalDeals: Number(result.totalDeals) || 0,
      avgVolumePerDeal: Number(result.avgVolumePerDeal) || 0,
      avgRate: Number(result.avgRate) || 0,
      activeProducts: Number(result.activeProducts) || 0,
      activeCompanies: Number(result.activeCompanies) || 0,
      revenuePerMT: Number(result.totalVolume) > 0 ? Number(result.totalRevenue) / Number(result.totalVolume) : 0
    }

    res.json({ success: true, data: formattedSummary })
  } catch (error) {
    console.error('Summary Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch summary data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Cache Management Endpoints
router.post('/cache/refresh', async (req, res) => {
  try {
    const { pattern } = req.body
    
    let clearedCount = 0
    
    if (pattern) {
      // Clear specific cache entries matching pattern
      for (const [key, value] of analyticsCache.entries()) {
        if (key.includes(pattern)) {
          analyticsCache.delete(key)
          clearedCount++
        }
      }
    } else {
      // Clear all cache
      clearedCount = analyticsCache.size
      analyticsCache.clear()
    }
    
    console.log(`🧹 Analytics Cache: Cleared ${clearedCount} entries${pattern ? ` matching "${pattern}"` : ''}`)
    
    res.json({ 
      success: true, 
      message: `Cache cleared successfully. ${clearedCount} entries removed.`,
      clearedCount
    })
  } catch (error) {
    console.error('Cache Refresh Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to refresh cache'
    })
  }
})

router.get('/cache/status', (req, res) => {
  try {
    const cacheEntries = Array.from(analyticsCache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      isCurrentPeriod: isCurrentPeriod(key.split('-')[1] || ''),
      size: JSON.stringify(value.data).length
    }))
    
    res.json({
      success: true,
      data: {
        totalEntries: analyticsCache.size,
        entries: cacheEntries
      }
    })
  } catch (error) {
    console.error('Cache Status Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get cache status'
    })
  }
})

export default router