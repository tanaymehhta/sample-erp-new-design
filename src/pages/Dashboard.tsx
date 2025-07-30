import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  TrendingUp, 
  Package, 
  Users, 
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDeals: 0,
    customers: 0,
    products: 0,
    inventory: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [dealsRes, customersRes, productsRes, inventoryRes] = await Promise.all([
        fetch('/api/deals/stats'),
        fetch('/api/customers/stats'),
        fetch('/api/products/stats'),
        fetch('/api/inventory/stats')
      ])

      const [dealsData, customersData, productsData, inventoryData] = await Promise.all([
        dealsRes.json(),
        customersRes.json(),
        productsRes.json(),
        inventoryRes.json()
      ])

      setStats({
        totalDeals: dealsData.success ? dealsData.data.total : 0,
        customers: customersData.success ? customersData.data.total : 0,
        products: productsData.success ? productsData.data.total : 0,
        inventory: inventoryData.success ? inventoryData.data.total : 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Polymer Trading
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Streamline your polymer trading operations with our comprehensive management system
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="card hover:shadow-xl cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalDeals}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Ready to start
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card hover:shadow-xl cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.customers}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Pre-loaded
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card hover:shadow-xl cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.products}</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <Package className="w-4 h-4 mr-1" />
                Catalog ready
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card hover:shadow-xl cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : Math.round(stats.inventory / 1000).toLocaleString()} tons</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Stock available
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/new-deal">
          <motion.div 
            className="card hover:shadow-xl cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Register New Deal</h3>
                <p className="text-primary-100 mb-4">
                  Start processing a new polymer trading transaction
                </p>
                <div className="flex items-center text-white font-medium">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <Plus className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/history">
          <motion.div 
            className="card hover:shadow-xl cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">View History</h3>
                <p className="text-gray-600 mb-4">
                  Browse past deals and analyze transaction patterns
                </p>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>View Deals</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* System Status */}
      <motion.div variants={itemVariants} className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Database Connection</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">WhatsApp API</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Google Sheets Sync</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}