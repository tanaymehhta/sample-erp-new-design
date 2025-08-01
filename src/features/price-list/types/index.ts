export type CompanyType = 'supreme' | 'mrpl' | 'nayara'
export type RateType = 'stockPoint' | 'exPlant'

export interface BasePriceRow {
  location: string
  product: string
  grade: string
  basic: number
  cd: number
  priceAfterCD: number
  qd: number
  mouDiscount: number
  sd: number
  finalPrice: number
  totalDiscount: number
}

export interface DualModeValue {
  monthly: number
  annual: number
  currentMode: 'monthly' | 'annual'
}

export interface MRPLPriceRow extends Omit<BasePriceRow, 'qd' | 'mouDiscount'> {
  qd: DualModeValue
  mouDiscount: DualModeValue
  xyzDiscount: number
  additionalDiscount?: number
  priceProtection?: number
  transport?: number
}

export interface MRPLToggleState {
  global: {
    qd: 'monthly' | 'annual'
    mou: 'monthly' | 'annual'
  }
  perRow: Record<string, {
    qd?: 'monthly' | 'annual'
    mou?: 'monthly' | 'annual'
  }>
}

export interface MRPLReferenceTable {
  mou: Array<{
    type: 'Monthly' | 'Yearly'
    value: number
  }>
  qd: Array<{
    grade: string
    range: string
    discount: number
  }>
}

export interface NayaraPriceRow extends BasePriceRow {
  introductoryDiscount: number
  priceToPay: number
  postSaleDiscount?: number
  xyzDiscount: number
  transport?: number
}

export interface SupremePriceRow {
  location: string
  product: string
  grade: string
  basic: number
  cd: number
  discount: number
  transport: number
  priceToPay: number
  finalPrice: number
}

export interface SupremeDiscountRow {
  qty: number
  discount: number
  perKgDiscount: number
}

export interface CompanyPriceData {
  stockPoint: {
    current: BasePriceRow[] | MRPLPriceRow[] | NayaraPriceRow[] | SupremePriceRow[]
    historical: Record<string, BasePriceRow[] | MRPLPriceRow[] | NayaraPriceRow[] | SupremePriceRow[]>
  }
  exPlant: {
    current: BasePriceRow[] | MRPLPriceRow[] | NayaraPriceRow[] | SupremePriceRow[]
    historical: Record<string, BasePriceRow[] | MRPLPriceRow[] | NayaraPriceRow[] | SupremePriceRow[]>
  }
}

export interface PriceListState {
  selectedCompany: CompanyType
  selectedRateType: RateType
  showHistoricalData: boolean
  selectedMonth?: string
  loading: boolean
  error: string | null
}

export interface PriceListData {
  mrpl: CompanyPriceData
  nayara: CompanyPriceData
  supreme: {
    stockPoint: {
      current: { main: SupremePriceRow[], discounts: SupremeDiscountRow[] }
      historical: Record<string, { main: SupremePriceRow[], discounts: SupremeDiscountRow[] }>
    }
    exPlant: {
      current: { main: SupremePriceRow[], discounts: SupremeDiscountRow[] }
      historical: Record<string, { main: SupremePriceRow[], discounts: SupremeDiscountRow[] }>
    }
  }
}

export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  format?: (value: any) => string
}