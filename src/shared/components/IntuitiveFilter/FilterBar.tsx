import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpDown, 
  Calendar, 
  Hash, 
  Type, 
  DollarSign,
  Search,
  Settings2,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { FilterBarProps, ColumnType } from './types'
import SmartContextMenu from './SmartContextMenu'

interface FilterBarState {
  hoveredColumn: string | null
  activeMenu: string | null
  menuPosition: { x: number; y: number }
}

export default function FilterBar({ 
  columns, 
  data, 
  onFilterChange, 
  onSortChange,
  activeFilters,
  sortState 
}: FilterBarProps) {
  const [state, setState] = useState<FilterBarState>({
    hoveredColumn: null,
    activeMenu: null,
    menuPosition: { x: 0, y: 0 }
  })
  
  const headerRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const getColumnIcon = (type: ColumnType) => {
    switch (type) {
      case 'date': return Calendar
      case 'number': return Hash
      case 'currency': return DollarSign
      case 'text': return Type
      default: return Type
    }
  }

  const handleColumnHover = (columnKey: string, element: HTMLElement) => {
    setState(prev => ({ 
      ...prev, 
      hoveredColumn: columnKey 
    }))
    headerRefs.current[columnKey] = element
  }

  const handleColumnLeave = () => {
    // Small delay to allow moving to filter bar
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        hoveredColumn: null 
      }))
    }, 150)
  }

  const handleQuickSort = (columnKey: string) => {
    const currentSort = sortState?.column === columnKey ? sortState.direction : null
    const newDirection = currentSort === 'asc' ? 'desc' : 'asc'
    
    onSortChange({ column: columnKey, direction: newDirection })
  }

  const handleMenuOpen = (columnKey: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setState(prev => ({
      ...prev,
      activeMenu: columnKey,
      menuPosition: { x: rect.left, y: rect.bottom + 5 }
    }))
  }

  const handleMenuClose = () => {
    setState(prev => ({
      ...prev,
      activeMenu: null
    }))
  }

  const getSortIcon = (columnKey: string) => {
    if (sortState?.column !== columnKey) return ArrowUpDown
    return sortState.direction === 'asc' ? ArrowUp : ArrowDown
  }

  return (
    <>
      {/* Column Headers with Hover Detection */}
      <div className="flex">
        {columns.map((column) => {
          const IconComponent = getColumnIcon(column.type)
          const SortIconComponent = getSortIcon(column.key)
          const isHovered = state.hoveredColumn === column.key
          const isSorted = sortState?.column === column.key
          
          return (
            <div
              key={column.key}
              className="relative flex-1 min-w-0"
              onMouseEnter={(e) => handleColumnHover(column.key, e.currentTarget)}
              onMouseLeave={handleColumnLeave}
            >
              {/* Column Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4 text-gray-400" />
                  <span>{column.label}</span>
                  {isSorted && (
                    <SortIconComponent className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Hover-Activated Filter Bar */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 shadow-lg rounded-b-lg"
                    onMouseEnter={() => setState(prev => ({ ...prev, hoveredColumn: column.key }))}
                    onMouseLeave={handleColumnLeave}
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Sort Toggle */}
                        {column.sortable !== false && (
                          <button
                            onClick={() => handleQuickSort(column.key)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Toggle sort"
                          >
                            <SortIconComponent className="w-3 h-3" />
                          </button>
                        )}

                        {/* Type-specific Quick Action */}
                        <button
                          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title={`Quick ${column.type} filter`}
                        >
                          <IconComponent className="w-3 h-3" />
                        </button>

                        {/* Quick Search */}
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Quick search..."
                              className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <button
                        onClick={(e) => handleMenuOpen(column.key, e.currentTarget)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        title="More options"
                      >
                        <Settings2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Smart Context Menu */}
      <SmartContextMenu
        isOpen={!!state.activeMenu}
        onClose={handleMenuClose}
        position={state.menuPosition}
        column={columns.find(col => col.key === state.activeMenu)}
        data={data}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
      />
    </>
  )
}