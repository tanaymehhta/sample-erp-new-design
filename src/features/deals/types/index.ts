import { BaseEntity } from '../../../shared/types/api'

export interface Deal extends BaseEntity {
  date: string
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: 'delivered' | 'pickup'
  productCode: string
  grade: string
  company: string
  specificGrade: string
  saleSource: 'new' | 'inventory'
  purchaseParty: string
  purchaseQuantity: number
  purchaseRate: number
  saleComments?: string
  purchaseComments?: string
  finalComments?: string
  warehouse?: string
}

export interface CreateDealRequest {
  date: string
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: 'delivered' | 'pickup'
  productCode: string
  grade?: string
  company?: string
  specificGrade?: string
  saleSource: 'new' | 'inventory'
  purchaseParty: string
  purchaseQuantity: number
  purchaseRate: number
  saleComments?: string
  purchaseComments?: string
  finalComments?: string
  warehouse?: string
  selectedInventoryItems?: Array<{id: string, quantity: number}>
}

export interface DealFilters {
  dateFrom?: string
  dateTo?: string
  saleParty?: string
  productCode?: string
  deliveryTerms?: 'delivered' | 'pickup'
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  // New business-friendly filters
  customers?: string[]
  suppliers?: string[]
  products?: string[]
  dealSource?: ('new' | 'inventory')[]
  warehouse?: string[]
  timeRange?: TimeRange
  quickFilter?: string
}

export type TimeRange = 
  | 'today'
  | 'this-week' 
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'custom'

export interface BusinessFilter {
  timeRange: TimeRange
  customers: string[]
  products: string[]
  suppliers: string[]
  deliveryMethod: ('delivered' | 'pickup')[]
  dealSource: ('new' | 'inventory')[]
  warehouse: string[]
  valueRange: [number, number] | null
  quantityRange: [number, number] | null
  searchTerm: string
}

export interface FilterPreset {
  id: string
  name: string
  description: string
  filters: BusinessFilter
  icon: string
}

export interface FilterInsights {
  totalDeals: number
  totalValue: number
  topCustomer: string | null
  avgDealSize: number
  timeFrameDescription: string
}

export interface DealSummary {
  totalDeals: number
  totalRevenue: number
  totalVolume: number
  avgDealSize: number
  topCustomers: Array<{
    name: string
    dealCount: number
    totalValue: number
  }>
  topProducts: Array<{
    code: string
    dealCount: number
    totalVolume: number
  }>
}

// Form validation types
export interface DealFormData {
  date: string
  saleParty: string
  quantitySold: number | string
  saleRate: number | string
  deliveryTerms: 'delivered' | 'pickup'
  productCode: string
  saleSource: 'new' | 'inventory'
  purchaseParty: string
  purchaseQuantity: number | string
  purchaseRate: number | string
  saleComments: string
  purchaseComments: string
  finalComments: string
  warehouse: string
}

export interface DealFormErrors {
  date?: string
  saleParty?: string
  quantitySold?: string
  saleRate?: string
  productCode?: string
  purchaseParty?: string
  purchaseQuantity?: string
  purchaseRate?: string
}