import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, ErrorBoundary } from './shared/components'
import Dashboard from './pages/Dashboard'
import NewDeal from './pages/NewDeal'
import DealsHistory from './pages/DealsHistory'
import Inventory from './pages/Inventory'
import Analytics from './pages/Analytics'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
}

function App() {
  return (
    <ErrorBoundary>
      <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Dashboard />
              </motion.div>
            } 
          />
          <Route 
            path="/new-deal" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewDeal />
              </motion.div>
            } 
          />
          <Route 
            path="/history" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <DealsHistory />
              </motion.div>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Inventory />
              </motion.div>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Analytics />
              </motion.div>
            } 
          />
        </Routes>
      </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  )
}

export default App