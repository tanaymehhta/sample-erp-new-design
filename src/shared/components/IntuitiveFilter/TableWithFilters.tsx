import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { ColumnDefinition, ActiveFilter, SortState } from './types'
import FilterBar from './FilterBar'
import FilterPills from './FilterPills'

interface TableWithFiltersProps<T = any> {
  data: T[]
  columns: ColumnDefinition[]
  renderRow: (item: T, index: number, isHighlighted?: boolean) => React.ReactNode
  className?: string
  emptyState?: React.ReactNode
  loading?: boolean
  onRowClick?: (item: T, index: number) => void
  onRowDoubleClick?: (item: T, index: number) => void
  onRowRightClick?: (item: T, index: number, event: React.MouseEvent) => void
}

export default function TableWithFilters<T extends Record<string, any>>({
  data,
  columns,
  renderRow,
  className = '',
  emptyState,
  loading = false,
  onRowClick,
  onRowDoubleClick,
  onRowRightClick
}: TableWithFiltersProps<T>) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [previewData, setPreviewData] = useState<T[] | null>(null)
  const [highlightedRows, setHighlightedRows] = useState<Set<number>>(new Set())
  
  const tableRef = useRef<HTMLDivElement>(null)

  // Apply filters and sorting to data
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Apply filters
    activeFilters.forEach(filter => {
      const { column, value } = filter
      
      filtered = filtered.filter(item => {
        const itemValue = item[column]
        
        if (value.text) {
          return value.text.includes(String(itemValue))
        }
        
        if (value.number) {
          const numValue = Number(itemValue)
          if (value.number.values) {
            return value.number.values.includes(numValue)
          }
          if (value.number.min !== undefined && numValue < value.number.min) return false
          if (value.number.max !== undefined && numValue > value.number.max) return false
        }
        
        if (value.currency) {
          const numValue = Number(itemValue)
          if (value.currency.values) {
            return value.currency.values.includes(numValue)
          }
          if (value.currency.min !== undefined && numValue < value.currency.min) return false
          if (value.currency.max !== undefined && numValue > value.currency.max) return false
        }
        
        if (value.date) {
          const itemDate = new Date(itemValue)
          if (value.date.from) {
            const fromDate = new Date(value.date.from)
            if (itemDate < fromDate) return false
          }
          if (value.date.to) {
            const toDate = new Date(value.date.to)
            if (itemDate > toDate) return false
          }
          // Handle date presets
          if (value.date.presets) {
            const today = new Date()
            return value.date.presets.some(preset => {
              switch (preset) {
                case 'today':
                  return itemDate.toDateString() === today.toDateString()
                case 'yesterday':
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)
                  return itemDate.toDateString() === yesterday.toDateString()
                case 'this-week':
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay())
                  return itemDate >= weekStart && itemDate <= today
                case 'this-month':
                  return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()
                // Add more preset logic as needed
                default:
                  return false
              }
            })
          }
        }
        
        return true
      })
    })

    // Apply sorting
    if (sortState) {
      filtered.sort((a, b) => {
        const aValue = a[sortState.column]
        const bValue = b[sortState.column]
        
        // Handle different data types
        let comparison = 0
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue || '').localeCompare(String(bValue || ''))
        }
        
        return sortState.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, activeFilters, sortState])

  const handleFilterChange = (filters: ActiveFilter[]) => {
    setActiveFilters(filters)
    // Clear preview when filter changes
    setPreviewData(null)
    setHighlightedRows(new Set())
  }

  const handleSortChange = (sort: SortState | null) => {
    setSortState(sort)
  }

  const handleRemoveFilter = (columnKey: string) => {
    setActiveFilters(prev => prev.filter(f => f.column !== columnKey))
  }

  const handleClearAllFilters = () => {
    setActiveFilters([])
    setPreviewData(null)
    setHighlightedRows(new Set())
  }

  // Handle one-click actions
  const handleRowDoubleClickInternal = (item: T, index: number) => {
    // Double-click to sort by first sortable column
    const sortableColumn = columns.find(col => col.sortable !== false)
    if (sortableColumn) {
      const currentSort = sortState?.column === sortableColumn.key ? sortState.direction : null
      const newDirection = currentSort === 'asc' ? 'desc' : 'asc'
      setSortState({ column: sortableColumn.key, direction: newDirection })
    }
    onRowDoubleClick?.(item, index)
  }

  const handleRowRightClickInternal = (item: T, index: number, event: React.MouseEvent) => {
    event.preventDefault()
    
    // Right-click to filter by clicked cell value
    const target = event.target as HTMLElement
    
    // Try to determine which column was clicked
    const columnIndex = Array.from(target.closest('tr')?.children || []).indexOf(target.closest('td') || target)
    if (columnIndex >= 0 && columnIndex < columns.length) {
      const column = columns[columnIndex]
      const value = item[column.key]
      
      if (value !== null && value !== undefined && value !== '') {
        const newFilter: ActiveFilter = {
          column: column.key,
          value: { text: [String(value)] },
          label: `${column.label}: ${value}`
        }
        
        setActiveFilters(prev => {
          const filtered = prev.filter(f => f.column !== column.key)
          return [...filtered, newFilter]
        })
      }
    }
    
    onRowRightClick?.(item, index, event)
  }

  const displayData = previewData || processedData

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Filter Pills */}
      <FilterPills
        filters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Table with Integrated Filter Bar */}
      <div ref={tableRef} className="overflow-auto">
        <div className="min-w-full">
          {/* Header with Filter Bar */}
          <FilterBar
            columns={columns}
            data={data}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            activeFilters={activeFilters}
            sortState={sortState}
          />

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : displayData.length === 0 ? (
              <div className="py-12 text-center">
                {emptyState || (
                  <div>
                    <p className="text-gray-500">No data found</p>
                    {activeFilters.length > 0 && (
                      <button
                        onClick={handleClearAllFilters}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear filters to see all data
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              displayData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    hover:bg-gray-50 transition-colors cursor-pointer
                    ${highlightedRows.has(index) ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  onClick={() => onRowClick?.(item, index)}
                  onDoubleClick={() => handleRowDoubleClickInternal(item, index)}
                  onContextMenu={(e) => handleRowRightClickInternal(item, index, e)}
                >
                  {renderRow(item, index, highlightedRows.has(index))}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && data.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
          Showing {displayData.length} of {data.length} rows
          {activeFilters.length > 0 && (
            <span className="ml-2 text-blue-600">
              • {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
            </span>
          )}
          {sortState && (
            <span className="ml-2 text-green-600">
              • Sorted by {columns.find(c => c.key === sortState.column)?.label} ({sortState.direction})
            </span>
          )}
        </div>
      )}
    </div>
  )
}