import { TimeRange } from '../types'

export interface DateRange {
  start: Date
  end: Date
}

export const getDateRangeForTimeRange = (timeRange: TimeRange): DateRange => {
  const today = new Date()
  const start = new Date()
  const end = new Date()

  switch (timeRange) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'this-week':
      start.setDate(today.getDate() - today.getDay())
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'this-month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'last-month':
      start.setMonth(today.getMonth() - 1, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(today.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'this-quarter':
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
      start.setMonth(quarterStartMonth, 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'last-quarter':
      const lastQuarterStartMonth = Math.floor(today.getMonth() / 3) * 3 - 3
      if (lastQuarterStartMonth < 0) {
        start.setFullYear(today.getFullYear() - 1, 9, 1)
        end.setFullYear(today.getFullYear() - 1, 11, 31)
      } else {
        start.setMonth(lastQuarterStartMonth, 1)
        end.setMonth(lastQuarterStartMonth + 3, 0)
      }
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'this-year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }

    case 'all-time':
    default:
      // Return a very wide range for all-time
      start.setFullYear(2020, 0, 1)
      start.setHours(0, 0, 0, 0)
      end.setFullYear(2030, 11, 31)
      end.setHours(23, 59, 59, 999)
      return { start, end }
  }
}

export const formatDateForBackend = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const formatDateForDisplay = (dateStr: string): string => {
  const date = parseDateString(dateStr)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

export const formatDateForInput = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export const parseDateString = (dateStr: string): Date => {
  // Handle DD-MM-YYYY format
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
    const [day, month, year] = dateStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  // Handle ISO format or other standard formats
  return new Date(dateStr)
}

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate
}

export const getRelativeDateDescription = (startDate: Date, endDate: Date): string => {
  const today = new Date()
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    if (startDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else {
      return startDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short',
        year: startDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }
  
  if (diffDays <= 7) {
    return `${diffDays + 1} days`
  }
  
  if (diffDays <= 30) {
    return `${Math.ceil(diffDays / 7)} weeks`
  }
  
  if (diffDays <= 365) {
    return `${Math.ceil(diffDays / 30)} months`
  }
  
  return `${Math.ceil(diffDays / 365)} years`
}

export const generateDateOptions = (): Array<{ label: string; value: TimeRange }> => {
  return [
    { label: 'All Time', value: 'all-time' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Quarter', value: 'this-quarter' },
    { label: 'Last Quarter', value: 'last-quarter' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Custom Range', value: 'custom' }
  ]
}

export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
  try {
    const start = parseDateString(startDate)
    const end = parseDateString(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }
    
    if (start > end) {
      return { isValid: false, error: 'Start date must be before end date' }
    }
    
    const today = new Date()
    if (start > today) {
      return { isValid: false, error: 'Start date cannot be in the future' }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' }
  }
}

export const getQuickDatePresets = () => {
  const today = new Date()
  
  return [
    {
      label: 'Today',
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(today)
    },
    {
      label: 'Yesterday',
      startDate: formatDateForInput(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
      endDate: formatDateForInput(new Date(today.getTime() - 24 * 60 * 60 * 1000))
    },
    {
      label: 'Last 7 Days',
      startDate: formatDateForInput(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
      endDate: formatDateForInput(today)
    },
    {
      label: 'Last 30 Days',
      startDate: formatDateForInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      endDate: formatDateForInput(today)
    },
    {
      label: 'This Month',
      startDate: formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDateForInput(today)
    },
    {
      label: 'Last Month',
      startDate: formatDateForInput(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endDate: formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 0))
    }
  ]
}