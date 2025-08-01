import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Hash, Type, DollarSign } from 'lucide-react'
import { ActiveFilter } from './types'

interface FilterPillsProps {
  filters: ActiveFilter[]
  onRemoveFilter: (columnKey: string) => void
  onClearAll: () => void
}

export default function FilterPills({ filters, onRemoveFilter, onClearAll }: FilterPillsProps) {
  if (filters.length === 0) return null

  const getFilterIcon = (columnKey: string) => {
    // Simple heuristic based on column name patterns
    if (columnKey.toLowerCase().includes('date') || columnKey.toLowerCase().includes('time')) {
      return <Calendar className="w-3 h-3" />
    }
    if (columnKey.toLowerCase().includes('rate') || columnKey.toLowerCase().includes('price') || columnKey.toLowerCase().includes('amount')) {
      return <DollarSign className="w-3 h-3" />
    }
    if (columnKey.toLowerCase().includes('quantity') || columnKey.toLowerCase().includes('count') || columnKey.toLowerCase().includes('number')) {
      return <Hash className="w-3 h-3" />
    }
    return <Type className="w-3 h-3" />
  }

  const getFilterColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200', 
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ]
    return colors[index % colors.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200"
    >
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="font-medium">Active Filters:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence mode="popLayout">
          {filters.map((filter, index) => (
            <motion.div
              key={filter.column}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`
                inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium 
                border rounded-full transition-all duration-200 hover:shadow-sm
                ${getFilterColor(index)}
              `}
            >
              {getFilterIcon(filter.column)}
              <span className="max-w-40 truncate">{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.column)}
                className="ml-1 p-0.5 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors ml-2"
        >
          Clear All
        </button>
      )}
    </motion.div>
  )
}