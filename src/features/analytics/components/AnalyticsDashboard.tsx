import React, { useState } from 'react'
import { KpiCards } from './KpiCards'
import { TimeRangeSelector } from './TimeRangeSelector'
import { VolumeChart } from './VolumeChart'
import { TopCustomersTable } from './TopCustomersTable'
import { TopProductsTable } from './TopProductsTable'
import { useAnalyticsDashboard } from '../hooks/useAnalytics'

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('this-month')
  const [compareWith, setCompareWith] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch all dashboard data
  const {
    kpi,
    volumeAnalysis,
    topCustomers,
    topProducts,
    summary,
    filterOptions,
    loading,
    error,
    refetch
  } = useAnalyticsDashboard({
    timeRange,
    compareWith: compareWith || undefined
  })

  if (error) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refetch}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'sales', name: 'Sales' },
    { id: 'products', name: 'Products' },
    { id: 'customers', name: 'Customers' }
  ]

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive business intelligence and insights
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              📅 Date Range
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              🔍 Filters
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              📊 Export Dashboard
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mt-6">
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
            compareWith={compareWith}
            onCompareChange={setCompareWith}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* KPI Cards - Always shown */}
      <KpiCards data={kpi} loading={loading} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Volume Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Business Performance</h2>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="last-6-months">Last 6 Months</option>
                  <option value="this-year">This Year</option>
                </select>
                <button className="text-sm text-gray-600 hover:text-gray-900">📊 Export</button>
              </div>
            </div>
            <VolumeChart 
              data={volumeAnalysis.chartData || []} 
              loading={loading}
              insights={volumeAnalysis.insights}
            />
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Customers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
                <button 
                  onClick={() => setActiveTab('customers')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <TopCustomersTable 
                data={topCustomers.data?.slice(0, 5) || []} 
                loading={loading}
                compact={true}
              />
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <TopProductsTable 
                data={topProducts.data?.slice(0, 5) || []} 
                loading={loading}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
            <VolumeChart 
              data={volumeAnalysis.chartData || []} 
              loading={loading}
              insights={volumeAnalysis.insights}
              mode="revenue"
            />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Performance</h2>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="volume">Sort by Volume</option>
                  <option value="revenue">Sort by Revenue</option>
                  <option value="deals">Sort by Deals</option>
                </select>
              </div>
            </div>
            <TopProductsTable 
              data={topProducts.data || []} 
              loading={loading}
              compact={false}
            />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume Analysis</h2>
            <VolumeChart 
              data={volumeAnalysis.chartData || []} 
              loading={loading}
              insights={volumeAnalysis.insights}
              mode="volume"
            />
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Customer Analysis</h2>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="volume">Sort by Volume</option>
                  <option value="revenue">Sort by Revenue</option>
                  <option value="deals">Sort by Deals</option>
                </select>
              </div>
            </div>
            <TopCustomersTable 
              data={topCustomers.data || []} 
              loading={loading}
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}