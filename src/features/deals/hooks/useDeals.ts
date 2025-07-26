import { useState, useEffect, useCallback } from 'react'
import { Deal, DealFilters, CreateDealRequest } from '../types'
import { ApiError } from '../../../shared/types/api'
import { useDealService, useEventBus } from '../../../shared/providers/ServiceProvider'
import { EVENT_TYPES } from '../../../shared/services/eventBus'

interface UseDealsState {
  deals: Deal[]
  loading: boolean
  error: ApiError | null
  creating: boolean
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface UseDealsActions {
  fetchDeals: (filters?: DealFilters) => Promise<void>
  createDeal: (dealData: CreateDealRequest) => Promise<Deal | null>
  refreshDeals: () => Promise<void>
  clearError: () => void
}

export function useDeals(initialFilters?: DealFilters): UseDealsState & UseDealsActions {
  const dealService = useDealService()
  const eventBus = useEventBus()
  
  const [state, setState] = useState<UseDealsState>({
    deals: [],
    loading: false,
    error: null,
    creating: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    }
  })

  const [currentFilters, setCurrentFilters] = useState<DealFilters | undefined>(initialFilters)

  const fetchDeals = useCallback(async (filters?: DealFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      setCurrentFilters(filters)

      const response = await dealService.getDeals(filters)

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          deals: response.data || [],
          loading: false,
          pagination: response.pagination || prev.pagination
        }))
      } else {
        throw new Error(response.error || 'Failed to fetch deals')
      }
    } catch (error: any) {
      console.error('useDeals: Failed to fetch deals', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as ApiError
      }))
    }
  }, [dealService])

  const createDeal = useCallback(async (dealData: CreateDealRequest): Promise<Deal | null> => {
    try {
      setState(prev => ({ ...prev, creating: true, error: null }))

      const response = await dealService.createDeal(dealData)

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          creating: false,
          deals: [response.data!, ...prev.deals]
        }))
        return response.data
      } else {
        throw new Error(response.error || 'Failed to create deal')
      }
    } catch (error: any) {
      console.error('useDeals: Failed to create deal', error)
      setState(prev => ({
        ...prev,
        creating: false,
        error: error as ApiError
      }))
      return null
    }
  }, [dealService])

  const refreshDeals = useCallback(async () => {
    await fetchDeals(currentFilters)
  }, [fetchDeals, currentFilters])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Listen for deal events from other parts of the app
  useEffect(() => {
    const unsubscribeCreated = eventBus.subscribe(EVENT_TYPES.DEAL_CREATED, (event) => {
      const newDeal = event.payload as Deal
      setState(prev => {
        // Check if deal already exists to avoid duplicates
        const exists = prev.deals.some(deal => deal.id === newDeal.id)
        if (!exists) {
          return {
            ...prev,
            deals: [newDeal, ...prev.deals]
          }
        }
        return prev
      })
    })

    const unsubscribeUpdated = eventBus.subscribe(EVENT_TYPES.DEAL_UPDATED, (event) => {
      const updatedDeal = event.payload as Deal
      setState(prev => ({
        ...prev,
        deals: prev.deals.map(deal => 
          deal.id === updatedDeal.id ? updatedDeal : deal
        )
      }))
    })

    const unsubscribeDeleted = eventBus.subscribe(EVENT_TYPES.DEAL_DELETED, (event) => {
      const { id } = event.payload
      setState(prev => ({
        ...prev,
        deals: prev.deals.filter(deal => deal.id !== id)
      }))
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
    }
  }, [eventBus])

  // Auto-fetch deals on mount
  useEffect(() => {
    fetchDeals(initialFilters)
  }, [fetchDeals, initialFilters])

  return {
    ...state,
    fetchDeals,
    createDeal,
    refreshDeals,
    clearError
  }
}