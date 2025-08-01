import { motion } from 'framer-motion'
import { Building2, Factory, Fuel } from 'lucide-react'
import { usePriceList } from '../hooks/usePriceList'
import { useMonthlyData } from '../hooks/useMonthlyData'
import { CompanyType, RateType } from '../types'
import MRPLPriceTable from './tables/MRPLPriceTable'
import NayaraPriceTable from './tables/NayaraPriceTable'
import SupremePriceTable from './tables/SupremePriceTable'
import MonthlyDataToggle from './MonthlyDataToggle'

const PriceListMain = () => {
  const {
    selectedCompany,
    selectedRateType,
    showHistoricalData,
    priceData,
    historicalData,
    supremeDiscounts,
    loading,
    error,
    setSelectedCompany,
    setSelectedRateType,
    toggleHistoricalData,
    setSelectedMonth
  } = usePriceList()

  const { getAvailableMonths: getMonthOptions } = useMonthlyData()

  const companies = [
    { id: 'mrpl' as CompanyType, name: 'MRPL', icon: Factory, color: 'bg-blue-600' },
    { id: 'nayara' as CompanyType, name: 'Nayara', icon: Fuel, color: 'bg-green-600' },
    { id: 'supreme' as CompanyType, name: 'Supreme', icon: Building2, color: 'bg-purple-600' }
  ]

  const rateTypes = [
    { id: 'stockPoint' as RateType, name: 'Stock Point Rate' },
    { id: 'exPlant' as RateType, name: 'Ex-Plant Rate' }
  ]

  const availableMonths = getMonthOptions()

  const handleMonthSelect = (month: string | undefined) => {
    setSelectedMonth(month)
  }

  const renderCurrentTable = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )
    }

    switch (selectedCompany) {
      case 'mrpl':
        return (
          <MRPLPriceTable 
            data={priceData} 
            rateType={selectedRateType} 
            loading={loading}
          />
        )
      case 'nayara':
        return (
          <NayaraPriceTable 
            data={priceData} 
            rateType={selectedRateType} 
            loading={loading}
          />
        )
      case 'supreme':
        return (
          <SupremePriceTable 
            data={priceData} 
            discounts={supremeDiscounts}
            rateType={selectedRateType} 
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Price List Management</h1>
        <p className="text-gray-600">Manage pricing data across all companies</p>
      </div>

      {/* Company Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Company</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map((company) => {
            const Icon = company.icon
            const isSelected = selectedCompany === company.id
            
            return (
              <motion.button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `${company.color} text-white border-transparent shadow-lg`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold text-lg">{company.name}</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Rate Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Type</h2>
        <div className="flex space-x-4">
          {rateTypes.map((rateType) => {
            const isSelected = selectedRateType === rateType.id
            
            return (
              <motion.button
                key={rateType.id}
                onClick={() => setSelectedRateType(rateType.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {rateType.name}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Current Price Table - Always Visible */}
      <div className="space-y-4">
        {renderCurrentTable()}
        
        {/* Historical Data Toggle */}
        <MonthlyDataToggle
          showHistoricalData={showHistoricalData}
          onToggle={toggleHistoricalData}
          selectedMonth={undefined}
          onMonthSelect={handleMonthSelect}
          availableMonths={availableMonths}
        >
          {showHistoricalData && historicalData.length > 0 && (
            <div className="mt-4">
              {selectedCompany === 'mrpl' && (
                <MRPLPriceTable 
                  data={historicalData} 
                  rateType={selectedRateType} 
                  loading={false}
                />
              )}
              {selectedCompany === 'nayara' && (
                <NayaraPriceTable 
                  data={historicalData} 
                  rateType={selectedRateType} 
                  loading={false}
                />
              )}
              {selectedCompany === 'supreme' && (
                <SupremePriceTable 
                  data={historicalData} 
                  discounts={supremeDiscounts}
                  rateType={selectedRateType} 
                  loading={false}
                />
              )}
            </div>
          )}
        </MonthlyDataToggle>
      </div>
    </div>
  )
}

export default PriceListMain