import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Save, 
  Calendar, 
  User, 
  Package, 
  Truck, 
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { SearchableAutoComplete } from '../../../shared/components'
import { createSearchableProductOptions } from '../../../shared/utils/productSearch'
import { useDeals } from '../hooks/useDeals'
import { DealFormData, CreateDealRequest } from '../types'
import { productService } from '../../customers/services/productService'
import { customerService } from '../../customers/services/customerService'
import InventorySelector from '../../inventory/components/InventorySelector'
import { InventoryItem } from '../../inventory/services/inventoryService'
import { AdditionalNotificationInput, useAdditionalNotification } from '../../additional-notifications'
import toast from 'react-hot-toast'

// Utility function to format date as DD-MM-YYYY for display/API
const formatDateToDDMMYYYY = (date: Date = new Date()): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

interface NewDealFormProps {
  onSuccess?: (deal: any) => void
  onCancel?: () => void
}

export default function NewDealForm({ onSuccess, onCancel }: NewDealFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<Array<{id: string, quantity: number}>>([])
  const [hasInventoryForProduct, setHasInventoryForProduct] = useState(false)
  const [additionalPhoneNumber, setAdditionalPhoneNumber] = useState('')

  const { createDeal, creating } = useDeals()
  const { sendNotification: sendAdditionalNotification } = useAdditionalNotification()
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors },
    reset
  } = useForm<DealFormData>({
    defaultValues: {
      date: formatDateToDDMMYYYY(),
      deliveryTerms: 'delivered',
      saleSource: 'new'
    }
  })

  const productCode = watch('productCode')
  const saleSource = watch('saleSource')

  // Load initial data via APIs
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true)
        
        // Load all data via API calls
        const [customersRes, suppliersRes, productsRes] = await Promise.all([
          customerService.getCustomers(),
          customerService.getSuppliers(),
          productService.getProducts()
        ])

        if (customersRes.success) setCustomers(customersRes.data || [])
        if (suppliersRes.success) setSuppliers(suppliersRes.data || [])
        if (productsRes.success) setProducts(productsRes.data || [])

      } catch (error) {
        console.error('Failed to load initial data:', error)
        toast.error('Failed to load form data. Please refresh the page.')
      } finally {
        setLoadingData(false)
      }
    }

    loadInitialData()
  }, [])

  // Auto-fill product details when product code changes
  useEffect(() => {
    if (productCode) {
      const product = products.find(p => p.productCode === productCode)
      setSelectedProduct(product)
      
      // Check if inventory exists for this product
      if (product) {
        checkInventoryAvailability(product)
      }
    } else {
      setSelectedProduct(null)
      setHasInventoryForProduct(false)
    }
  }, [productCode, products])

  const checkInventoryAvailability = async (product: any) => {
    try {
      // Check if inventory exists for this specific product
      const url = `/api/inventory/available/${encodeURIComponent(product.productCode)}/${encodeURIComponent(product.grade)}/${encodeURIComponent(product.company)}/${encodeURIComponent(product.specificGrade)}`
      console.log('Checking inventory availability for:', url)
      
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        console.log('Inventory check result:', result)
        setHasInventoryForProduct(result.success && result.data && result.data.length > 0)
      } else {
        console.error('Inventory check failed with status:', response.status)
        setHasInventoryForProduct(false)
      }
    } catch (error) {
      console.error('Failed to check inventory availability:', error)
      setHasInventoryForProduct(false)
    }
  }

  const handleInventorySelection = (selectedItems: Array<{id: string, quantity: number}>) => {
    setSelectedInventoryItems(selectedItems)
  }

  const handleProductAutoFill = (inventoryItem: InventoryItem) => {
    // Auto-fill product details from selected inventory item
    if (inventoryItem) {
      setValue('productCode', inventoryItem.productCode)
      // Other product details are already set via product selection
    }
  }

  const onSubmit = async (data: DealFormData) => {
    try {
      // Convert YYYY-MM-DD to DD-MM-YYYY format
      const convertedDate = data.date.includes('-') && data.date.length === 10 && data.date.charAt(4) === '-' 
        ? data.date.split('-').reverse().join('-') // Convert YYYY-MM-DD to DD-MM-YYYY
        : data.date // Keep as is if already in DD-MM-YYYY format

      // Convert form data to API format
      const dealData: CreateDealRequest & { selectedInventoryItems?: Array<{id: string, quantity: number}> } = {
        ...data,
        date: convertedDate,
        quantitySold: Number(data.quantitySold),
        saleRate: Number(data.saleRate),
        purchaseQuantity: Number(data.purchaseQuantity),
        purchaseRate: Number(data.purchaseRate),
      }

      // Add product details if selected
      if (selectedProduct) {
        dealData.grade = selectedProduct.grade
        dealData.company = selectedProduct.company
        dealData.specificGrade = selectedProduct.specificGrade
      }

      // Add selected inventory items if selling from inventory
      if (data.saleSource === 'inventory' && selectedInventoryItems.length > 0) {
        dealData.selectedInventoryItems = selectedInventoryItems
      }

      const createdDeal = await createDeal(dealData)
      
      if (createdDeal) {
        let toastMessage = 'Deal registered successfully! WhatsApp notifications sent.'
        
        // Send additional notification if phone number is provided
        if (additionalPhoneNumber.trim()) {
          const additionalResult = await sendAdditionalNotification(additionalPhoneNumber, createdDeal)
          
          if (additionalResult && !additionalResult.success) {
            // Show warning about additional notification failure
            toast.success(`${toastMessage}\n⚠️ Additional notification failed: ${additionalResult.error}`, {
              duration: 6000
            })
          } else if (additionalResult && additionalResult.success) {
            toastMessage += ` Additional notification sent to ${additionalPhoneNumber}.`
            toast.success(toastMessage)
          } else {
            toast.success(toastMessage)
          }
        } else {
          toast.success(toastMessage)
        }
        
        // Reset form
        reset({
          date: formatDateToDDMMYYYY(),
          deliveryTerms: 'delivered',
          saleSource: 'new'
        })
        
        // Reset inventory selection and additional phone
        setSelectedInventoryItems([])
        setSelectedProduct(null)
        setHasInventoryForProduct(false)
        setAdditionalPhoneNumber('')
        
        if (onSuccess) {
          onSuccess(createdDeal)
        }
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to register deal. Please try again.')
      console.error('Error registering deal:', error)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading form data...</span>
      </div>
    )
  }

  // Convert data for AutoComplete components
  const customerOptions = customers.map(customer => ({
    value: customer.partyName,
    label: customer.partyName
  }))

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.partyName,
    label: supplier.partyName
  }))

  const productOptions = createSearchableProductOptions(products)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto w-full px-4"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="w-8 h-8 mr-3 text-primary-600" />
          Register New Deal
        </h1>
        <p className="text-gray-600 mt-2">
          Process a new polymer trading transaction with automatic WhatsApp notifications
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Deal Information */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center mb-6">
            <Calendar className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Basic Deal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('date', { required: 'Date is required' })}
                className={cn("input-field", errors.date && "border-red-500")}
                placeholder="dd/mm/yyyy"
              />
              {errors.date && (
                <p className="error-message">{errors.date.message}</p>
              )}
            </div>

            <SearchableAutoComplete
              label="Sale Party (Customer)"
              required
              options={customerOptions.map(opt => ({
                value: opt.value,
                label: opt.label,
                searchableFields: {}
              }))}
              value={watch('saleParty') || ''}
              onChange={(value) => setValue('saleParty', value)}
              placeholder="Search customer..."
              error={errors.saleParty?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Sold (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('quantitySold', { 
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be greater than 0' }
                })}
                className={cn("input-field", errors.quantitySold && "border-red-500")}
                placeholder="Enter quantity in kg"
              />
              {errors.quantitySold && (
                <p className="error-message">{errors.quantitySold.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Rate (₹/kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('saleRate', { 
                  required: 'Sale rate is required',
                  min: { value: 0.01, message: 'Rate must be greater than 0' }
                })}
                className={cn("input-field", errors.saleRate && "border-red-500")}
                placeholder="Enter rate per kg"
              />
              {errors.saleRate && (
                <p className="error-message">{errors.saleRate.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Terms <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value="delivered"
                    {...register('deliveryTerms')}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Delivered</span>
                </motion.label>
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value="pickup"
                    {...register('deliveryTerms')}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Ex-Warehouse (Pickup)</span>
                </motion.label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Comments
              </label>
              <textarea
                {...register('saleComments')}
                rows={3}
                className="input-field resize-none"
                placeholder="Additional notes about the sale..."
              />
            </div>
          </div>
        </motion.div>

        {/* Product Information */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center mb-6">
            <Package className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SearchableAutoComplete
                label="Product Code"
                required
                options={productOptions}
                value={productCode || ''}
                onChange={(value) => setValue('productCode', value)}
                placeholder="Search by product code, grade, company, or specific grade..."
                error={errors.productCode?.message}
              />
            </div>

            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 bg-primary-50 p-4 rounded-xl border border-primary-200"
              >
                <h3 className="font-medium text-primary-900 mb-2">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-primary-600 font-medium">Grade:</span>
                    <p className="text-primary-800">{selectedProduct.grade}</p>
                  </div>
                  <div>
                    <span className="text-primary-600 font-medium">Company:</span>
                    <p className="text-primary-800">{selectedProduct.company}</p>
                  </div>
                  <div>
                    <span className="text-primary-600 font-medium">Specific Grade:</span>
                    <p className="text-primary-800">{selectedProduct.specificGrade}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Material Source */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center mb-6">
            <Truck className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Material Source</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sale Source <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value="new"
                    {...register('saleSource')}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">New Material</span>
                </motion.label>
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value="inventory"
                    {...register('saleSource')}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">From Inventory</span>
                </motion.label>
              </div>
            </div>

            {saleSource === 'inventory' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {selectedProduct && hasInventoryForProduct ? (
                  <InventorySelector
                    productCode={selectedProduct.productCode || ''}
                    grade={selectedProduct.grade || ''}
                    company={selectedProduct.company || ''}
                    specificGrade={selectedProduct.specificGrade || ''}
                    requiredQuantity={watch('quantitySold') ? Number(watch('quantitySold')) : 0}
                    onSelectionChange={handleInventorySelection}
                    onProductAutoFill={handleProductAutoFill}
                  />
                ) : selectedProduct && !hasInventoryForProduct ? (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                      <p className="text-orange-800">
                        No inventory available for this product. Please use "New Material" option.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <p className="text-blue-800">
                        Please select a product first to see available inventory.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Purchase Details - Only show for new material */}
        {saleSource === 'new' && (
          <motion.div 
            variants={itemVariants} 
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Purchase Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <SearchableAutoComplete
                  label="Purchase Party (Supplier)"
                  required
                  options={supplierOptions.map(opt => ({
                    value: opt.value,
                    label: opt.label,
                    searchableFields: {}
                  }))}
                  value={watch('purchaseParty') || ''}
                  onChange={(value) => setValue('purchaseParty', value)}
                  placeholder="Search supplier..."
                  error={errors.purchaseParty?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Quantity (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('purchaseQuantity', { 
                      required: 'Purchase quantity is required',
                      min: { value: 0.01, message: 'Quantity must be greater than 0' }
                    })}
                    className={cn("input-field", errors.purchaseQuantity && "border-red-500")}
                    placeholder="Enter quantity in kg"
                  />
                  {errors.purchaseQuantity && (
                    <p className="error-message">{errors.purchaseQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Rate (₹/kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('purchaseRate', { 
                      required: 'Purchase rate is required',
                      min: { value: 0.01, message: 'Rate must be greater than 0' }
                    })}
                    className={cn("input-field", errors.purchaseRate && "border-red-500")}
                    placeholder="Enter rate per kg"
                  />
                  {errors.purchaseRate && (
                    <p className="error-message">{errors.purchaseRate.message}</p>
                  )}
                </div>
              </div>

              <div className="pb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  {...register('warehouse')}
                  className="input-field w-full"
                  placeholder="Enter warehouse location"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          </div>

          <div className="space-y-4">
            {saleSource === 'new' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Comments
                </label>
                <textarea
                  {...register('purchaseComments')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Additional notes about the purchase..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Comments
              </label>
              <textarea
                {...register('finalComments')}
                rows={3}
                className="input-field resize-none"
                placeholder="Any final notes or instructions..."
              />
            </div>
          </div>
        </motion.div>

        {/* Additional Notification */}
        <motion.div variants={itemVariants}>
          <AdditionalNotificationInput
            value={additionalPhoneNumber}
            onChange={setAdditionalPhoneNumber}
            placeholder="Enter phone number for additional notification (optional)"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-end space-x-4"
        >
          {onCancel && (
            <motion.button
              type="button"
              className="btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
            >
              Cancel
            </motion.button>
          )}

          <motion.button
            type="button"
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              reset({
                date: formatDateToDDMMYYYY(),
                deliveryTerms: 'delivered',
                saleSource: 'new'
              })
              setSelectedProduct(null)
              setAdditionalPhoneNumber('')
            }}
          >
            Reset Form
          </motion.button>

          <motion.button
            type="submit"
            disabled={creating}
            className={cn(
              "btn-primary flex items-center space-x-2",
              creating && "opacity-50 cursor-not-allowed"
            )}
            whileHover={!creating ? { scale: 1.02 } : {}}
            whileTap={!creating ? { scale: 0.98 } : {}}
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Register Deal</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  )
}