import { useState } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'
import { TimeRange, BusinessFilter } from '../types'
import { cn } from '../../../shared/utils/cn'

interface QuickFiltersProps {
  filters: BusinessFilter
  onFiltersChange: (filters: BusinessFilter) => void
  customers: string[]
}

const TIME_RANGES = [
  { value: 'today' as TimeRange, label: 'Today' },
  { value: 'this-week' as TimeRange, label: 'This Week' },
  { value: 'this-month' as TimeRange, label: 'This Month' },
  { value: 'last-month' as TimeRange, label: 'Last Month' },
  { value: 'this-quarter' as TimeRange, label: 'This Quarter' },
  { value: 'last-quarter' as TimeRange, label: 'Last Quarter' },
  { value: 'this-year' as TimeRange, label: 'This Year' },
]

export default function QuickFilters({ filters, onFiltersChange, customers }: QuickFiltersProps) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const currentTimeLabel = TIME_RANGES.find(t => t.value === filters.timeRange)?.label || 'This Month'
  const currentCustomerLabel = filters.customers.length === 0 
    ? 'All Customers' 
    : filters.customers.length === 1 
      ? filters.customers[0]
      : `${filters.customers.length} Customers`

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    onFiltersChange({ ...filters, timeRange })
    setShowTimeDropdown(false)
  }

  const handleCustomerToggle = (customer: string) => {
    const newCustomers = filters.customers.includes(customer)
      ? filters.customers.filter(c => c !== customer)
      : [...filters.customers, customer]
    
    onFiltersChange({ ...filters, customers: newCustomers })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      timeRange: 'all-time',
      status: [],
      searchTerm: '',
      products: [],
      companies: [],
      grades: [],
      specificGrades: [],
      valueRange: null,
      customers: [],
      suppliers: [],
      deliveryMethod: [],
      dealSource: [],
      warehouse: [],
      quantityRange: null,
      dateFrom: undefined,
      dateTo: undefined,
      quickFilter: undefined,
      deliveryTerms: undefined
    })
  }

  const hasActiveFilters = filters.customers.length > 0 || 
                          filters.products.length > 0 || 
                          filters.suppliers.length > 0 ||
                          filters.deliveryMethod.length > 0 ||
                          filters.dealSource.length > 0 ||
                          filters.warehouse.length > 0 ||
                          filters.valueRange !== null ||
                          filters.quantityRange !== null ||
                          filters.searchTerm !== ''

  const filteredCustomers = customerSearch 
    ? customers.filter(c => c.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers.slice(0, 10) // Show top 10 customers

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Time Range Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{currentTimeLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showTimeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {TIME_RANGES.map(timeRange => (
                    <button
                      key={timeRange.value}
                      onClick={() => handleTimeRangeChange(timeRange.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-50",
                        filters.timeRange === timeRange.value && "bg-blue-50 text-blue-600 font-medium"
                      )}
                    >
                      {timeRange.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-gray-50",
                filters.customers.length > 0 
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              )}
            >
              <span className="font-medium">{currentCustomerLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCustomerDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="py-1 max-h-48 overflow-y-auto">
                  {filteredCustomers.map(customer => (
                    <label
                      key={customer}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.customers.includes(customer)}
                        onChange={() => handleCustomerToggle(customer)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{customer}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  )
}