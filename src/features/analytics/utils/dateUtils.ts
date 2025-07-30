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
    case 'thisMonth': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { startDate, endDate }
    }
    
    case 'lastMonth': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate, endDate }
    }
    
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const startDate = new Date(now.getFullYear(), quarter * 3, 1)
      const endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      return { startDate, endDate }
    }
    
    case 'year': {
      const startDate = new Date(now.getFullYear(), 0, 1)
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