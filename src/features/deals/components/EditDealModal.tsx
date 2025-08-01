import { useState, useEffect } from 'react'
import { X, Save, RotateCcw, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react'
import { Deal, CreateDealRequest } from '../types'
import { useDealService } from '../../../shared/providers/ServiceProvider'

interface EditDealModalProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  onSaved?: (updatedDeal: Deal) => void
}

interface FormData {
  date: string
  saleParty: string
  quantitySold: string
  saleRate: string
  deliveryTerms: 'delivered' | 'pickup'
  productCode: string
  grade: string
  company: string
  specificGrade: string
  saleSource: 'new' | 'inventory'
  purchaseParty: string
  purchaseQuantity: string
  purchaseRate: string
  saleComments: string
  purchaseComments: string
  finalComments: string
  warehouse: string
}

interface FormErrors {
  [key: string]: string
}

export default function EditDealModal({ deal, isOpen, onClose, onSaved }: EditDealModalProps) {
  const dealService = useDealService()
  const [formData, setFormData] = useState<FormData>({
    date: '',
    saleParty: '',
    quantitySold: '',
    saleRate: '',
    deliveryTerms: 'delivered',
    productCode: '',
    grade: '',
    company: '',
    specificGrade: '',
    saleSource: 'new',
    purchaseParty: '',
    purchaseQuantity: '',
    purchaseRate: '',
    saleComments: '',
    purchaseComments: '',
    finalComments: '',
    warehouse: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data when deal changes
  useEffect(() => {
    if (deal) {
      const newFormData: FormData = {
        date: deal.date,
        saleParty: deal.saleParty,
        quantitySold: deal.quantitySold.toString(),
        saleRate: deal.saleRate.toString(),
        deliveryTerms: deal.deliveryTerms,
        productCode: deal.productCode,
        grade: deal.grade || '',
        company: deal.company || '',
        specificGrade: deal.specificGrade || '',
        saleSource: deal.saleSource,
        purchaseParty: deal.purchaseParty,
        purchaseQuantity: deal.purchaseQuantity.toString(),
        purchaseRate: deal.purchaseRate.toString(),
        saleComments: deal.saleComments || '',
        purchaseComments: deal.purchaseComments || '',
        finalComments: deal.finalComments || '',
        warehouse: deal.warehouse || ''
      }
      setFormData(newFormData)
      setHasChanges(false)
      setErrors({})
      setSaveSuccess(false)
    }
  }, [deal])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaveSuccess(false)
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.saleParty.trim()) newErrors.saleParty = 'Sale party is required'
    if (!formData.quantitySold || parseFloat(formData.quantitySold) <= 0) {
      newErrors.quantitySold = 'Valid quantity is required'
    }
    if (!formData.saleRate || parseFloat(formData.saleRate) <= 0) {
      newErrors.saleRate = 'Valid sale rate is required'
    }
    if (!formData.productCode.trim()) newErrors.productCode = 'Product code is required'
    if (!formData.purchaseParty.trim()) newErrors.purchaseParty = 'Purchase party is required'
    if (!formData.purchaseQuantity || parseFloat(formData.purchaseQuantity) <= 0) {
      newErrors.purchaseQuantity = 'Valid purchase quantity is required'
    }
    if (!formData.purchaseRate || parseFloat(formData.purchaseRate) <= 0) {
      newErrors.purchaseRate = 'Valid purchase rate is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!deal || !validateForm()) return

    setSaving(true)
    try {
      const updateData: Partial<CreateDealRequest> = {
        date: formData.date,
        saleParty: formData.saleParty.trim(),
        quantitySold: parseFloat(formData.quantitySold),
        saleRate: parseFloat(formData.saleRate),
        deliveryTerms: formData.deliveryTerms,
        productCode: formData.productCode.trim(),
        grade: formData.grade.trim() || undefined,
        company: formData.company.trim() || undefined,
        specificGrade: formData.specificGrade.trim() || undefined,
        saleSource: formData.saleSource,
        purchaseParty: formData.purchaseParty.trim(),
        purchaseQuantity: parseFloat(formData.purchaseQuantity),
        purchaseRate: parseFloat(formData.purchaseRate),
        saleComments: formData.saleComments.trim() || undefined,
        purchaseComments: formData.purchaseComments.trim() || undefined,
        finalComments: formData.finalComments.trim() || undefined,
        warehouse: formData.warehouse.trim() || undefined,
      }

      const response = await dealService.updateDeal(deal.id, updateData)
      
      if (response.success && response.data) {
        setSaveSuccess(true)
        setHasChanges(false)
        onSaved?.(response.data)
        
        // Auto-close after success animation
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to update deal:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (deal) {
      const resetData: FormData = {
        date: deal.date,
        saleParty: deal.saleParty,
        quantitySold: deal.quantitySold.toString(),
        saleRate: deal.saleRate.toString(),
        deliveryTerms: deal.deliveryTerms,
        productCode: deal.productCode,
        grade: deal.grade || '',
        company: deal.company || '',
        specificGrade: deal.specificGrade || '',
        saleSource: deal.saleSource,
        purchaseParty: deal.purchaseParty,
        purchaseQuantity: deal.purchaseQuantity.toString(),
        purchaseRate: deal.purchaseRate.toString(),
        saleComments: deal.saleComments || '',
        purchaseComments: deal.purchaseComments || '',
        finalComments: deal.finalComments || '',
        warehouse: deal.warehouse || ''
      }
      setFormData(resetData)
      setHasChanges(false)
      setErrors({})
      setSaveSuccess(false)
    }
  }

  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    required = false,
    className = ''
  }: {
    label: string
    field: keyof FormData
    type?: string
    required?: boolean
    className?: string
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`input-field ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
      />
      {errors[field] && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[field]}
        </div>
      )}
    </div>
  )

  const SelectField = ({
    label,
    field,
    options,
    required = false,
    className = ''
  }: {
    label: string
    field: keyof FormData
    options: { value: string; label: string }[]
    required?: boolean
    className?: string
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`input-field ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (!deal) return null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="w-full max-w-4xl bg-white rounded-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Edit Deal</h2>
                    <p className="text-sm text-gray-600">Deal #{deal.id.slice(-8)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {hasChanges && !saveSuccess && (
                    <div className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                      Unsaved changes
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Saved!
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sale Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Sale Information
                    </h3>
                    
                    <InputField label="Date" field="date" type="date" required />
                    <InputField label="Sale Party" field="saleParty" required />
                    <InputField label="Quantity Sold (kg)" field="quantitySold" type="number" required />
                    <InputField label="Sale Rate (₹)" field="saleRate" type="number" required />
                    
                    <SelectField 
                      label="Delivery Terms" 
                      field="deliveryTerms" 
                      options={[
                        { value: 'delivered', label: 'Delivered' },
                        { value: 'pickup', label: 'Pickup' }
                      ]}
                      required
                    />

                    <SelectField 
                      label="Sale Source" 
                      field="saleSource" 
                      options={[
                        { value: 'new', label: 'New Purchase' },
                        { value: 'inventory', label: 'From Inventory' }
                      ]}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Comments
                      </label>
                      <textarea
                        value={formData.saleComments}
                        onChange={(e) => handleInputChange('saleComments', e.target.value)}
                        className="input-field"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Purchase Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Purchase Information
                    </h3>
                    
                    <InputField label="Purchase Party" field="purchaseParty" required />
                    <InputField label="Purchase Quantity (kg)" field="purchaseQuantity" type="number" required />
                    <InputField label="Purchase Rate (₹)" field="purchaseRate" type="number" required />
                    <InputField label="Warehouse" field="warehouse" />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Comments
                      </label>
                      <textarea
                        value={formData.purchaseComments}
                        onChange={(e) => handleInputChange('purchaseComments', e.target.value)}
                        className="input-field"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Product Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <InputField label="Product Code" field="productCode" required />
                      <InputField label="Grade" field="grade" />
                      <InputField label="Company" field="company" />
                      <InputField label="Specific Grade" field="specificGrade" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Final Comments
                      </label>
                      <textarea
                        value={formData.finalComments}
                        onChange={(e) => handleInputChange('finalComments', e.target.value)}
                        className="input-field"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving || saveSuccess}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
        </div>
      </div>
    </div>
  )
}