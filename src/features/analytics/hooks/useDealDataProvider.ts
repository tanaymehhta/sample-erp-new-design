// Deal Data Provider Hook - Implements interface for loose coupling
// Following CLAUDE.md: Dependency injection via hooks, interface implementation

import { useMemo } from 'react'
import { DealDataProvider, Deal, Customer, TimeRange } from '../types'

class ApiDealDataProvider implements DealDataProvider {
  async getDeals(timeRange?: TimeRange): Promise<Deal[]> {
    try {
      console.log('ApiDealDataProvider: Fetching deals from /api/deals')
      const response = await fetch('/api/deals')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('ApiDealDataProvider: Raw API response:', result)
      
      if (!result.success) {
        throw new Error(`API Error: ${result.message || 'Failed to fetch deals'}`)
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('API returned invalid data format - expected array')
      }
      
      console.log('ApiDealDataProvider: Processing', result.data.length, 'raw deals')
      
      // Transform actual deal structure to analytics interface
      const transformedDeals = result.data.map((deal: any, index: number): Deal => {
        try {
          // Validate required fields
          if (!deal.saleParty) {
            console.warn(`Deal ${index}: Missing saleParty, using 'Unknown Customer'`)
          }
          if (!deal.date) {
            throw new Error(`Deal ${index}: Missing date field`)
          }
          if (typeof deal.quantitySold !== 'number' || deal.quantitySold <= 0) {
            throw new Error(`Deal ${index}: Invalid quantitySold: ${deal.quantitySold}`)
          }
          if (typeof deal.saleRate !== 'number' || deal.saleRate <= 0) {
            throw new Error(`Deal ${index}: Invalid saleRate: ${deal.saleRate}`)
          }
          
          const productName = [deal.company, deal.grade, deal.specificGrade]
            .filter(Boolean)
            .join(' ')
            .trim() || deal.productCode || 'Unknown Product'
          
          return {
            id: deal.id || `deal-${index}`,
            customerId: deal.saleParty || 'Unknown Customer',
            customerName: deal.saleParty || 'Unknown Customer',
            productId: deal.productCode || 'unknown',
            productName,
            totalAmount: deal.quantitySold * deal.saleRate,
            quantity: deal.quantitySold,
            rate: deal.saleRate,
            dealDate: deal.date, // Expecting dd-mm-yyyy format
            status: 'completed'
          }
        } catch (error) {
          console.error(`ApiDealDataProvider: Error processing deal ${index}:`, error, deal)
          throw new Error(`Invalid deal data at index ${index}: ${error.message}`)
        }
      })
      
      console.log('ApiDealDataProvider: Successfully transformed', transformedDeals.length, 'deals')
      return transformedDeals
      
    } catch (error) {
      console.error('ApiDealDataProvider: Error fetching/processing deals:', error)
      throw new Error(`Failed to load deals: ${error.message}`)
    }
  }

  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('ApiDealDataProvider: Fetching customers from /api/customers')
      const response = await fetch('/api/customers')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('ApiDealDataProvider: Raw customers response:', result)
      
      if (!result.success) {
        throw new Error(`API Error: ${result.message || 'Failed to fetch customers'}`)
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('API returned invalid customer data format - expected array')
      }
      
      console.log('ApiDealDataProvider: Processing', result.data.length, 'raw customers')
      
      // Transform API response to our interface
      const transformedCustomers = result.data.map((customer: any, index: number): Customer => {
        try {
          // The actual field is 'partyName', not 'name'
          const customerName = customer.partyName || customer.name
          if (!customerName) {
            throw new Error(`Customer ${index}: Missing partyName/name field`)
          }
          
          return {
            id: customerName, // Use partyName as ID since that's what we use in deals
            name: customerName,
            contactPerson: customer.contactPerson || customerName,
            phone: customer.phone || '',
            email: customer.email || ''
          }
        } catch (error) {
          console.error(`ApiDealDataProvider: Error processing customer ${index}:`, error, customer)
          throw new Error(`Invalid customer data at index ${index}: ${error.message}`)
        }
      })
      
      console.log('ApiDealDataProvider: Successfully transformed', transformedCustomers.length, 'customers')
      return transformedCustomers
      
    } catch (error) {
      console.error('ApiDealDataProvider: Error fetching/processing customers:', error)
      throw new Error(`Failed to load customers: ${error.message}`)
    }
  }
}

// NO MOCK DATA - Real API only

export function useDealDataProvider(): DealDataProvider {
  return useMemo(() => {
    console.log('useDealDataProvider: Using ApiDealDataProvider - NO MOCK DATA')
    return new ApiDealDataProvider()
  }, [])
}