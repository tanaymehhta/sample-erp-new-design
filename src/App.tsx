import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { Layout, ErrorBoundary } from './shared/components'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const NewDeal = lazy(() => import('./pages/NewDeal'))
const DealsHistory = lazy(() => import('./pages/DealsHistory'))
const Inventory = lazy(() => import('./pages/Inventory'))
const PriceList = lazy(() => import('./pages/PriceList'))
const Analytics = lazy(() => import('./pages/Analytics'))
const FilterDemo = lazy(() => import('./pages/FilterDemo'))

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
        <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
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
            path="/price-list" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <PriceList />
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
          <Route 
            path="/filter-demo" 
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FilterDemo />
              </motion.div>
            } 
          />
        </Routes>
        </Suspense>
      </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  )
}

export default App