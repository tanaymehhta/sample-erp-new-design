import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'

interface MonthlyDataToggleProps {
  showHistoricalData: boolean
  onToggle: () => void
  selectedMonth: string | undefined
  onMonthSelect: (month: string | undefined) => void
  availableMonths: { value: string; label: string }[]
  children: React.ReactNode
}

const MonthlyDataToggle = ({
  showHistoricalData,
  onToggle,
  selectedMonth,
  onMonthSelect,
  availableMonths,
  children
}: MonthlyDataToggleProps) => {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Historical Data</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {showHistoricalData && (
            <div className="relative">
              <button
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm">
                  {selectedMonth 
                    ? availableMonths.find(m => m.value === selectedMonth)?.label || 'Select Month'
                    : 'Select Month'
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isMonthDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                  >
                    <div className="py-1 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          onMonthSelect(undefined)
                          setIsMonthDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          !selectedMonth ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        Current Month
                      </button>
                      {availableMonths.map((month) => (
                        <button
                          key={month.value}
                          onClick={() => {
                            onMonthSelect(month.value)
                            setIsMonthDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            selectedMonth === month.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <span>{showHistoricalData ? 'Hide' : 'Show'}</span>
            {showHistoricalData ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showHistoricalData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                {selectedMonth 
                  ? `Historical Data - ${availableMonths.find(m => m.value === selectedMonth)?.label}`
                  : 'Current Month Data'
                }
              </h4>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MonthlyDataToggle