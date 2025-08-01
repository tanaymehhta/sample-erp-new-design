import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { TimeRange } from '../types'
import EnhancedDateRangePicker from './EnhancedDateRangePicker'

interface DateFilterButtonProps {
  currentRange: TimeRange
  startDate?: string
  endDate?: string
  onDateRangeChange: (startDate: string, endDate: string) => void
  onQuickRangeChange: (timeRange: TimeRange) => void
  totalResults?: number
  className?: string
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  'all-time': 'All Time',
  'today': 'Today',
  'this-week': 'This Week',
  'this-month': 'This Month', 
  'last-month': 'Last Month',
  'this-quarter': 'This Quarter',
  'last-quarter': 'Last Quarter',
  'this-year': 'This Year',
  'custom': 'Custom Range'
}

export default function DateFilterButton({
  currentRange,
  startDate,
  endDate,
  onDateRangeChange,
  onQuickRangeChange,
  totalResults,
  className
}: DateFilterButtonProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const formatDisplayDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    })
  }

  const getDisplayLabel = (): string => {
    if (currentRange === 'custom' && startDate && endDate) {
      if (startDate === endDate) {
        return formatDisplayDate(startDate)
      }
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    }
    return TIME_RANGE_LABELS[currentRange] || 'This Year'
  }

  const handleDateRangeSelect = (start: string, end: string) => {
    onDateRangeChange(start, end)
    setShowDatePicker(false)
  }

  const handleQuickSelect = (timeRange: TimeRange) => {
    onQuickRangeChange(timeRange)
    setShowDatePicker(false)
  }

  const isCustomRange = currentRange === 'custom'
  const hasResults = totalResults !== undefined

  return (
    <>
      <button
        onClick={() => setShowDatePicker(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg",
          "hover:border-blue-400 hover:bg-blue-50 transition-all duration-200",
          "text-sm font-medium text-gray-700",
          isCustomRange && "border-blue-400 bg-blue-50 text-blue-700",
          className
        )}
      >
        <Calendar className="w-4 h-4" />
        <span className="min-w-0 truncate">
          {getDisplayLabel()}
        </span>
        {hasResults && (
          <span className={cn(
            "ml-2 px-2 py-0.5 text-xs rounded-full",
            isCustomRange 
              ? "bg-blue-100 text-blue-700" 
              : "bg-gray-100 text-gray-600"
          )}>
            {totalResults.toLocaleString()}
          </span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {showDatePicker && (
        <EnhancedDateRangePicker
          onSelect={handleDateRangeSelect}
          onQuickSelect={handleQuickSelect}
          onClose={() => setShowDatePicker(false)}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      )}
    </>
  )
}