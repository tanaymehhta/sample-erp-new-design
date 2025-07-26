import React, { useState, useEffect } from 'react'
import { Package, Plus, Minus, Check, AlertCircle } from 'lucide-react'
import { inventoryService, InventoryItem } from '../services/inventoryService'

interface SelectedInventoryItem {
  id: string
  selectedQuantity: number
  availableQuantity: number
  selectionOrder: number
  item: InventoryItem
}

interface InventorySelectorProps {
  productCode: string
  grade: string
  company: string
  specificGrade: string
  requiredQuantity: number
  onSelectionChange: (selectedItems: Array<{id: string, quantity: number}>) => void
  onProductAutoFill?: (item: InventoryItem) => void
}

export default function InventorySelector({
  productCode,
  grade,
  company,
  specificGrade,
  requiredQuantity,
  onSelectionChange,
  onProductAutoFill
}: InventorySelectorProps) {
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedInventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextSelectionOrder, setNextSelectionOrder] = useState(1)

  // Load available inventory items when product details change
  useEffect(() => {
    if (productCode && grade && company && specificGrade) {
      loadAvailableItems()
    } else {
      setAvailableItems([])
      setSelectedItems([])
    }
  }, [productCode, grade, company, specificGrade])

  // Update parent when selection changes
  useEffect(() => {
    const selectionData = selectedItems.map(sel => ({
      id: sel.id,
      quantity: sel.selectedQuantity
    }))
    onSelectionChange(selectionData)
  }, [selectedItems, onSelectionChange])

  const loadAvailableItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await inventoryService.getAvailableInventoryItems(
        productCode, grade, company, specificGrade
      )
      
      if (response.success && response.data) {
        setAvailableItems(response.data)
        
        // Auto-fill product details from first item if callback provided
        if (response.data.length > 0 && onProductAutoFill) {
          onProductAutoFill(response.data[0])
        }
      } else {
        setError('Failed to load inventory items')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: InventoryItem) => {
    const existingIndex = selectedItems.findIndex(sel => sel.id === item.id)
    
    if (existingIndex >= 0) {
      // Remove existing selection and reorder remaining items
      const updated = [...selectedItems]
      updated.splice(existingIndex, 1)
      setSelectedItems(updated)
      return
    }

    // Calculate how much we still need
    const currentTotal = getTotalSelected()
    const remainingNeeded = requiredQuantity - currentTotal
    
    if (remainingNeeded <= 0) {
      // Already have enough, don't allow more selection
      return
    }

    // Determine how much to select from this item
    const amountToSelect = Math.min(remainingNeeded, item.quantity)
    
    // Add new selection
    const newSelection: SelectedInventoryItem = {
      id: item.id,
      selectedQuantity: amountToSelect,
      availableQuantity: item.quantity,
      selectionOrder: nextSelectionOrder,
      item
    }
    
    setSelectedItems([...selectedItems, newSelection])
    setNextSelectionOrder(nextSelectionOrder + 1)
  }

  const handleQuantityChange = (item: InventoryItem, newQuantity: number) => {
    const existingIndex = selectedItems.findIndex(sel => sel.id === item.id)
    
    if (existingIndex >= 0) {
      const updated = [...selectedItems]
      if (newQuantity <= 0) {
        // Remove selection
        updated.splice(existingIndex, 1)
      } else {
        // Update quantity (but don't allow exceeding available or causing excess total)
        const maxAllowed = Math.min(
          item.quantity,
          newQuantity + (requiredQuantity - getTotalSelected())
        )
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          selectedQuantity: Math.min(newQuantity, maxAllowed)
        }
      }
      setSelectedItems(updated)
    }
  }

  const getTotalSelected = () => {
    return selectedItems.reduce((sum, sel) => sum + sel.selectedQuantity, 0)
  }

  const getSelectionStatus = () => {
    const total = getTotalSelected()
    if (total === 0) return { color: 'text-gray-500', text: 'No items selected' }
    if (total < requiredQuantity) return { color: 'text-yellow-600', text: `Need ${requiredQuantity - total}kg more` }
    if (total === requiredQuantity) return { color: 'text-green-600', text: 'Perfect match!' }
    return { color: 'text-red-600', text: `${total - requiredQuantity}kg excess selected` }
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Package className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className="ml-2 text-blue-700">Loading available inventory...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="ml-2 text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  if (availableItems.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Package className="w-5 h-5 text-yellow-500" />
          <span className="ml-2 text-yellow-700">
            No inventory available for {productCode} - {grade} - {company} - {specificGrade}
          </span>
        </div>
      </div>
    )
  }

  const status = getSelectionStatus()

  return (
    <div className="space-y-4">
      {/* Selection Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Selection Status:</span>
            <span className={`ml-2 text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Required: {requiredQuantity}kg</div>
            <div className="text-sm font-medium text-gray-900">Selected: {getTotalSelected()}kg</div>
            {selectedItems.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                From {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        
        {/* Selection Order Display */}
        {selectedItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Selection Order:</div>
            <div className="flex flex-wrap gap-2">
              {selectedItems
                .sort((a, b) => a.selectionOrder - b.selectionOrder)
                .map((sel, index) => (
                  <div
                    key={sel.id}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    <span className="font-medium">{index + 1}.</span>
                    <span>{sel.selectedQuantity}kg from {sel.item.purchaseParty}</span>
                    <span className="text-blue-600">(₹{sel.item.rate}/kg)</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Inventory Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">
          Available Inventory ({availableItems.length} items)
        </h4>
        
        {availableItems.map((item) => {
          const selected = selectedItems.find(sel => sel.id === item.id)
          const selectedQuantity = selected?.selectedQuantity || 0
          const remainingNeeded = requiredQuantity - getTotalSelected()
          const canSelect = remainingNeeded > 0 || selectedQuantity > 0
          
          return (
            <InventoryItemCard
              key={item.id}
              item={item}
              selectedQuantity={selectedQuantity}
              selectionOrder={selected?.selectionOrder}
              canSelect={canSelect}
              remainingNeeded={remainingNeeded}
              onItemClick={() => handleItemClick(item)}
              onQuantityChange={(quantity) => handleQuantityChange(item, quantity)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface InventoryItemCardProps {
  item: InventoryItem
  selectedQuantity: number
  selectionOrder?: number
  canSelect: boolean
  remainingNeeded: number
  onItemClick: () => void
  onQuantityChange: (quantity: number) => void
}

function InventoryItemCard({ 
  item, 
  selectedQuantity, 
  selectionOrder, 
  canSelect, 
  remainingNeeded, 
  onItemClick, 
  onQuantityChange 
}: InventoryItemCardProps) {
  const [inputQuantity, setInputQuantity] = useState(selectedQuantity.toString())

  useEffect(() => {
    setInputQuantity(selectedQuantity.toString())
  }, [selectedQuantity])

  const handleQuantitySubmit = () => {
    const quantity = Math.max(0, parseFloat(inputQuantity) || 0)
    onQuantityChange(quantity)
  }

  const isSelected = selectedQuantity > 0
  const stockLevel = item.quantity < 1000 ? 'low' : 'good'
  const willSelectQuantity = isSelected ? selectedQuantity : Math.min(remainingNeeded, item.quantity)

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 
      !canSelect ? 'border-gray-200 bg-gray-50 opacity-75' :
      'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-gray-900">{item.productCode}</h3>
            {isSelected && selectionOrder && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                #{selectionOrder}
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              ₹{item.rate}/kg
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              stockLevel === 'low' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {item.quantity.toLocaleString()}kg
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{item.company}</span> • {item.grade}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Value: ₹{(item.quantity * item.rate).toLocaleString()}</span>
            <span>Supplier: {item.purchaseParty}</span>
            <span>Added: {item.dateAdded}</span>
          </div>

          {/* Smart Selection Preview */}
          {!isSelected && canSelect && remainingNeeded > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              Click to select {willSelectQuantity.toLocaleString()}kg 
              ({remainingNeeded >= item.quantity ? 'full amount' : 'remaining needed'})
            </div>
          )}
        </div>

        {/* Selection Controls */}
        <div className="flex items-center gap-2 ml-4">
          {isSelected ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
                onBlur={handleQuantitySubmit}
                onKeyPress={(e) => e.key === 'Enter' && handleQuantitySubmit()}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max={item.quantity}
                step="0.1"
              />
              <span className="text-xs text-gray-500">kg</span>
              <button
                onClick={onItemClick}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Remove selection"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onItemClick}
              disabled={!canSelect}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${
                canSelect 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              {canSelect ? 'Select' : 'Full'}
            </button>
          )}
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Selected {selectedQuantity.toLocaleString()}kg of {item.quantity.toLocaleString()}kg
              </span>
            </div>
            <div className="text-sm text-gray-600">
              ₹{(selectedQuantity * item.rate).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}