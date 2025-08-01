import { useState, useEffect, useCallback } from 'react'
import { PriceListState, CompanyType, RateType } from '../types'
import PriceListService from '../services/priceListService'

export const usePriceList = () => {
  const [state, setState] = useState<PriceListState>({
    selectedCompany: 'mrpl',
    selectedRateType: 'stockPoint',
    showHistoricalData: false,
    selectedMonth: undefined,
    loading: false,
    error: null
  })

  const [priceData, setPriceData] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [supremeDiscounts, setSupremeDiscounts] = useState<any[]>([])

  const priceListService = PriceListService.getInstance()

  const loadPriceData = useCallback(async (company: CompanyType, rateType: RateType) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await priceListService.getPriceData(company, rateType)
      setPriceData(data)
      
      // Load Supreme discounts if needed
      if (company === 'supreme') {
        const discounts = await priceListService.getSupremeDiscounts(rateType)
        setSupremeDiscounts(discounts)
      } else {
        setSupremeDiscounts([])
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load price data' 
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [priceListService])

  const loadHistoricalData = useCallback(async (company: CompanyType, rateType: RateType, month: string) => {
    try {
      const data = await priceListService.getHistoricalData(company, rateType, month)
      setHistoricalData(data)
    } catch (error) {
      console.error('Failed to load historical data:', error)
      setHistoricalData([])
    }
  }, [priceListService])

  const setSelectedCompany = useCallback((company: CompanyType) => {
    setState(prev => ({ ...prev, selectedCompany: company }))
  }, [])

  const setSelectedRateType = useCallback((rateType: RateType) => {
    setState(prev => ({ ...prev, selectedRateType: rateType }))
  }, [])

  const toggleHistoricalData = useCallback(() => {
    setState(prev => ({ ...prev, showHistoricalData: !prev.showHistoricalData }))
  }, [])

  const setSelectedMonth = useCallback((month: string | undefined) => {
    setState(prev => ({ ...prev, selectedMonth: month }))
    if (month) {
      loadHistoricalData(state.selectedCompany, state.selectedRateType, month)
    } else {
      setHistoricalData([])
    }
  }, [state.selectedCompany, state.selectedRateType, loadHistoricalData])

  const getAvailableMonths = useCallback(() => {
    return priceListService.getAvailableMonths()
  }, [priceListService])

  // Load data when company or rate type changes
  useEffect(() => {
    loadPriceData(state.selectedCompany, state.selectedRateType)
  }, [state.selectedCompany, state.selectedRateType, loadPriceData])

  // Load historical data when month is selected
  useEffect(() => {
    if (state.selectedMonth && state.showHistoricalData) {
      loadHistoricalData(state.selectedCompany, state.selectedRateType, state.selectedMonth)
    }
  }, [state.selectedMonth, state.showHistoricalData, state.selectedCompany, state.selectedRateType, loadHistoricalData])

  return {
    ...state,
    priceData,
    historicalData,
    supremeDiscounts,
    setSelectedCompany,
    setSelectedRateType,
    toggleHistoricalData,
    setSelectedMonth,
    getAvailableMonths,
    refresh: () => loadPriceData(state.selectedCompany, state.selectedRateType)
  }
}