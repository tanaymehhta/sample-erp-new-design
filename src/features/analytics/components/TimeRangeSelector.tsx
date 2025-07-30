// Time Range Selector Component - Reusable date filtering
// Following CLAUDE.md: Single responsibility, no external dependencies

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { TimeRange } from '../types'
import { formatToDDMMYYYY, getDateRangeForPreset } from '../utils/dateUtils'

interface TimeRangeSelectorProps {
  timeRange: TimeRange
  onChange: (timeRange: TimeRange) => void
  disabled?: boolean
}

interface PresetOption {
  label: string
  value: TimeRange['preset']
  getDateRange: () => { startDate: Date; endDate: Date }
}

const presetOptions: PresetOption[] = [
  {
    label: 'This Month',
    value: 'thisMonth',
    getDateRange: () => getDateRangeForPreset('thisMonth')
  },
  {
    label: 'Last Month', 
    value: 'lastMonth',
    getDateRange: () => getDateRangeForPreset('lastMonth')
  },
  {
    label: 'This Quarter',
    value: 'quarter',
    getDateRange: () => getDateRangeForPreset('quarter')
  },
  {
    label: 'This Year',
    value: 'year',
    getDateRange: () => getDateRangeForPreset('year')
  }
]

export default function TimeRangeSelector({ timeRange, onChange, disabled = false }: TimeRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState(
    timeRange.startDate.toISOString().split('T')[0]
  )
  const [customEndDate, setCustomEndDate] = useState(
    timeRange.endDate.toISOString().split('T')[0]
  )

  const handlePresetChange = (preset: TimeRange['preset']) => {
    if (preset === 'custom') {
      setShowCustomPicker(true)
      return
    }

    const option = presetOptions.find(opt => opt.value === preset)
    if (option) {
      const { startDate, endDate } = option.getDateRange()
      onChange({
        ...timeRange,
        preset,
        startDate,
        endDate
      })
    }
    setShowCustomPicker(false)
  }

  const handleCustomDateChange = () => {
    const startDate = new Date(customStartDate)
    const endDate = new Date(customEndDate)
    
    if (startDate <= endDate) {
      onChange({
        ...timeRange,
        preset: 'custom',
        startDate,
        endDate
      })
      setShowCustomPicker(false)
    }
  }

  const getCurrentLabel = () => {
    if (timeRange.preset === 'custom') {
      return `${formatToDDMMYYYY(timeRange.startDate)} - ${formatToDDMMYYYY(timeRange.endDate)}`
    }
    return presetOptions.find(opt => opt.value === timeRange.preset)?.label || 'This Month'
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* Preset Selector */}
        <div className="relative">
          <select
            value={timeRange.preset}
            onChange={(e) => handlePresetChange(e.target.value as TimeRange['preset'])}
            disabled={disabled}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {presetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom">Custom Range</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Current Range Display */}
        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{getCurrentLabel()}</span>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCustomDateChange}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}