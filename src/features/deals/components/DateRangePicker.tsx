import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'

interface DateRangePickerProps {
  onSelect: (startDate: string, endDate: string) => void
  onClose: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DateRangePicker({ onSelect, onClose }: DateRangePickerProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

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
        // Auto-confirm selection after a short delay
        setTimeout(() => {
          onSelect(formatDate(selectedStartDate), formatDate(date))
        }, 200)
      } else {
        // If selected date is before start date, make it the new start date
        setSelectedStartDate(date)
        setSelectedEndDate(null)
      }
    }
  }

  const isDateInRange = (date: Date): boolean => {
    if (!selectedStartDate) return false
    if (!selectedEndDate && !isSelecting) return false
    
    if (selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate
    }
    
    return false
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selectedStartDate) return false
    if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) return true
    if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) return true
    return false
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
                  className={cn(
                    "w-full h-full flex items-center justify-center text-sm rounded-lg transition-all duration-150",
                    "hover:bg-blue-100",
                    isDateSelected(date) && "bg-blue-600 text-white font-semibold hover:bg-blue-700",
                    isDateInRange(date) && !isDateSelected(date) && "bg-blue-100 text-blue-700",
                    date.toDateString() === today.toDateString() && !isDateSelected(date) && "bg-gray-100 font-semibold"
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
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4">
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
        
        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-sm text-gray-600">
            {selectedStartDate && selectedEndDate ? (
              <span>
                {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
              </span>
            ) : selectedStartDate ? (
              <span>Start: {formatDate(selectedStartDate)} | Select end date</span>
            ) : (
              <span>Click to select start date</span>
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
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Click start date, then end date to select range
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