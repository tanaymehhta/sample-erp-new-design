// Date utilities for dd-mm-yyyy format handling
// Following CLAUDE.md: Single responsibility, pure functions

export function parseDDMMYYYY(dateString: string): Date {
  if (!dateString) {
    throw new Error('Date string is required')
  }
  
  const parts = dateString.split('-')
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateString}. Expected dd-mm-yyyy`)
  }
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // JavaScript months are 0-indexed
  const year = parseInt(parts[2], 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(`Invalid date components in: ${dateString}`)
  }
  
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day} in ${dateString}`)
  }
  
  if (month < 0 || month > 11) {
    throw new Error(`Invalid month: ${parts[1]} in ${dateString}`)
  }
  
  if (year < 1900 || year > 2100) {
    throw new Error(`Invalid year: ${year} in ${dateString}`)
  }
  
  const date = new Date(year, month, day)
  
  // Verify the date is valid (handles cases like 31st February)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    throw new Error(`Invalid date: ${dateString}`)
  }
  
  return date
}

export function formatToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}-${month}-${year}`
}

export function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return { startDate: startOfMonth, endDate: endOfMonth }
}

export function getDateRangeForPreset(preset: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  
  switch (preset) {
    case 'today': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { startDate, endDate }
    }
    
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      const endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      return { startDate, endDate }
    }
    
    case 'this-week': {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      const endDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate())
      return { startDate, endDate }
    }
    
    case 'last-week': {
      const lastSunday = new Date(now)
      lastSunday.setDate(now.getDate() - now.getDay() - 1)
      const lastWeekStart = new Date(lastSunday)
      lastWeekStart.setDate(lastSunday.getDate() - 6)
      const startDate = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate())
      const endDate = new Date(lastSunday.getFullYear(), lastSunday.getMonth(), lastSunday.getDate())
      return { startDate, endDate }
    }
    
    case 'this-month': 
    case 'thisMonth': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { startDate, endDate }
    }
    
    case 'last-month':
    case 'lastMonth': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate, endDate }
    }
    
    case 'last-7-days': {
      const startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { startDate, endDate }
    }
    
    case 'last-30-days': {
      const startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { startDate, endDate }
    }
    
    case 'last-90-days': {
      const startDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { startDate, endDate }
    }
    
    case 'this-quarter':
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const startDate = new Date(now.getFullYear(), quarter * 3, 1)
      const endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      return { startDate, endDate }
    }
    
    case 'last-quarter': {
      const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3
      const lastQuarterYear = lastQuarterStart < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const adjustedQuarterStart = lastQuarterStart < 0 ? 9 : lastQuarterStart
      const startDate = new Date(lastQuarterYear, adjustedQuarterStart, 1)
      const endDate = new Date(lastQuarterYear, adjustedQuarterStart + 3, 0)
      return { startDate, endDate }
    }
    
    case 'this-year':
    case 'year': {
      const startDate = new Date(now.getFullYear(), 0, 1)
      const endDate = new Date(now.getFullYear(), 11, 31)
      return { startDate, endDate }
    }
    
    case 'last-year': {
      const startDate = new Date(now.getFullYear() - 1, 0, 1)
      const endDate = new Date(now.getFullYear() - 1, 11, 31)
      return { startDate, endDate }
    }
    
    case 'last-3-years': {
      const startDate = new Date(now.getFullYear() - 3, 0, 1)
      const endDate = new Date(now.getFullYear(), 11, 31)
      return { startDate, endDate }
    }
    
    case 'last-5-years': {
      const startDate = new Date(now.getFullYear() - 5, 0, 1)
      const endDate = new Date(now.getFullYear(), 11, 31)
      return { startDate, endDate }
    }
    
    default:
      return getCurrentMonthRange()
  }
}

export function isDateInRange(dateString: string, startDate: Date, endDate: Date): boolean {
  try {
    const date = parseDDMMYYYY(dateString)
    return date >= startDate && date <= endDate
  } catch (error) {
    console.error(`Error parsing date ${dateString}:`, error)
    return false
  }
}