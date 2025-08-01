import { motion } from 'framer-motion'

interface MRPLReferenceTablesProps {
  mouData: Array<{ type: string; value: number }>
  qdData: Array<{ grade: string; range: string; discount: number }>
}

const MRPLReferenceTables = ({ mouData, qdData }: MRPLReferenceTablesProps) => {
  return (
    <div className="space-y-4">
      {/* MOU Reference Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-green-400 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-black text-center">MOU</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50 border-b border-gray-200">
                <th className="px-3 py-2 text-xs font-semibold text-gray-900 text-center">Type</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-900 text-center">Value</th>
              </tr>
            </thead>
            <tbody>
              {mouData.map((row, index) => (
                <motion.tr 
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <td className="px-3 py-2 text-xs text-center font-medium">{row.type}</td>
                  <td className="px-3 py-2 text-xs text-center">{row.value}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* QD Reference Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-blue-400 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-black text-center">Monthly Volume Based Discount - QD</h3>
        </div>
        
        <div className="overflow-x-auto max-h-80">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-blue-50 border-b border-gray-200">
                <th className="px-2 py-2 text-xs font-semibold text-gray-900 text-center">Grade</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-900 text-center">Range</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-900 text-center">Discount</th>
              </tr>
            </thead>
            <tbody>
              {qdData.map((row, index) => (
                <motion.tr 
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <td className="px-2 py-1.5 text-xs text-center font-medium">{row.grade}</td>
                  <td className="px-2 py-1.5 text-xs text-center">{row.range}</td>
                  <td className="px-2 py-1.5 text-xs text-center">{row.discount}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default MRPLReferenceTables