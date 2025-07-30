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