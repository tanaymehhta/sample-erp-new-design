import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  History, 
  Package, 
  BarChart3, 
  Menu, 
  X,
  RefreshCw,
  Factory,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/new-deal', icon: FileText, label: 'New Deal', color: 'text-green-600' },
  { path: '/history', icon: History, label: 'History', color: 'text-blue-600' },
  { path: '/inventory', icon: Package, label: 'Inventory', color: 'text-purple-600' },
  { path: '/price-list', icon: DollarSign, label: 'Price List', color: 'text-yellow-600' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-orange-600' },
]

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const location = useLocation()

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data synced successfully!')
    } catch (error) {
      toast.error('Sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.header 
        className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/">
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-primary-600 p-2 rounded-xl">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Polymer Trading</h1>
                  <p className="text-xs text-gray-500">Management System</p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`tab-button ${isActive ? 'active' : ''} flex items-center space-x-2`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleSync}
                disabled={isSyncing}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </span>
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-primary-600 text-white' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Error Boundary Placeholder */}
      <div id="error-display" className="fixed bottom-4 left-4 max-w-md z-50">
        {/* Error messages will be displayed here */}
      </div>
    </div>
  )
}