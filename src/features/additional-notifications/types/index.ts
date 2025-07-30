export interface AdditionalNotificationRequest {
  phoneNumber: string
  dealData: any
}

export interface AdditionalNotificationResult {
  success: boolean
  phoneNumber: string
  error?: string
}