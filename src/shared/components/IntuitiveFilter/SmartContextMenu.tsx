import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Hash,
  Type,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Check,
  X
} from 'lucide-react'
import { ColumnDefinition, ActiveFilter, DatePreset } from './types'

interface SmartContextMenuProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  column?: ColumnDefinition
  data: any[]
  activeFilters: ActiveFilter[]
  onFilterChange: (filters: ActiveFilter[]) => void
}

interface DatePresetOption {
  key: DatePreset
  label: string
  icon: React.ReactNode
}

export default function SmartContextMenu({
  isOpen,
  onClose,
  position,
  column,
  data,
  activeFilters,
  onFilterChange
}: SmartContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set())

  // Get unique values for the column
  const uniqueValues = useMemo(() => {
    if (!column || !data.length) return []
    
    const values = data
      .map(item => item[column.key])
      .filter(value => value !== null && value !== undefined && value !== '')
      .map(value => String(value))
    
    return [...new Set(values)].sort()
  }, [column, data])

  // Filter values based on search
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues
    return uniqueValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [uniqueValues, searchTerm])

  // Date presets for date columns
  const datePresets: DatePresetOption[] = [
    { key: 'today', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
    { key: 'yesterday', label: 'Yesterday', icon: <Clock className="w-4 h-4" /> },
    { key: 'this-week', label: 'This Week', icon: <Calendar className="w-4 h-4" /> },
    { key: 'last-week', label: 'Last Week', icon: <Calendar className="w-4 h-4" /> },
    { key: 'this-month', label: 'This Month', icon: <Calendar className="w-4 h-4" /> },
    { key: 'last-month', label: 'Last Month', icon: <Calendar className="w-4 h-4" /> },
    { key: 'last-30-days', label: 'Last 30 Days', icon: <Calendar className="w-4 h-4" /> },
  ]

  // Number/Currency quick filters
  const getNumberQuickFilters = () => {
    if (!column || (!column.type.includes('number') && !column.type.includes('currency'))) return []
    
    const values = data
      .map(item => Number(item[column.key]))
      .filter(value => !isNaN(value))
      .sort((a, b) => b - a)
    
    if (values.length === 0) return []
    
    // const max = values[0]
    // const min = values[values.length - 1]
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const top10Count = Math.min(10, Math.ceil(values.length * 0.1))
    
    return [
      { key: 'top-10', label: `Top ${top10Count} Highest`, icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { key: 'bottom-10', label: `Bottom ${top10Count} Lowest`, icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
      { key: 'above-avg', label: `Above Average (${avg.toFixed(0)})`, icon: <TrendingUp className="w-4 h-4 text-blue-600" /> },
      { key: 'below-avg', label: `Below Average (${avg.toFixed(0)})`, icon: <TrendingDown className="w-4 h-4 text-orange-600" /> },
    ]
  }

  const handleValueToggle = (value: string) => {
    const newSelected = new Set(selectedValues)
    if (newSelected.has(value)) {
      newSelected.delete(value)
    } else {
      newSelected.add(value)
    }
    setSelectedValues(newSelected)
  }

  const handleApplyFilter = () => {
    if (!column) return
    
    const newFilters = activeFilters.filter(f => f.column !== column.key)
    
    if (selectedValues.size > 0) {
      newFilters.push({
        column: column.key,
        value: { text: Array.from(selectedValues) },
        label: `${column.label}: ${selectedValues.size} selected`
      })
    }
    
    onFilterChange(newFilters)
    onClose()
  }

  const handleDatePreset = (preset: DatePreset) => {
    if (!column) return
    
    const newFilters = activeFilters.filter(f => f.column !== column.key)
    newFilters.push({
      column: column.key,
      value: { date: { presets: [preset] } },
      label: `${column.label}: ${datePresets.find(p => p.key === preset)?.label}`
    })
    
    onFilterChange(newFilters)
    onClose()
  }

  const handleNumberFilter = (filterKey: string) => {
    if (!column) return
    
    const values = data
      .map(item => Number(item[column.key]))
      .filter(value => !isNaN(value))
      .sort((a, b) => b - a)
    
    let filteredValues: number[] = []
    
    switch (filterKey) {
      case 'top-10':
        filteredValues = values.slice(0, Math.min(10, Math.ceil(values.length * 0.1)))
        break
      case 'bottom-10':
        filteredValues = values.slice(-Math.min(10, Math.ceil(values.length * 0.1)))
        break
      case 'above-avg':
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length
        filteredValues = values.filter(v => v > avg)
        break
      case 'below-avg':
        const avgBelow = values.reduce((sum, val) => sum + val, 0) / values.length
        filteredValues = values.filter(v => v < avgBelow)
        break
    }
    
    const newFilters = activeFilters.filter(f => f.column !== column.key)
    const label = getNumberQuickFilters().find(f => f.key === filterKey)?.label || ''
    
    newFilters.push({
      column: column.key,
      value: { number: { values: filteredValues } },
      label: `${column.label}: ${label}`
    })
    
    onFilterChange(newFilters)
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedValues(new Set())
    }
  }, [isOpen])

  if (!isOpen || !column) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl min-w-64 max-w-80"
        style={{ 
          left: position.x, 
          top: position.y,
          maxHeight: '400px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {column.type === 'date' && <Calendar className="w-4 h-4 text-blue-600" />}
            {column.type === 'number' && <Hash className="w-4 h-4 text-green-600" />}
            {column.type === 'currency' && <DollarSign className="w-4 h-4 text-yellow-600" />}
            {column.type === 'text' && <Type className="w-4 h-4 text-purple-600" />}
            <span className="font-medium text-gray-900">{column.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {/* Date Column - Presets */}
          {column.type === 'date' && (
            <div className="p-2">
              <div className="space-y-1">
                {datePresets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handleDatePreset(preset.key)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                  >
                    {preset.icon}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">Custom Range</div>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Number/Currency Column - Quick Filters */}
          {(column.type === 'number' || column.type === 'currency') && (
            <div className="p-2">
              <div className="space-y-1">
                {getNumberQuickFilters().map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleNumberFilter(filter.key)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">Custom Range</div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Column - Value Selection */}
          {column.type === 'text' && (
            <div className="p-2">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search values..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Value List */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredValues.map((value) => (
                  <label
                    key={value}
                    className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.has(value)}
                      onChange={() => handleValueToggle(value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                      {value}
                    </span>
                  </label>
                ))}
              </div>

              {/* Apply Button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={handleApplyFilter}
                  disabled={selectedValues.size === 0}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filter ({selectedValues.size})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}