import { motion } from 'framer-motion'
import BasePriceTable from '../BasePriceTable'
import { SupremePriceRow, SupremeDiscountRow, TableColumn, RateType } from '../../types'

interface SupremePriceTableProps {
  data: SupremePriceRow[]
  discounts: SupremeDiscountRow[]
  rateType: RateType
  loading?: boolean
}

const SupremePriceTable = ({ data, discounts, rateType, loading }: SupremePriceTableProps) => {
  const mainTableColumns: TableColumn[] = [
    { key: 'location', label: 'Location', width: '120px', align: 'left' },
    { key: 'product', label: 'Product', width: '120px', align: 'left' },
    { key: 'grade', label: 'Grade', width: '100px', align: 'center' },
    { key: 'basic', label: 'Basic', width: '100px', align: 'center', className: 'bg-yellow-100 font-semibold', format: (val) => val?.toString() },
    { key: 'cd', label: 'CD', width: '80px', align: 'center', format: (val) => val?.toFixed(1) },
    { key: 'discount', label: 'Discount', width: '100px', align: 'center', format: (val) => val?.toFixed(1) },
    { key: 'transport', label: 'Transport', width: '100px', align: 'center', format: (val) => val?.toFixed(3) },
    { key: 'priceToPay', label: 'Price to Pay', width: '120px', align: 'center', className: 'bg-green-200 font-semibold', format: (val) => val?.toFixed(3) },
    { key: 'finalPrice', label: 'Final Price', width: '120px', align: 'center', className: 'bg-green-300 font-bold', format: (val) => val?.toFixed(3) }
  ]

  const discountTableColumns: TableColumn[] = [
    { key: 'qty', label: 'Qty (tons)', width: '120px', align: 'center', format: (val) => val?.toString() },
    { key: 'discount', label: 'Discount', width: '120px', align: 'center', format: (val) => val?.toString() },
    { key: 'perKgDiscount', label: 'Per kg discount', width: '140px', align: 'center', format: (val) => val?.toFixed(3) }
  ]

  const title = `${rateType === 'stockPoint' ? 'Stock Point Rate' : 'Ex-Plant Rate'}`

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading price data...</p>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading discounts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Price Table */}
      <div className="lg:col-span-2">
        <BasePriceTable
          data={data}
          columns={mainTableColumns}
          title={title}
          className="supreme-main-table"
        />
      </div>

      {/* Discount Table */}
      <div>
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-yellow-400 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black text-center">Supreme Discounts</h3>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0">
                <tr className="bg-yellow-50 border-b border-gray-200">
                  {discountTableColumns.map((column) => (
                    <th 
                      key={column.key}
                      className={`px-3 py-2 text-xs font-semibold text-gray-900 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map((row, rowIndex) => (
                  <motion.tr 
                    key={rowIndex}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                  >
                    {discountTableColumns.map((column) => {
                      const value = row[column.key as keyof SupremeDiscountRow]
                      const displayValue = column.format ? column.format(value) : value
                      
                      return (
                        <td 
                          key={column.key}
                          className={`px-3 py-2 text-xs ${
                            column.align === 'center' ? 'text-center' : 
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
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
      </div>
    </div>
  )
}

export default SupremePriceTable