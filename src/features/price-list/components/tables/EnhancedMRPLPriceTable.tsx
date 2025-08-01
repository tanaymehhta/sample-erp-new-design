import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { MRPLPriceRow, TableColumn, RateType, MRPLToggleState } from '../../types'
import MRPLToggleControls from '../MRPLToggleControls'
import MRPLRowToggle from '../MRPLRowToggle'
import MRPLReferenceTables from '../MRPLReferenceTables'

interface EnhancedMRPLPriceTableProps {
  data: MRPLPriceRow[]
  rateType: RateType
  loading?: boolean
}

const EnhancedMRPLPriceTable = ({ 
  data, 
  rateType, 
  loading
}: EnhancedMRPLPriceTableProps) => {
  const [toggleState, setToggleState] = useState<MRPLToggleState>({
    global: {
      qd: 'monthly',
      mou: 'monthly'
    },
    perRow: {}
  })

  const [showReferenceTables, setShowReferenceTables] = useState(false)

  // Reference data
  const referenceData = {
    mou: [
      { type: 'Monthly', value: 0.9 },
      { type: 'Yearly', value: 1.4 }
    ],
    qd: [
      { grade: 'A', range: '5 TO 8.975', discount: 0.4 },
      { grade: 'A', range: '9 TO 24.975', discount: 0.45 },
      { grade: 'B', range: '25 TO 49.975', discount: 0.5 },
      { grade: 'C', range: '50 TO 99.975', discount: 0.55 },
      { grade: 'D', range: '100 TO 199.975', discount: 0.65 },
      { grade: 'E', range: '200 TO 299.975', discount: 0.75 },
      { grade: 'F', range: '300 TO 399.975', discount: 0.85 },
      { grade: 'G', range: '400 TO 499.975', discount: 0.95 },
      { grade: 'H', range: '500 TO 599.975', discount: 1.0 },
      { grade: 'I', range: '600 TO 699.975', discount: 1.05 },
      { grade: 'J', range: '700 TO 799.975', discount: 1.1 },
      { grade: 'K', range: '800 TO 899.975', discount: 1.2 }
    ]
  }

  const getRowKey = (row: MRPLPriceRow, index: number) => `${row.location}-${row.product}-${row.grade}-${index}`

  const getEffectiveMode = (type: 'qd' | 'mou', rowKey: string): 'monthly' | 'annual' => {
    const perRowOverride = toggleState.perRow[rowKey]?.[type]
    return perRowOverride || toggleState.global[type]
  }

  const calculateFinalPrice = (row: MRPLPriceRow, rowKey: string): number => {
    const mouMode = getEffectiveMode('mou', rowKey)
    
    const qdValue = 0.5 // QD is always 0.5
    const mouValue = mouMode === 'monthly' ? row.mouDiscount.monthly : row.mouDiscount.annual
    
    const transport = rateType === 'exPlant' ? (row.transport || 0) : 0
    const additionalDis = rateType === 'stockPoint' ? (row.additionalDiscount || 0) : 0
    const priceProtection = rateType === 'stockPoint' ? (row.priceProtection || 0) : 0
    
    return Number((row.priceAfterCD - qdValue - mouValue - row.xyzDiscount - row.sd - transport - additionalDis - priceProtection).toFixed(3))
  }

  const handleGlobalToggle = useCallback((type: 'qd' | 'mou', mode: 'monthly' | 'annual') => {
    setToggleState(prev => ({
      ...prev,
      global: {
        ...prev.global,
        [type]: mode
      }
    }))
  }, [])

  const handleRowToggle = useCallback((rowKey: string, type: 'qd' | 'mou') => {
    setToggleState(prev => {
      const currentMode = getEffectiveMode(type, rowKey)
      const newMode = currentMode === 'monthly' ? 'annual' : 'monthly'
      
      return {
        ...prev,
        perRow: {
          ...prev.perRow,
          [rowKey]: {
            ...prev.perRow[rowKey],
            [type]: newMode
          }
        }
      }
    })
  }, [])

  const handleResetAll = useCallback(() => {
    setToggleState({
      global: {
        qd: 'monthly',
        mou: 'monthly'
      },
      perRow: {}
    })
  }, [])

  const baseColumns: TableColumn[] = [
    { key: 'location', label: 'Location', width: '120px', align: 'left' },
    { key: 'product', label: 'Product', width: '140px', align: 'left' },
    { key: 'grade', label: 'Grade', width: '100px', align: 'center' },
    { key: 'basic', label: 'Basic', width: '100px', align: 'center', className: 'bg-yellow-100 font-semibold' },
    { key: 'cd', label: 'CD', width: '80px', align: 'center' },
    { key: 'priceAfterCD', label: 'Price after CD', width: '120px', align: 'center', className: 'bg-yellow-100' },
    { key: 'qd', label: 'QD', width: '100px', align: 'center' },
    { key: 'mouDiscount', label: 'MOU Discount', width: '120px', align: 'center' },
    { key: 'sd', label: 'SD', width: '80px', align: 'center' },
    { key: 'xyzDiscount', label: 'XYZ Discount', width: '120px', align: 'center', className: 'bg-yellow-100' }
  ]

  const stockPointColumns: TableColumn[] = [
    ...baseColumns,
    { key: 'additionalDiscount', label: 'Additional Dis', width: '120px', align: 'center' },
    { key: 'priceProtection', label: 'Price Protection', width: '120px', align: 'center' },
    { key: 'finalPrice', label: 'Final Price', width: '120px', align: 'center', className: 'bg-green-200 font-bold' },
    { key: 'totalDiscount', label: 'Total Discount', width: '120px', align: 'center' }
  ]

  const exPlantColumns: TableColumn[] = [
    ...baseColumns,
    { key: 'transport', label: 'Transport', width: '100px', align: 'center' },
    { key: 'finalPrice', label: 'Final Price', width: '120px', align: 'center', className: 'bg-green-200 font-bold' },
    { key: 'totalDiscount', label: 'Total Discount', width: '120px', align: 'center' }
  ]

  const columns = rateType === 'stockPoint' ? stockPointColumns : exPlantColumns
  const title = `${rateType === 'stockPoint' ? 'Stock Point Rate' : 'Ex-Plant Rate'}`

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading MRPL price data...</p>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 text-center text-gray-500">
          No MRPL price data available
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Global Toggle Controls with Reference Button - Full Width */}
      <div className="flex items-center justify-between">
        <MRPLToggleControls
          globalMOU={toggleState.global.mou}
          onMOUToggle={(mode) => handleGlobalToggle('mou', mode)}
          onResetAll={handleResetAll}
        />
        
        {/* Simple Toggle Button */}
        <motion.button
          onClick={() => setShowReferenceTables(!showReferenceTables)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showReferenceTables ? (
            <EyeOff className="w-4 h-4 text-gray-600" />
          ) : (
            <Eye className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {showReferenceTables ? 'Hide' : 'Show'} Reference Tables
          </span>
        </motion.button>
      </div>

      {/* Tables Row - Main Table + Reference Tables */}
      <div className={`grid gap-6 transition-all duration-300 ${showReferenceTables ? 'grid-cols-12' : 'grid-cols-1'}`}>
        {/* Main Price Table */}
        <div className={`${showReferenceTables ? 'col-span-8' : 'col-span-1'}`}>
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          <div className="bg-yellow-400 px-6 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black text-center">{title}</h3>
          </div>
          
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
                      <div className="flex items-center justify-center space-x-2">
                        <span>{column.label}</span>
                        {column.key === 'mouDiscount' && (
                          <div className="flex items-center space-x-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              toggleState.global.mou === 'monthly' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {toggleState.global.mou}
                            </span>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => {
                  const rowKey = getRowKey(row, rowIndex)
                  const qdMode = getEffectiveMode('qd', rowKey)
                  const mouMode = getEffectiveMode('mou', rowKey)
                  const finalPrice = calculateFinalPrice(row, rowKey)
                  
                  return (
                    <motion.tr 
                      key={rowKey}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                    >
                      {columns.map((column) => {
                        let value: any = row[column.key as keyof MRPLPriceRow]
                        let displayValue: any = value

                        // Handle special cases
                        if (column.key === 'qd') {
                          displayValue = '0.500' // QD is always 0.5
                        } else if (column.key === 'mouDiscount') {
                          const mouValue = mouMode === 'monthly' ? row.mouDiscount.monthly : row.mouDiscount.annual
                          displayValue = (
                            <div className="flex items-center justify-center space-x-2">
                              <span>{mouValue.toFixed(3)}</span>
                              <MRPLRowToggle
                                currentMode={mouMode}
                                hasOverride={!!toggleState.perRow[rowKey]?.mou}
                                onToggle={() => handleRowToggle(rowKey, 'mou')}
                                type="mou"
                              />
                            </div>
                          )
                        } else if (column.key === 'finalPrice') {
                          displayValue = finalPrice.toFixed(3)
                        } else if (typeof value === 'number') {
                          displayValue = value.toFixed(3)
                        } else if (value === undefined) {
                          displayValue = '0.000'
                        }
                        
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
                  )
                })}
              </tbody>
            </table>
          </div>
          </motion.div>
        </div>

        {/* Reference Tables - Only show when toggled */}
        {showReferenceTables && (
          <motion.div 
            className="col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <MRPLReferenceTables
              mouData={referenceData.mou}
              qdData={referenceData.qd}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EnhancedMRPLPriceTable