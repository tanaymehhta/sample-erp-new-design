import { AdditionalNotificationRequest, AdditionalNotificationResult } from '../types'

export interface AdditionalNotificationServiceInterface {
  sendNotification(request: AdditionalNotificationRequest): Promise<AdditionalNotificationResult>
}

class AdditionalNotificationService implements AdditionalNotificationServiceInterface {
  async sendNotification(request: AdditionalNotificationRequest): Promise<AdditionalNotificationResult> {
    try {
      // Validate phone number format (basic validation)
      if (!this.isValidPhoneNumber(request.phoneNumber)) {
        throw new Error('Invalid phone number format')
      }

      const response = await fetch('/api/whatsapp/send-additional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: request.phoneNumber,
          dealData: request.dealData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send notification')
      }

      return {
        success: true,
        phoneNumber: request.phoneNumber
      }
    } catch (error) {
      return {
        success: false,
        phoneNumber: request.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Check if it's a valid length (10-15 digits)
    return cleaned.length >= 10 && cleaned.length <= 15
  }
}

// Singleton instance following the modular pattern
export const additionalNotificationService = new AdditionalNotificationService()
export default AdditionalNotificationService