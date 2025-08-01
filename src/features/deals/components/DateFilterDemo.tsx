import { useState } from 'react'
import { TimeRange } from '../types'
import DateFilterButton from './DateFilterButton'
import { getDateRangeForTimeRange, formatDateForInput } from '../utils/dateUtils'

interface DateFilterDemoProps {
  onFiltersChange?: (filters: any) => void
  totalResults?: number
}

export default function DateFilterDemo({ onFiltersChange, totalResults }: DateFilterDemoProps) {
  const [currentRange, setCurrentRange] = useState<TimeRange>('this-month')
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    setCurrentRange('custom')
    
    // Notify parent component of filter change
    if (onFiltersChange) {
      onFiltersChange({
        timeRange: 'custom',
        dateFrom: start,
        dateTo: end
      })
    }
    
    console.log('📅 Date range selected:', { start, end })
  }

  const handleQuickRangeChange = (timeRange: TimeRange) => {
    setCurrentRange(timeRange)
    
    if (timeRange !== 'custom') {
      const { start, end } = getDateRangeForTimeRange(timeRange)
      const startStr = formatDateForInput(start)
      const endStr = formatDateForInput(end)
      
      setStartDate(startStr)
      setEndDate(endStr)
      
      // Notify parent component of filter change
      if (onFiltersChange) {
        onFiltersChange({
          timeRange,
          dateFrom: startStr,
          dateTo: endStr
        })
      }
      
      console.log('⚡ Quick range selected:', { timeRange, start: startStr, end: endStr })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enhanced Date Calendar Feature
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <DateFilterButton
              currentRange={currentRange}
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
              onQuickRangeChange={handleQuickRangeChange}
              totalResults={totalResults}
            />
          </div>
          
          {startDate && endDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current Selection:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Range:</strong> {currentRange}</div>
                <div><strong>Start:</strong> {startDate}</div>
                <div><strong>End:</strong> {endDate}</div>
                {totalResults !== undefined && (
                  <div><strong>Results:</strong> {totalResults.toLocaleString()} deals</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Features Included:</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✅ <strong>Quick Presets:</strong> Today, Yesterday, This Week, Last Month, etc.</li>
          <li>✅ <strong>Custom Calendar:</strong> Dual-month view with range selection</li>
          <li>✅ <strong>Visual Feedback:</strong> Hover effects and range highlighting</li>
          <li>✅ <strong>Keyboard Support:</strong> ESC to close, intuitive navigation</li>
          <li>✅ <strong>Smart Display:</strong> Compact button with result counts</li>
          <li>✅ <strong>Multiple Time Ranges:</strong> 15+ preset options covering all business needs</li>
          <li>✅ <strong>Date Validation:</strong> Prevents invalid ranges and future dates</li>
          <li>✅ <strong>Mobile Responsive:</strong> Works perfectly on all screen sizes</li>
        </ul>
      </div>
    </div>
  )
}