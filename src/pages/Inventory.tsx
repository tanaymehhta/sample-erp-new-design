import { motion } from 'framer-motion'
import { Package, Plus, Grid, List, TrendingUp, Boxes, DollarSign, RefreshCw, Expand, Minimize } from 'lucide-react'
import { useGroupedInventory } from '../features/inventory/hooks/useGroupedInventory'
import { ExpandableInventoryRow } from '../features/inventory/components/ExpandableInventoryRow'

export default function Inventory() {
  const { 
    groupedInventory, 
    groupedSummary, 
    loading, 
    error, 
    refetch, 
    toggleExpansion, 
    isExpanded, 
    expandAll, 
    collapseAll, 
    expansionStats 
  } = useGroupedInventory()

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading inventory...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading inventory</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-primary-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your polymer stock levels</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={refetch}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="p-2 rounded-md bg-white shadow-sm">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-md">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Boxes className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Unique Products</p>
              <p className="text-xl font-bold text-gray-900 truncate">{groupedSummary.totalUniqueProducts}</p>
              <p className="text-xs text-gray-400 truncate">{groupedSummary.totalItems} total batches</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Total Quantity</p>
              <p className="text-xl font-bold text-gray-900 truncate">{groupedSummary.totalQuantity.toLocaleString()}kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-xl font-bold text-gray-900 truncate">₹{groupedSummary.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Avg. Rate</p>
              <p className="text-xl font-bold text-gray-900 truncate">₹{groupedSummary.totalQuantity > 0 ? Math.round(groupedSummary.totalValue / groupedSummary.totalQuantity) : 0}/kg</p>
            </div>
          </div>
        </div>
      </div>

      {groupedInventory.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items</h3>
            <p className="text-gray-600 mb-4">
              Your inventory is empty. Stock will be automatically added when you register deals with "New Material" source.
            </p>
            <button className="btn-primary">
              Add Manual Stock Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Inventory Items</h2>
                <p className="text-sm text-gray-500">
                  {groupedSummary.totalUniqueProducts} unique products • {groupedSummary.totalItems} total batches
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={collapseAll}
                  disabled={expansionStats.isNoneExpanded}
                  className="btn-secondary text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minimize className="w-4 h-4" />
                  <span>Collapse All</span>
                </button>
                <button
                  onClick={expandAll}
                  disabled={expansionStats.isAllExpanded}
                  className="btn-secondary text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Expand className="w-4 h-4" />
                  <span>Expand All</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Grade</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Company</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rate</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suppliers</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Purchase</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {groupedInventory.map((groupedItem) => (
                    <ExpandableInventoryRow
                      key={groupedItem.productKey}
                      groupedItem={groupedItem}
                      isExpanded={isExpanded(groupedItem.productKey)}
                      onToggleExpand={() => toggleExpansion(groupedItem.productKey)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {expansionStats.expandedCount > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {expansionStats.expandedCount} of {expansionStats.totalCount} products expanded
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}