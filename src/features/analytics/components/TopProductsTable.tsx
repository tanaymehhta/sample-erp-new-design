import React from 'react'
import { TopProduct } from '../services/analyticsService'

interface TopProductsTableProps {
  data: TopProduct[]
  loading: boolean
  compact?: boolean
}

function formatNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`
  }
  return `₹${num.toFixed(0)}`
}

function formatVolume(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K MT`
  }
  return `${num.toFixed(0)} MT`
}

export function TopProductsTable({ data, loading, compact = false }: TopProductsTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No product data available</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {data.map((product) => (
          <div key={`${product.productCode}-${product.company}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">#{product.rank}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.productCode}</p>
                <p className="text-sm text-gray-500">{product.company} • {product.grade}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatVolume(product.totalVolume)}</p>
              <p className="text-sm text-gray-500">{formatNumber(product.totalRevenue)}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volume (MT)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deals
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Rate
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Sale
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((product) => (
            <tr key={`${product.productCode}-${product.company}-${product.grade}`} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">#{product.rank}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.productCode}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.company}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.grade}</div>
                {product.specificGrade && (
                  <div className="text-xs text-gray-500">{product.specificGrade}</div>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-semibold text-gray-900">{formatVolume(product.totalVolume)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-semibold text-gray-900">{formatNumber(product.totalRevenue)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900">{product.dealCount}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900">₹{product.avgRate.toFixed(0)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.lastSaleDate}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}