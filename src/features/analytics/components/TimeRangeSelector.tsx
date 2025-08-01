import React, { useState } from 'react'

interface TimeRangeSelectorProps {
  value: string
  onChange: (timeRange: string) => void
  onCompareChange?: (compareWith: string | null) => void
  compareWith?: string | null
  disabled?: boolean
}

interface PresetOption {
  label: string
  value: string
}

const timeRangeOptions: PresetOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last Week', value: 'last-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'Last 7 Days', value: 'last-7-days' },
  { label: 'Last 30 Days', value: 'last-30-days' },
  { label: 'Last 90 Days', value: 'last-90-days' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'Last Quarter', value: 'last-quarter' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
  { label: 'Last 3 Years', value: 'last-3-years' },
  { label: 'Last 5 Years', value: 'last-5-years' }
]

const compareOptions: PresetOption[] = [
  { label: 'No Comparison', value: '' },
  { label: 'Previous Period', value: 'previous-period' },
  { label: 'Same Period Last Year', value: 'same-period-last-year' }
]

export function TimeRangeSelector({ 
  value, 
  onChange, 
  onCompareChange, 
  compareWith, 
  disabled = false 
}: TimeRangeSelectorProps) {
  const getCurrentLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === value)
    return option?.label || 'This Month'
  }

  const handleCompareChange = (newCompareWith: string) => {
    if (onCompareChange) {
      onCompareChange(newCompareWith === '' ? null : newCompareWith)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Time Range:</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Compare With Selector */}
      {onCompareChange && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Compare:</label>
          <select
            value={compareWith || ''}
            onChange={(e) => handleCompareChange(e.target.value)}
            disabled={disabled}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {compareOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Selection Display */}
      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
        📅 {getCurrentLabel()}
        {compareWith && (
          <span className="ml-2 text-blue-600">
            vs {compareOptions.find(opt => opt.value === compareWith)?.label}
          </span>
        )}
      </div>
    </div>
  )
}