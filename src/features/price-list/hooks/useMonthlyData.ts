import { useState, useCallback } from 'react'
import PriceListService from '../services/priceListService'
import { CompanyType, RateType } from '../types'

export const useMonthlyData = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>()
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const priceListService = PriceListService.getInstance()

  const loadMonthlyData = useCallback(async (
    company: CompanyType, 
    rateType: RateType, 
    month: string
  ) => {
    setLoading(true)
    try {
      const data = await priceListService.getHistoricalData(company, rateType, month)
      setMonthlyData(data)
      setSelectedMonth(month)
    } catch (error) {
      console.error('Failed to load monthly data:', error)
      setMonthlyData([])
    } finally {
      setLoading(false)
    }
  }, [priceListService])

  const clearMonthlyData = useCallback(() => {
    setSelectedMonth(undefined)
    setMonthlyData([])
  }, [])

  const getAvailableMonths = useCallback(() => {
    return priceListService.getAvailableMonths().map(month => {
      const [year, monthNum] = month.split('-')
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return {
        value: month,
        label: `${monthNames[parseInt(monthNum) - 1]} ${year}`
      }
    })
  }, [priceListService])

  return {
    selectedMonth,
    monthlyData,
    loading,
    loadMonthlyData,
    clearMonthlyData,
    getAvailableMonths
  }
}