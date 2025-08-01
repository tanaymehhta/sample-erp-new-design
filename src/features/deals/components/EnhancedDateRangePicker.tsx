import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Calendar, Clock } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { TimeRange } from '../types'

interface EnhancedDateRangePickerProps {
  onSelect: (startDate: string, endDate: string) => void
  onQuickSelect: (timeRange: TimeRange) => void
  onClose: () => void
  initialStartDate?: string
  initialEndDate?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const QUICK_PRESETS = [
  { 
    label: 'Today', 
    value: 'today' as TimeRange,
    getDates: () => {
      const today = new Date()
      return { start: today, end: today }
    }
  },
  { 
    label: 'Yesterday', 
    value: 'yesterday' as TimeRange,
    getDates: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: yesterday }
    }
  },
  { 
    label: 'This Week', 
    value: 'this-week' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - today.getDay())
      return { start, end: today }
    }
  },
  { 
    label: 'Last Week', 
    value: 'last-week' as TimeRange,
    getDates: () => {
      const today = new Date()
      const lastWeekEnd = new Date(today)
      lastWeekEnd.setDate(today.getDate() - today.getDay() - 1)
      const lastWeekStart = new Date(lastWeekEnd)
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6)
      return { start: lastWeekStart, end: lastWeekEnd }
    }
  },
  { 
    label: 'This Month', 
    value: 'this-month' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start, end: today }
    }
  },
  { 
    label: 'Last Month', 
    value: 'last-month' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start, end }
    }
  },
  { 
    label: 'Last 7 Days', 
    value: 'last-7-days' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - 7)
      return { start, end: today }
    }
  },
  { 
    label: 'Last 30 Days', 
    value: 'last-30-days' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - 30)
      return { start, end: today }
    }
  },
  { 
    label: 'Last 90 Days', 
    value: 'last-90-days' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - 90)
      return { start, end: today }
    }
  },
  { 
    label: 'This Quarter', 
    value: 'this-quarter' as TimeRange,
    getDates: () => {
      const today = new Date()
      const quarter = Math.floor(today.getMonth() / 3)
      const start = new Date(today.getFullYear(), quarter * 3, 1)
      return { start, end: today }
    }
  },
  { 
    label: 'Last Quarter', 
    value: 'last-quarter' as TimeRange,
    getDates: () => {
      const today = new Date()
      const quarter = Math.floor(today.getMonth() / 3)
      const lastQuarter = quarter === 0 ? 3 : quarter - 1
      const year = quarter === 0 ? today.getFullYear() - 1 : today.getFullYear()
      const start = new Date(year, lastQuarter * 3, 1)
      const end = new Date(year, lastQuarter * 3 + 3, 0)
      return { start, end }
    }
  },
  { 
    label: 'This Year', 
    value: 'this-year' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), 0, 1)
      return { start, end: today }
    }
  },
  { 
    label: 'Last Year', 
    value: 'last-year' as TimeRange,
    getDates: () => {
      const today = new Date()
      const start = new Date(today.getFullYear() - 1, 0, 1)
      const end = new Date(today.getFullYear() - 1, 11, 31)
      return { start, end }
    }
  }
]

export default function EnhancedDateRangePicker({ 
  onSelect, 
  onQuickSelect, 
  onClose, 
  initialStartDate, 
  initialEndDate 
}: EnhancedDateRangePickerProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(() => 
    initialStartDate ? new Date(initialStartDate.split('-').reverse().join('-')) : null
  )
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(() => 
    initialEndDate ? new Date(initialEndDate.split('-').reverse().join('-')) : null
  )
  const [isSelecting, setIsSelecting] = useState(false)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'presets'>('presets')

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date)
      setSelectedEndDate(null)
      setIsSelecting(true)
    } else {
      // Complete selection
      if (date >= selectedStartDate) {
        setSelectedEndDate(date)
        setIsSelecting(false)
      } else {
        // If selected date is before start date, make it the new start date
        setSelectedStartDate(date)
        setSelectedEndDate(null)
      }
    }
  }

  const handleQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const { start, end } = preset.getDates()
    setSelectedStartDate(start)
    setSelectedEndDate(end)
    setActiveTab('calendar')
    
    // Auto-apply preset
    setTimeout(() => {
      onSelect(formatDate(start), formatDate(end))
    }, 200)
  }

  const isDateInRange = (date: Date): boolean => {
    if (!selectedStartDate) return false
    
    if (selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate
    }
    
    if (isSelecting && hoveredDate && hoveredDate >= selectedStartDate) {
      return date >= selectedStartDate && date <= hoveredDate
    }
    
    return false
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selectedStartDate) return false
    if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) return true
    if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) return true
    return false
  }

  const isDateToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const generateCalendar = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const renderMonth = (month: number, year: number) => {
    const days = generateCalendar(month, year)
    
    return (
      <div className="flex-1">
        <div className="text-center font-semibold text-gray-900 mb-4">
          {MONTHS[month]} {year}
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <button
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={cn(
                    "w-full h-full flex items-center justify-center text-sm rounded-lg transition-all duration-150",
                    "hover:bg-blue-100",
                    isDateSelected(date) && "bg-blue-600 text-white font-semibold hover:bg-blue-700",
                    isDateInRange(date) && !isDateSelected(date) && "bg-blue-100 text-blue-700",
                    isDateToday(date) && !isDateSelected(date) && "bg-gray-100 font-semibold border-2 border-blue-300"
                  )}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('presets')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors",
              activeTab === 'presets' 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Quick Presets
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors",
              activeTab === 'calendar' 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Custom Calendar
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {activeTab === 'presets' ? (
            /* Preset Options */
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {QUICK_PRESETS.map((preset) => {
                  const { start, end } = preset.getDates()
                  return (
                    <button
                      key={preset.value}
                      onClick={() => handleQuickPreset(preset)}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {preset.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDisplayDate(start)}
                        {start.getTime() !== end.getTime() && (
                          <> - {formatDisplayDate(end)}</>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div>
              {/* Navigation */}
              <div className="flex items-center justify-between p-6 pb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  {selectedStartDate && selectedEndDate ? (
                    <div className="text-sm font-medium text-gray-900">
                      {formatDisplayDate(selectedStartDate)} - {formatDisplayDate(selectedEndDate)}
                    </div>
                  ) : selectedStartDate ? (
                    <div className="text-sm text-gray-600">
                      Start: {formatDisplayDate(selectedStartDate)} | Select end date
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Click to select start date
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Dual Calendar */}
              <div className="flex gap-8 p-6 pt-0">
                {renderMonth(currentMonth, currentYear)}
                <div className="w-px bg-gray-200"></div>
                {renderMonth(nextMonth, nextYear)}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {activeTab === 'presets' 
              ? 'Select a preset or switch to calendar for custom range'
              : 'Click start date, then end date to select range'
            }
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {selectedStartDate && selectedEndDate && (
              <button
                onClick={() => onSelect(formatDate(selectedStartDate), formatDate(selectedEndDate))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Range
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}