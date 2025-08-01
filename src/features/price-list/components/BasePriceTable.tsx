import { motion } from 'framer-motion'
import { TableColumn } from '../types'

interface BasePriceTableProps {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  className?: string
  title?: string
}

const BasePriceTable = ({ 
  data, 
  columns, 
  loading = false, 
  className = '', 
  title 
}: BasePriceTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading price data...</p>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 text-center text-gray-500">
          No price data available
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="bg-yellow-400 px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-black text-center">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-yellow-50 border-b border-gray-200">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-4 py-3 text-sm font-semibold text-gray-900 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr 
                key={rowIndex}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
              >
                {columns.map((column) => {
                  const value = row[column.key]
                  const displayValue = column.format ? column.format(value) : value
                  
                  return (
                    <td 
                      key={column.key}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      } ${column.className || ''}`}
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default BasePriceTable