import BasePriceTable from '../BasePriceTable'
import { NayaraPriceRow, TableColumn, RateType } from '../../types'

interface NayaraPriceTableProps {
  data: NayaraPriceRow[]
  rateType: RateType
  loading?: boolean
}

const NayaraPriceTable = ({ data, rateType, loading }: NayaraPriceTableProps) => {
  const baseColumns: TableColumn[] = [
    { key: 'location', label: 'Location', width: '120px', align: 'left' },
    { key: 'product', label: 'Product', width: '140px', align: 'left' },
    { key: 'grade', label: 'Grade', width: '100px', align: 'center' },
    { key: 'basic', label: 'Basic', width: '100px', align: 'center', className: 'bg-yellow-100 font-semibold', format: (val) => val?.toFixed(2) },
    { key: 'cd', label: 'CD', width: '80px', align: 'center', format: (val) => val?.toFixed(2) },
    { key: 'mouDiscount', label: 'MOU Discount', width: '120px', align: 'center', format: (val) => val?.toFixed(2) },
    { key: 'introductoryDiscount', label: 'Introductory Discount', width: '140px', align: 'center', format: (val) => val?.toFixed(2) },
    { key: 'priceToPay', label: 'Price to Pay', width: '120px', align: 'center', className: 'bg-green-200 font-semibold', format: (val) => val?.toFixed(2) }
  ]

  const stockPointColumns: TableColumn[] = [
    ...baseColumns,
    { key: 'finalPrice', label: 'Final Price', width: '120px', align: 'center', className: 'bg-green-300 font-bold', format: (val) => val?.toFixed(2) },
    { key: 'totalDiscount', label: 'Total Discount', width: '120px', align: 'center', format: (val) => val?.toFixed(2) }
  ]

  const exPlantColumns: TableColumn[] = [
    ...baseColumns,
    { key: 'postSaleDiscount', label: 'Post Sale Discount', width: '140px', align: 'center', format: (val) => val?.toFixed(2) || '0.00' },
    { key: 'xyzDiscount', label: 'XYZ Discount', width: '120px', align: 'center', format: (val) => val?.toFixed(2) },
    { key: 'transport', label: 'Transport', width: '100px', align: 'center', format: (val) => val?.toFixed(2) },
    { key: 'finalPrice', label: 'Final Price', width: '120px', align: 'center', className: 'bg-green-300 font-bold', format: (val) => val?.toFixed(2) },
    { key: 'totalDiscount', label: 'Total Discount', width: '120px', align: 'center', format: (val) => val?.toFixed(2) }
  ]

  const columns = rateType === 'stockPoint' ? stockPointColumns : exPlantColumns
  const title = `${rateType === 'stockPoint' ? 'Stock Point Rate' : 'Ex-Plant Rate'}`

  return (
    <BasePriceTable
      data={data}
      columns={columns}
      loading={loading}
      title={title}
      className="nayara-price-table"
    />
  )
}

export default NayaraPriceTable