import { motion } from 'framer-motion'
import { Calendar, RotateCcw, TrendingUp } from 'lucide-react'

interface MRPLToggleControlsProps {
  globalMOU: 'monthly' | 'annual'
  onMOUToggle: (mode: 'monthly' | 'annual') => void
  onResetAll: () => void
}

const MRPLToggleControls = ({
  globalMOU,
  onMOUToggle,
  onResetAll
}: MRPLToggleControlsProps) => {
  return (
    <motion.div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Global Discount Mode</span>
          </div>
          
          {/* MOU Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 font-medium">MOU:</span>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => onMOUToggle('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  globalMOU === 'monthly'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Monthly</span>
                </div>
              </button>
              <button
                onClick={() => onMOUToggle('annual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  globalMOU === 'annual'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Annual</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={onResetAll}
          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default MRPLToggleControls