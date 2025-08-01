import EnhancedMRPLPriceTable from './EnhancedMRPLPriceTable'
import { MRPLPriceRow, RateType } from '../../types'

interface MRPLPriceTableProps {
  data: MRPLPriceRow[]
  rateType: RateType
  loading?: boolean
}

const MRPLPriceTable = ({ data, rateType, loading }: MRPLPriceTableProps) => {
  return (
    <EnhancedMRPLPriceTable
      data={data}
      rateType={rateType}
      loading={loading}
    />
  )
}

export default MRPLPriceTable