import { useState, useCallback } from 'react'
import { additionalNotificationService } from '../services/additionalNotificationService'
import { AdditionalNotificationResult } from '../types'

export const useAdditionalNotification = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AdditionalNotificationResult | null>(null)

  const sendNotification = useCallback(async (phoneNumber: string, dealData: any) => {
    if (!phoneNumber?.trim()) {
      return null // Skip if no phone number provided
    }

    setIsLoading(true)
    setResult(null)

    try {
      const result = await additionalNotificationService.sendNotification({
        phoneNumber: phoneNumber.trim(),
        dealData
      })
      
      setResult(result)
      return result
    } catch (error) {
      const errorResult: AdditionalNotificationResult = {
        success: false,
        phoneNumber: phoneNumber.trim(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      setResult(errorResult)
      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
  }, [])

  return {
    sendNotification,
    isLoading,
    result,
    clearResult
  }
}

export default useAdditionalNotification