import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Search, Filter, X } from 'lucide-react'
import { TimeRange, BusinessFilter } from '../types'
import { cn } from '../../../shared/utils/cn'
import DateRangePicker from './DateRangePicker'

interface DealsFiltersProps {
  filters: BusinessFilter
  onFiltersChange: (filters: BusinessFilter) => void
  availableProducts: string[]
  availableCompanies: string[]
  availableGrades: string[]
  availableSpecificGrades: string[]
  totalResults: number
}

const TIME_RANGES = [
  { value: 'all-time' as TimeRange, label: 'All Time' },
  { value: 'today' as TimeRange, label: 'Today' },
  { value: 'this-week' as TimeRange, label: 'This Week' },
  { value: 'this-month' as TimeRange, label: 'This Month' },
  { value: 'last-month' as TimeRange, label: 'Last Month' },
  { value: 'this-quarter' as TimeRange, label: 'This Quarter' },
  { value: 'last-quarter' as TimeRange, label: 'Last Quarter' },
  { value: 'this-year' as TimeRange, label: 'This Year' },
  { value: 'custom' as TimeRange, label: 'Custom Range' },
]


export default function DealsFilters({
  filters,
  onFiltersChange,
  availableProducts,
  availableCompanies,
  availableGrades,
  availableSpecificGrades,
  totalResults
}: DealsFiltersProps) {
  console.log('🎯 DealsFilters component is rendering!', { filters, totalResults })
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [showGradeDropdown, setShowGradeDropdown] = useState(false)
  const [showSpecificGradeDropdown, setShowSpecificGradeDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  const [productSearch, setProductSearch] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [gradeSearch, setGradeSearch] = useState('')
  const [specificGradeSearch, setSpecificGradeSearch] = useState('')
  
  const dateDropdownRef = useRef<HTMLDivElement>(null)
  const productDropdownRef = useRef<HTMLDivElement>(null)
  const companyDropdownRef = useRef<HTMLDivElement>(null)
  const gradeDropdownRef = useRef<HTMLDivElement>(null)
  const specificGradeDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false)
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false)
      }
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(event.target as Node)) {
        setShowGradeDropdown(false)
      }
      if (specificGradeDropdownRef.current && !specificGradeDropdownRef.current.contains(event.target as Node)) {
        setShowSpecificGradeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper function to close all dropdowns except the specified one
  const closeOtherDropdowns = (keepOpen: string) => {
    if (keepOpen !== 'date') setShowDateDropdown(false)
    if (keepOpen !== 'product') setShowProductDropdown(false)
    if (keepOpen !== 'company') setShowCompanyDropdown(false)
    if (keepOpen !== 'grade') setShowGradeDropdown(false)
    if (keepOpen !== 'specificGrade') setShowSpecificGradeDropdown(false)
  }

  const currentTimeLabel = TIME_RANGES.find(t => t.value === filters.timeRange)?.label || 'This Year'

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    if (timeRange === 'custom') {
      setShowDatePicker(true)
      setShowDateDropdown(false)
    } else {
      onFiltersChange({ ...filters, timeRange, dateFrom: undefined, dateTo: undefined })
      setShowDateDropdown(false)
    }
  }


  const handleProductToggle = (product: string) => {
    const newProducts = filters.products.includes(product)
      ? filters.products.filter(p => p !== product)
      : [...filters.products, product]
    
    onFiltersChange({ ...filters, products: newProducts })
  }

  const handleCompanyToggle = (company: string) => {
    const newCompanies = filters.companies.includes(company)
      ? filters.companies.filter(c => c !== company)
      : [...filters.companies, company]
    
    onFiltersChange({ ...filters, companies: newCompanies })
  }

  const handleGradeToggle = (grade: string) => {
    const newGrades = filters.grades.includes(grade)
      ? filters.grades.filter(g => g !== grade)
      : [...filters.grades, grade]
    
    onFiltersChange({ ...filters, grades: newGrades })
  }

  const handleSpecificGradeToggle = (specificGrade: string) => {
    const newSpecificGrades = filters.specificGrades.includes(specificGrade)
      ? filters.specificGrades.filter(sg => sg !== specificGrade)
      : [...filters.specificGrades, specificGrade]
    
    onFiltersChange({ ...filters, specificGrades: newSpecificGrades })
  }

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    onFiltersChange({ 
      ...filters, 
      timeRange: 'custom',
      dateFrom: startDate, 
      dateTo: endDate 
    })
    setShowDatePicker(false)
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
    })
  }

  const hasActiveFilters = filters.products.length > 0 || 
                          filters.companies.length > 0 ||
                          filters.grades.length > 0 ||
                          filters.specificGrades.length > 0 ||
                          filters.valueRange !== null ||
                          filters.searchTerm !== '' ||
                          filters.timeRange !== 'all-time'

  const filteredProducts = productSearch 
    ? availableProducts.filter(p => p.toLowerCase().includes(productSearch.toLowerCase()))
    : availableProducts.slice(0, 20)

  const filteredCompanies = companySearch 
    ? availableCompanies.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()))
    : availableCompanies.slice(0, 20)

  const filteredGrades = gradeSearch 
    ? availableGrades.filter(g => g.toLowerCase().includes(gradeSearch.toLowerCase()))
    : availableGrades.slice(0, 20)

  const filteredSpecificGrades = specificGradeSearch 
    ? availableSpecificGrades.filter(sg => sg.toLowerCase().includes(specificGradeSearch.toLowerCase()))
    : availableSpecificGrades.slice(0, 20)

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Primary Filter Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Date Filter */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => {
                  closeOtherDropdowns('date')
                  setShowDateDropdown(!showDateDropdown)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{currentTimeLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    {TIME_RANGES.map(timeRange => (
                      <button
                        key={timeRange.value}
                        onClick={() => handleTimeRangeChange(timeRange.value)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
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


            {/* Global Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals, companies, products..."
                  value={filters.searchTerm}
                  onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Results count */}
            <span className="text-sm text-gray-600">
              {totalResults.toLocaleString()} deals found
            </span>

            {/* Secondary Filters Toggle */}
            <button
              onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                showSecondaryFilters 
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showSecondaryFilters && "rotate-180")} />
            </button>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Filters */}
      {showSecondaryFilters && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Filter */}
            <div className="relative" ref={productDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <button
                onClick={() => {
                  closeOtherDropdowns('product')
                  setShowProductDropdown(!showProductDropdown)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg",
                  filters.products.length > 0 
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <span className="text-sm">
                  {filters.products.length === 0 
                    ? 'All Products' 
                    : filters.products.length === 1 
                      ? filters.products[0]
                      : `${filters.products.length} selected`
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showProductDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <label
                        key={product}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.products.includes(product)}
                          onChange={() => handleProductToggle(product)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{product}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company Filter */}
            <div className="relative" ref={companyDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <button
                onClick={() => {
                  closeOtherDropdowns('company')
                  setShowCompanyDropdown(!showCompanyDropdown)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg",
                  filters.companies.length > 0 
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <span className="text-sm">
                  {filters.companies.length === 0 
                    ? 'All Companies' 
                    : filters.companies.length === 1 
                      ? filters.companies[0]
                      : `${filters.companies.length} selected`
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showCompanyDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {filteredCompanies.map(company => (
                      <label
                        key={company}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.companies.includes(company)}
                          onChange={() => handleCompanyToggle(company)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{company}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grade Filter */}
            <div className="relative" ref={gradeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <button
                onClick={() => {
                  closeOtherDropdowns('grade')
                  setShowGradeDropdown(!showGradeDropdown)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg",
                  filters.grades.length > 0 
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <span className="text-sm">
                  {filters.grades.length === 0 
                    ? 'All Grades' 
                    : filters.grades.length === 1 
                      ? filters.grades[0]
                      : `${filters.grades.length} selected`
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showGradeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search grades..."
                      value={gradeSearch}
                      onChange={(e) => setGradeSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {filteredGrades.map(grade => (
                      <label
                        key={grade}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.grades.includes(grade)}
                          onChange={() => handleGradeToggle(grade)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specific Grade Filter */}
            <div className="relative" ref={specificGradeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Grade</label>
              <button
                onClick={() => {
                  closeOtherDropdowns('specificGrade')
                  setShowSpecificGradeDropdown(!showSpecificGradeDropdown)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg",
                  filters.specificGrades.length > 0 
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <span className="text-sm">
                  {filters.specificGrades.length === 0 
                    ? 'All Specific Grades' 
                    : filters.specificGrades.length === 1 
                      ? filters.specificGrades[0]
                      : `${filters.specificGrades.length} selected`
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSpecificGradeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search specific grades..."
                      value={specificGradeSearch}
                      onChange={(e) => setSpecificGradeSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {filteredSpecificGrades.map(specificGrade => (
                      <label
                        key={specificGrade}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.specificGrades.includes(specificGrade)}
                          onChange={() => handleSpecificGradeToggle(specificGrade)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{specificGrade}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Value Range Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deal Value Range</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Min:</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.valueRange?.[0] || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : 0
                    const max = filters.valueRange?.[1] || 1000000
                    onFiltersChange({ ...filters, valueRange: [min, max] })
                  }}
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Max:</span>
                <input
                  type="number"
                  placeholder="1000000"
                  value={filters.valueRange?.[1] || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : 1000000
                    const min = filters.valueRange?.[0] || 0
                    onFiltersChange({ ...filters, valueRange: [min, max] })
                  }}
                  className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onFiltersChange({ ...filters, valueRange: [0, 10000] })}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  &lt; ₹10K
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, valueRange: [10000, 100000] })}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  ₹10K-₹100K
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, valueRange: [100000, 10000000] })}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  &gt; ₹100K
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <DateRangePicker
          onSelect={handleDateRangeSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  )
}