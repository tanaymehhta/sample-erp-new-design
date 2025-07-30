import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Package2, Calendar, User, DollarSign } from 'lucide-react'
import { GroupedInventoryItem } from '../utils/inventoryGrouper'
import { InventoryItem } from '../services/inventoryService'

interface ExpandableInventoryRowProps {
  groupedItem: GroupedInventoryItem
  isExpanded: boolean
  onToggleExpand: () => void
}

export function ExpandableInventoryRow({ 
  groupedItem, 
  isExpanded, 
  onToggleExpand 
}: ExpandableInventoryRowProps) {
  return (
    <>
      {/* Main Row - Aggregated Data */}
      <tr 
        className={`
          hover:bg-gray-50 cursor-pointer border-b border-gray-200 transition-all duration-200
          ${isExpanded ? 'bg-blue-50 hover:bg-blue-100' : ''}
        `}
        onClick={onToggleExpand}
      >
        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-blue-500 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 hover:text-blue-500" />
            )}
            <span className="font-semibold">{groupedItem.productCode}</span>
            {groupedItem.purchaseCount > 1 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {groupedItem.purchaseCount} batches
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 w-24">
          <div className="truncate">{groupedItem.grade}</div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 w-12">
          <div className="truncate">{groupedItem.company}</div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
          <div className="truncate max-w-[100px]">{groupedItem.totalQuantity.toLocaleString()}kg</div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
          <div className="truncate max-w-[80px]">₹{Math.round(groupedItem.averageRate)}/kg</div>
          <div className="text-xs text-gray-500">avg rate</div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
          <div className="truncate max-w-[120px]">₹{groupedItem.totalValue.toLocaleString()}</div>
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
          {groupedItem.purchaseCount > 1 ? 'Multiple suppliers' : groupedItem.purchases[0].purchaseParty}
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
          {groupedItem.lastPurchaseDate}
          {groupedItem.purchaseCount > 1 && (
            <div className="text-xs text-gray-400">latest</div>
          )}
        </td>
      </tr>

      {/* Expandable Detail Rows */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={8} className="px-0 py-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: 'easeInOut',
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="overflow-hidden bg-gradient-to-r from-gray-50 to-blue-50"
              >
                <div className="px-6 py-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Package2 className="w-4 h-4 mr-2" />
                      Purchase History ({groupedItem.purchaseCount} {groupedItem.purchaseCount === 1 ? 'batch' : 'batches'})
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {groupedItem.purchases.map((purchase, index) => (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: {
                            delay: index * 0.1, // Stagger each row by 0.1s
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          y: -10, 
                          scale: 0.95,
                          transition: {
                            delay: (groupedItem.purchases.length - 1 - index) * 0.05, // Reverse stagger for exit
                            duration: 0.2,
                            ease: "easeIn"
                          }
                        }}
                      >
                        <PurchaseDetailRow 
                          purchase={purchase} 
                          index={index + 1}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

interface PurchaseDetailRowProps {
  purchase: InventoryItem
  index: number
}

function PurchaseDetailRow({ purchase, index }: PurchaseDetailRowProps) {
  const purchaseValue = purchase.quantity * purchase.rate

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-start space-x-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500">Purchase Date</div>
            <div className="text-sm font-medium text-gray-900">{purchase.dateAdded}</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Package2 className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">Quantity</div>
            <div className="text-sm font-medium text-gray-900 truncate">{purchase.quantity.toLocaleString()}kg</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">Rate</div>
            <div className="text-sm font-medium text-gray-900 truncate">₹{purchase.rate}/kg</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">Supplier</div>
            <div className="text-sm font-medium text-gray-900 truncate">{purchase.purchaseParty}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Batch ID: {purchase.id.slice(-8)}
        </div>
        <div className="text-sm font-medium text-gray-900 truncate">
          Total Value: ₹{purchaseValue.toLocaleString()}
        </div>
      </div>
    </div>
  )
}