import { apiService } from '../../../shared/services/apiService'
import { SyncResult, SyncComparison, SyncConfig } from '../types'

export interface SyncApiServiceInterface {
  syncAllDealsToSheets(): Promise<SyncResult>
  syncDealsFromSheets(): Promise<SyncResult>
  syncDealToSheets(dealId: string): Promise<SyncResult>
  compareDeals(): Promise<SyncComparison>
  getStatus(): Promise<any>
  getConfig(): Promise<SyncConfig>
  updateConfig(config: Partial<SyncConfig>): Promise<SyncConfig>
}

class SyncApiService implements SyncApiServiceInterface {
  private readonly endpoint = '/sync'

  async syncAllDealsToSheets(): Promise<SyncResult> {
    try {
      const response = await apiService.post<SyncResult>(`${this.endpoint}/deals/to-sheets`)
      return response.data!
    } catch (error) {
      console.error('Failed to sync deals to sheets:', error)
      throw error
    }
  }

  async syncDealsFromSheets(): Promise<SyncResult> {
    try {
      const response = await apiService.post<SyncResult>(`${this.endpoint}/deals/from-sheets`)
      return response.data!
    } catch (error) {
      console.error('Failed to sync deals from sheets:', error)
      throw error
    }
  }

  async syncDealToSheets(dealId: string): Promise<SyncResult> {
    try {
      const response = await apiService.post<SyncResult>(`${this.endpoint}/deals/${dealId}/to-sheets`)
      return response.data!
    } catch (error) {
      console.error(`Failed to sync deal ${dealId} to sheets:`, error)
      throw error
    }
  }

  async compareDeals(): Promise<SyncComparison> {
    try {
      const response = await apiService.get<SyncComparison>(`${this.endpoint}/deals/compare`)
      return response.data!
    } catch (error) {
      console.error('Failed to compare deals:', error)
      throw error
    }
  }

  async getStatus(): Promise<any> {
    try {
      const response = await apiService.get<any>(`${this.endpoint}/status`)
      return response.data!
    } catch (error) {
      console.error('Failed to get sync status:', error)
      throw error
    }
  }

  async getConfig(): Promise<SyncConfig> {
    try {
      const response = await apiService.get<SyncConfig>(`${this.endpoint}/config`)
      return response.data!
    } catch (error) {
      console.error('Failed to get sync config:', error)
      throw error
    }
  }

  async updateConfig(config: Partial<SyncConfig>): Promise<SyncConfig> {
    try {
      const response = await apiService.put<SyncConfig>(`${this.endpoint}/config`, config)
      return response.data!
    } catch (error) {
      console.error('Failed to update sync config:', error)
      throw error
    }
  }
}

// Singleton instance
export const syncService = new SyncApiService()
export default SyncApiService