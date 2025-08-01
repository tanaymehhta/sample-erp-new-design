import * as fs from 'fs'
import * as path from 'path'

export class CredentialManager {
  private static instance: CredentialManager
  private credentials: any = {}

  static getInstance(): CredentialManager {
    if (!CredentialManager.instance) {
      CredentialManager.instance = new CredentialManager()
    }
    return CredentialManager.instance
  }

  /**
   * Load Google service account credentials from file
   * @returns Google service account configuration object
   */
  loadGoogleCredentials(): any {
    const credPath = process.env.GOOGLE_CREDENTIALS_PATH
    if (!credPath) {
      throw new Error('GOOGLE_CREDENTIALS_PATH environment variable not set')
    }
    
    if (!fs.existsSync(credPath)) {
      throw new Error(`Google credentials file not found: ${credPath}`)
    }

    try {
      const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'))
      
      // Validate required fields
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email']
      const missing = requiredFields.filter(field => !credentials[field])
      
      if (missing.length > 0) {
        throw new Error(`Invalid Google credentials: missing fields ${missing.join(', ')}`)
      }
      
      return credentials
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse Google credentials JSON: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Validate all required environment variables are present
   */
  validateRequiredEnvVars(): void {
    const required = [
      'GOOGLE_CREDENTIALS_PATH',
      'GOOGLE_SHEETS_ID',
      'WHATSAPP_API_TOKEN', 
      'TELEGRAM_API_TOKEN',
      'JWT_SECRET'
    ]

    const missing = required.filter(key => !process.env[key])
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

    // Validate JWT secret strength
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long')
    }
  }

  /**
   * Get environment variable with validation
   */
  getEnvVar(key: string, required: boolean = true): string | undefined {
    const value = process.env[key]
    if (required && !value) {
      throw new Error(`Environment variable ${key} is required but not set`)
    }
    return value
  }

  /**
   * Validate WhatsApp configuration
   */
  validateWhatsAppConfig(): void {
    const token = this.getEnvVar('WHATSAPP_API_TOKEN')
    const phoneId = this.getEnvVar('WHATSAPP_PHONE_NUMBER_ID')
    
    if (token && !token.startsWith('EAA')) {
      throw new Error('WHATSAPP_API_TOKEN appears to be invalid format')
    }
  }

  /**
   * Validate Telegram configuration
   */
  validateTelegramConfig(): void {
    const token = this.getEnvVar('TELEGRAM_API_TOKEN')
    
    if (token && !token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      throw new Error('TELEGRAM_API_TOKEN appears to be invalid format')
    }
  }

  /**
   * Perform comprehensive validation of all credentials
   */
  validateAllCredentials(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      this.validateRequiredEnvVars()
    } catch (error) {
      errors.push(error.message)
    }

    try {
      this.validateWhatsAppConfig()
    } catch (error) {
      errors.push(error.message)
    }

    try {
      this.validateTelegramConfig()
    } catch (error) {
      errors.push(error.message)
    }

    try {
      this.loadGoogleCredentials()
    } catch (error) {
      errors.push(error.message)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const credentialManager = CredentialManager.getInstance()