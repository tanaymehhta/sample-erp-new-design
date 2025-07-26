import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, RefreshCw, Settings } from 'lucide-react'
import { SyncResult, SyncComparison, SyncConfig } from '../types'
import { syncService } from '../services/syncApiService'

interface SyncManagerProps {
  onSyncComplete?: (result: SyncResult) => void
}

export default function SyncManager({ onSyncComplete }: SyncManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<SyncResult | null>(null)
  const [comparison, setComparison] = useState<SyncComparison | null>(null)
  const [config, setConfig] = useState<SyncConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    loadSyncStatus()
    loadComparison()
  }, [])

  const loadSyncStatus = async () => {
    try {
      const status = await syncService.getStatus()
      setConfig(status.config)
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const loadComparison = async () => {
    try {
      const comp = await syncService.compareDeals()
      setComparison(comp)
    } catch (error) {
      console.error('Failed to load comparison:', error)
    }
  }

  const handleSyncToSheets = async () => {
    setIsLoading(true)
    try {
      const result = await syncService.syncAllDealsToSheets()
      setLastSync(result)
      await loadComparison()
      onSyncComplete?.(result)
    } catch (error) {
      console.error('Sync to sheets failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncFromSheets = async () => {
    setIsLoading(true)
    try {
      const result = await syncService.syncDealsFromSheets()
      setLastSync(result)
      await loadComparison()
      onSyncComplete?.(result)
    } catch (error) {
      console.error('Sync from sheets failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigUpdate = async (newConfig: Partial<SyncConfig>) => {
    try {
      const updated = await syncService.updateConfig(newConfig)
      setConfig(updated)
      setShowConfig(false)
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  const getSyncStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    if (lastSync?.success) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (lastSync && !lastSync.success) return <AlertCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sync Manager</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Sync Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          {getSyncStatusIcon()}
          <span className="font-medium">
            {isLoading ? 'Syncing...' : lastSync ? 'Last Sync' : 'Ready to Sync'}
          </span>
        </div>
        {lastSync && (
          <div className="text-sm text-gray-600">
            {lastSync.message} ({lastSync.synced} items processed)
            {lastSync.errors.length > 0 && (
              <span className="text-red-600 ml-2">
                {lastSync.errors.length} errors
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Comparison */}
      {comparison && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Database</h3>
            <p className="text-2xl font-bold text-blue-700">{comparison.databaseCount}</p>
            <p className="text-sm text-blue-600">deals</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Google Sheets</h3>
            <p className="text-2xl font-bold text-green-700">{comparison.sheetsCount}</p>
            <p className="text-sm text-green-600">rows</p>
          </div>
        </div>
      )}

      {/* Sync Actions */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleSyncToSheets}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Database → Google Sheets
        </button>

        <button
          onClick={handleSyncFromSheets}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Google Sheets → Database
        </button>

        <button
          onClick={loadComparison}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Comparison
        </button>
      </div>

      {/* Conflicts & Discrepancies */}
      {comparison && (comparison.missingInSheets.length > 0 || comparison.missingInDatabase.length > 0 || comparison.conflicts.length > 0) && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Issues Found</h3>
          
          {comparison.missingInSheets.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                Missing in Google Sheets: {comparison.missingInSheets.length} deals
              </p>
            </div>
          )}

          {comparison.missingInDatabase.length > 0 && (
            <div className="mb-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">
                Missing in Database: {comparison.missingInDatabase.length} deals
              </p>
            </div>
          )}

          {comparison.conflicts.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                Data Conflicts: {comparison.conflicts.length} fields differ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && config && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium text-gray-900 mb-3">Sync Configuration</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoSyncEnabled}
                onChange={(e) => handleConfigUpdate({ autoSyncEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable automatic sync</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conflict Resolution
              </label>
              <select
                value={config.conflictResolution}
                onChange={(e) => handleConfigUpdate({ conflictResolution: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="database_wins">Database Wins</option>
                <option value="sheets_wins">Google Sheets Wins</option>
                <option value="manual">Manual Resolution</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}